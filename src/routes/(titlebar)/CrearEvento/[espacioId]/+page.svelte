<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import Button from "$lib/components/Button.svelte";
	import ComboBox from "$lib/components/ComboBox.svelte";
	import DatePicker, { formatDate } from "$lib/components/DatePicker.svelte";
	import MapDisplay from "$lib/components/MapDisplay.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import PopupSeleccion from "$lib/components/PopupSeleccion.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import type DTOCrearEvento from "$lib/dtos/eventos/DTOCrearEvento";
	import type DTODatosCreacionEvento from "$lib/dtos/eventos/DTODatosCreacionEvento";
	import { HttpError } from "$lib/request/request";
	import { CronogramaService } from "$lib/services/CronogramaService";
	import { DisciplinasService } from "$lib/services/DisciplinasService";
	import { EventosService } from "$lib/services/EventosService";
	import { ModosDeEventoService } from "$lib/services/ModosDeEventoService";
	import { permisos, token } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

	let espacioId: number;
	let datosCreacion: DTODatosCreacionEvento | null = null;
	let esEspacioNoRegistrado = false;

	onMount(async () => {
		if (get(token) === "") {
			goto("/");
		}

		if (!get(permisos).includes("OrganizacionEventos")) {
			goto("/");
		}

		const espacioIdParam = $page.params.espacioId as string;
		espacioId = parseInt(espacioIdParam);
		esEspacioNoRegistrado = espacioId === -1;

		try {
			datosCreacion = await EventosService.obtenerDatosCreacionEvento(esEspacioNoRegistrado ? null : espacioId);
            fechaMaxBusquedaHorarios.setDate(fechaMaxBusquedaHorarios.getDate() + datosCreacion.diasHaciaAdelante - 1)
            
            // Cargar periodos libres, para cuando se organiza de forma libre
            if (datosCreacion.administrador) {
                let periodosLibresTmp = await CronogramaService.obtenerPeriodosLibres(espacioId);
                let ix = 0;
                periodosLibresTmp.forEach((item) => {
                    let formatted = formatDate(item.fechaHoraDesde, true) + " - " + formatDate(item.fechaHoraHasta, true);
                    periodosLibres.cb.set(ix, formatted);
                    periodosLibres.map.set(ix, {
                        desde: item.fechaHoraDesde,
                        hasta: item.fechaHoraHasta
                    })
                    ix++;
                });
                periodosLibres = {...periodosLibres}
            }
        } catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
	});

	let data: DTOCrearEvento = {
		nombre: "",
		descripcion: "",
		idEspacio: null,
		usarCronograma: true,
		fechaDesde: null,
		fechaHasta: null,
		horarioId: -1,
		disciplinas: [],
		direccion: "",
		ubicacion: {
			latitud: undefined,
			longitud: undefined
		},
		modos: [],
		tipoInscripcion: -1,
		precio: 0,
		maxParticipantes: 2
	};

	let ubicacionMarcada: {x: number, y: number} | undefined = undefined;

	// Validation states
	$: warningNombreVisible = false;
	$: warningDireccionVisible = false;
	$: warningUbicacionVisible = false;
	$: warningPrecioVisible = false;
	$: warningMaxParticipantesVisible = false;
	$: warningHorarioVisible = false;

	// Error handling
	$: error = "";
	$: errorVisible = false;

	// Success popup
	$: popupExitoVisible = false;
	$: eventoId = -1;

	// Popup states
	$: popupDisciplinasVisible = false;
	$: popupModosVisible = false;

	// Selected items
	let disciplinasSeleccionadas: Map<number, string> = new Map();
	let modosSeleccionados: Map<number, string> = new Map();

	// ComboBox options
	let tiposInscripcionOptions: Map<number, string> = new Map();

	$: if (datosCreacion) {
		data.idEspacio = esEspacioNoRegistrado ? null : espacioId;
		
		tiposInscripcionOptions = new Map();
		datosCreacion.tiposInscripcion.forEach(tipo => {
			tiposInscripcionOptions.set(tipo.id, tipo.nombre);
		});

		// For private spaces with schedule, we would need to load schedules
		// This would require another service call that's not specified in the requirements
	}

	// Search functions for PopupSeleccion
	async function buscarDisciplinas(val: string) {
		let response;
		if (esEspacioNoRegistrado) {
			response = await DisciplinasService.buscar(val);
		} else {
			response = await DisciplinasService.buscarPorEspacio(val, espacioId);
		}

		let ret: Map<number, string> = new Map();
		response.forEach((item) => {
			ret.set(item.id, item.nombre);
		});

		return ret;
	}

	async function buscarModos(val: string) {
		let response = await ModosDeEventoService.buscar(val);

		let ret: Map<number, string> = new Map();
		response.forEach((item) => {
			ret.set(item.id, item.nombre);
		});

		return ret;
	}

	// Validation functions
	function validateNombre(val: string) {
		if (val.trim() === "") {
			return {
				valid: false,
				reason: "El nombre del evento es obligatorio"
			};
		}
		return {
			valid: true,
			reason: undefined
		};
	}

	function validateDireccion(val: string) {
		if (val.trim() === "") {
			return {
				valid: false,
				reason: "La dirección es obligatoria"
			};
		}
		return {
			valid: true,
			reason: undefined
		};
	}

	function validatePrecio(val: string) {
		const num = parseFloat(val);
		if (isNaN(num) || num < 0) {
			return {
				valid: false,
				reason: "El precio debe ser un número no negativo"
			};
		}
		return {
			valid: true,
			reason: undefined
		};
	}

	function validateMaxParticipantes(val: string) {
		const num = parseInt(val);
		if (!/^\-?[0-9]+$/.test(val)) {
			return {
				valid: false,
				reason: "La cantidad máxima de participantes debe ser un número entero"
			};
		}
		if (num < 2) {
			return {
				valid: false,
				reason: "Debe haber al menos dos participantes"
			};
		}
		return {
			valid: true,
			reason: undefined
		};
	}

	async function crearEvento() {
		// Reset warnings
		warningNombreVisible = false;
		warningDireccionVisible = false;
		warningUbicacionVisible = false;
		warningPrecioVisible = false;
		warningMaxParticipantesVisible = false;
		warningHorarioVisible = false;

		let hasErrors = false;

		// Validate required fields
		if (data.nombre.trim() === "") {
			warningNombreVisible = true;
			hasErrors = true;
		}

		if (esEspacioNoRegistrado && data.direccion.trim() === "") {
			warningDireccionVisible = true;
			hasErrors = true;
		}

		if (esEspacioNoRegistrado && ubicacionMarcada === undefined) {
			warningUbicacionVisible = true;
			hasErrors = true;
		}

		if (data.precio < 0) {
			warningPrecioVisible = true;
			hasErrors = true;
		}

		if (!validateMaxParticipantes(maxParticipantesString).valid) {
			warningMaxParticipantesVisible = true;
			hasErrors = true;
		}

        if (!datosCreacion?.espacioPublico && data.usarCronograma && !horarioSeleccionado) {
            warningHorarioVisible = true;
			hasErrors = true;
        }

		if (hasErrors) {
			return;
		}

		// Set location data for unregistered spaces
		if (esEspacioNoRegistrado && ubicacionMarcada) {
			data.ubicacion.latitud = ubicacionMarcada.x;
			data.ubicacion.longitud = ubicacionMarcada.y;
		}

		// Set selected disciplines and modes
		data.disciplinas = Array.from(disciplinasSeleccionadas.keys());
		data.modos = Array.from(modosSeleccionados.keys());

		try {
			eventoId = await EventosService.crearEvento(data);
			popupExitoVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
	}
  

	// Convert price to string for TextField
	$: precioString = data.precio.toString();
	$: data.precio = parseFloat(precioString) || 0;

	// Convert maxParticipantes to string for TextField  
	let maxParticipantesString = "2";
    $: data.maxParticipantes = parseInt(maxParticipantesString) || 2

    function toggleUsarCronograma(usar: boolean) {
        if (data.usarCronograma !== usar) {
            data.fechaDesde = null;
            data.fechaHasta = null;
            horarioSeleccionado = false;
        }
        data.usarCronograma = usar;
    }

    //Espacio privado con cronograma
    $: popupHorarioVisible = false;
    $: fechaBusquedaHorarios = new Date();
    let fechaMaxBusquedaHorarios = new Date();

    $: horarios = [] as {id: number, fechaHoraDesde: Date, fechaHoraHasta: Date, precioOrganizacion: number}[];

    async function buscarHorarios() {
        try {
            horarios = await CronogramaService.buscarHorariosDisponibles(espacioId, fechaBusquedaHorarios);
            selectedHorarioId = null;
        } catch (e) {
            if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
        }
    }

    function formatTime(time: Date) {
        time = new Date(time);
        return ("" + time.getHours()).padStart(2, "0") + ":" + ("" + time.getMinutes()).padStart(2, "0");
    }

    $: selectedHorarioId = null as number | null;
    $: precioOrganizacion = 0;
    $: horarioSeleccionado = false;

    function openPopupHorario() {
        popupHorarioVisible = true;
        buscarHorarios();
    }

    function closePopupHorario() {
        popupHorarioVisible = false;
        selectedHorarioId = null;
        horarios = [];
    }

    function aceptarPopupHorario() {
        popupHorarioVisible = false;

        if (selectedHorarioId !== null) {
            horarios.forEach(h => {
                if (h.id === selectedHorarioId) {
                    data.fechaDesde =  h.fechaHoraDesde
                    data.fechaHasta =  h.fechaHoraHasta
                    precioOrganizacion = h.precioOrganizacion;
                }
            })
        }
        warningHorarioVisible = false;
        horarioSeleccionado = true;
    }


    // Espacio privado sin cronograma
    
    $: periodosLibres = {
        cb: new Map<number, string>(),
        map:new Map<number, {desde: Date, hasta: Date | null}>()
    };
    $: selectedPeriodoLibre = null as number | null;
    $: selectedPeriodoLibreData = selectedPeriodoLibre !== null ? periodosLibres.map.get(selectedPeriodoLibre) : undefined;

    $: periodoLibreMinDate = selectedPeriodoLibreData !== undefined ? Math.max((new Date()).getTime(), (new Date(selectedPeriodoLibreData.desde)).getTime()) : new Date();
    $: periodoLibreMaxDate = selectedPeriodoLibreData !== undefined ? (selectedPeriodoLibreData.hasta !== null ? (new Date(selectedPeriodoLibreData.hasta)).getTime() : null) : new Date();
</script>

<Popup
    title="Seleccionar horario"
    bind:visible={popupHorarioVisible}
    fitW
>
    <div class="grow overflow-y-auto">
        <div class="flex items-center w-fit gap-2">
            <DatePicker minDate={new Date()} maxDate={fechaMaxBusquedaHorarios} bind:value={fechaBusquedaHorarios} label=""/>
            <Button action={buscarHorarios}>Buscar</Button>
        </div>
        {#if horarios.length > 0}
            <div>
                <span>Horarios:</span>
                <div class="flex flex-col mt-2">
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    {#each horarios as h}
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <div class="item flex shrink gap-2 cursor-pointer hover:text-dark" on:click={() => {selectedHorarioId = h.id}}>
                            <span data-value={h.id}>{formatTime(h.fechaHoraDesde)} - {formatTime(h.fechaHoraHasta)}</span>
                            {#if selectedHorarioId === h.id}
                                <span class="checkContainer">
                                    <img src={"/icons/check.png"} alt="Seleccionado" class="object-contain">
                                </span>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
        <Warning visible={horarios.length === 0} text="No hay horarios disponibles para el día seleccionado. Intente en otro."/>
    </div>
    <div class="flex gap-2 h-fit p-2 justify-center items-center">
        <Button action={closePopupHorario}>Cancelar</Button>
        <Button action={aceptarPopupHorario} disabled={selectedHorarioId === null}>Aceptar</Button>
    </div>
</Popup>

<PopupSeleccion 
	title="Seleccionar disciplinas" 
	multiple={true} 
	bind:visible={popupDisciplinasVisible} 
	searchFunction={buscarDisciplinas} 
	bind:selected={disciplinasSeleccionadas}
/>

<PopupSeleccion 
	title="Seleccionar modos de evento" 
	multiple={true} 
	bind:visible={popupModosVisible} 
	searchFunction={buscarModos} 
	bind:selected={modosSeleccionados}
/>


{#if datosCreacion}
<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-m text-center">
			Organizar evento
		</h1>

		<TextField 
			label="Nombre del evento" 
			bind:value={data.nombre} 
			validate={validateNombre} 
			forceValidate={warningNombreVisible}
		/>

		<TextField 
			label="Descripción del evento" 
			multiline 
			bind:value={data.descripcion} 
			rows={6}
		/>

		{#if !esEspacioNoRegistrado}
            <div class="mb-2 md:flex justify-start items-center gap-1">
                <span>Espacio:</span>
                <br/>
                <span>{datosCreacion.nombreEspacio}</span>
            </div>
        {/if}

		{#if !esEspacioNoRegistrado && datosCreacion?.administrador}
			<div class="mb-2 md:flex justify-start items-center gap-2">
				<span>Organizar evento:</span>
				<div class="flex gap-2 mt-1 border rounded-lg p-1 w-full">
					<Button 
						action={() => toggleUsarCronograma(true)}
						classes="grow { + data.usarCronograma ? "" : "bg-white [&>span]:text-black"}"
					>
						<span>Según cronograma</span>
					</Button>
					<Button 
						action={() => toggleUsarCronograma(false)}
						classes="grow {!data.usarCronograma ? "" : "bg-white [&>span]:text-black"}"
					>
						<span>De forma libre</span>
					</Button>
				</div>
			</div>
		{/if}

		{#if datosCreacion?.espacioPublico}
            <!--Público-->
            <DatePicker range time minDate={new Date()} bind:startDate={data.fechaDesde} bind:endDate={data.fechaHasta} label="Fecha y Hora"/>
            <span>Hay n eventos organizados en este espacio para este horario</span>
		{:else if esEspacioNoRegistrado}
            <!--No registrado-->
            <TextField 
				label="Dirección" 
				bind:value={data.direccion} 
				validate={validateDireccion} 
				forceValidate={warningDireccionVisible}
			/>

			<div class="mb-2">
				<span>Ubicación</span>
				<MapDisplay 
					latitude={-32.89084} 
					longitude={-68.82717} 
					bind:marked={ubicacionMarcada} 
					zoom={12}
				/>
				<Warning text="La ubicación es obligatoria" visible={warningUbicacionVisible}/>
			</div>
        {:else if !datosCreacion?.espacioPublico && data.usarCronograma}
            <!--Privado con cronograma-->
            <div class="md:flex justify-start items-center">
                <span class="text-s flex flex-row gap-2 items-center">Horario: <Button classes="text-xs" action={openPopupHorario}>Cambiar</Button></span>
                {#if horarioSeleccionado}
                    <div class="ml-4 flex flex-col justify-start items-center md:flex-row md:justify-center md:gap-2">
                        <div>{formatDate(data.fechaDesde, true)}</div>
                        <div>a</div>
                        <div>{formatDate(data.fechaHasta, true)}</div>
                    </div>
                    {#if !datosCreacion?.administrador}
                        <span>Cuota por organización: {precioOrganizacion}</span>
                    {/if}
                {/if}
            </div>
            <Warning visible={warningHorarioVisible} text="Es obligatorio seleccionar el horario"/>
        {:else if !datosCreacion?.espacioPublico && !data.usarCronograma && datosCreacion?.administrador}
            <!--Privado sin cronograma-->
            <div>
                <span>Periodo</span>
                <!--TO-DO-->
                <ComboBox 
                    options={periodosLibres.cb} 
                    bind:selected={selectedPeriodoLibre}
                    placeholder="Seleccione el periodo"
                />
            </div>
            {#if selectedPeriodoLibreData !== undefined}
                <DatePicker 
                    range 
                    time 
                    minDate={periodoLibreMinDate} 
                    maxDate={periodoLibreMaxDate} 
                    bind:startDate={data.fechaDesde} 
                    bind:endDate={data.fechaHasta} 
                    label="Fecha y Hora"
                />
		    {/if}
		{/if}

		<div class="mb-2 mt-2 flex flex-col gap-2 md:flex-row md:items-baseline">
			<div class="flex justify-start gap-2 items-baseline">
				<span>Disciplinas</span>
				<Button action={() => {popupDisciplinasVisible = true}}>Seleccionar</Button>
			</div>
			<div class="commaList">
				{#each disciplinasSeleccionadas as d}
					<span>{d[1]}</span>
				{/each}
			</div>
		</div>

		<div class="mb-2 mt-2 flex flex-col gap-2 md:flex-row md:items-baseline">
			<div class="flex justify-start gap-2 items-baseline">
				<span>Modos de evento</span>
				<Button action={() => {popupModosVisible = true}}>Seleccionar</Button>
			</div>
			<div class="commaList">
				{#each modosSeleccionados as m}
					<span>{m[1]}</span>
				{/each}
			</div>
		</div>

		<ComboBox 
			options={tiposInscripcionOptions} 
			bind:selected={data.tipoInscripcion} 
			placeholder="Tipo de inscripción"
		/>

        <div class="flex flex-col md:flex-row md:gap-2 md:items-baseline">
            <span>Precio de inscripción</span>
            <div class="mb-2 flex items-center gap-2">
                <span>$</span>
                <TextField 
                    label={null}
                    bind:value={precioString} 
                    validate={validatePrecio} 
                    forceValidate={warningPrecioVisible}
                />
            </div>
            <div class="text-xs">
                Precio más comisión: ${(data.precio * (1 + (datosCreacion?.comisionInscripcion || 0))).toFixed(2).replace(".", ",")}
            </div>
        </div>
		

		<TextField 
			label="Cantidad máxima de participantes" 
			bind:value={maxParticipantesString} 
			validate={validateMaxParticipantes} 
			forceValidate={warningMaxParticipantesVisible}
		/>
	</div>

	<div class="flex gap-2 h-fit p-2 justify-center items-center">
		<Button action={() => goto("/")}>Cancelar</Button>
		<Button action={crearEvento}>Aceptar</Button>
	</div>
</div>
{/if}

<PopupError bind:visible={errorVisible}>
	{error}
</PopupError>

<Popup bind:visible={popupExitoVisible} fitH fitW>
	Evento registrado exitosamente
	<div class="flex justify-center items-center w-full">
		<Button action={() => {goto(`/Evento/${eventoId}`)}}>Aceptar</Button>
	</div>
</Popup>

<style>
    .checkContainer {
        height: 23px;
        width: 23px;
        position: relative;
        overflow: hidden;
    }

    .checkContainer img {
        filter: drop-shadow(-100vw 0 0 var(--color-light));
        transform: translateX(100vw);
        user-select: none;
    }
</style>