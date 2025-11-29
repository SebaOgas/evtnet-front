<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import Button from "$lib/components/Button.svelte";
	import CheckBox from "$lib/components/CheckBox.svelte";
	import ComboBox from "$lib/components/ComboBox.svelte";
	import DatePicker, { formatDate } from "$lib/components/DatePicker.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import { startPopupPago } from "$lib/components/PopupPago.svelte";
	import PopupSeleccion from "$lib/components/PopupSeleccion.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import type DTOCrearEvento from "$lib/dtos/eventos/DTOCrearEvento";
	import type DTODatosCreacionEvento from "$lib/dtos/eventos/DTODatosCreacionEvento";
	import type DTOPago from "$lib/dtos/usuarios/DTOPago";
	import { HttpError } from "$lib/request/request";
	import { CronogramaService } from "$lib/services/CronogramaService";
	import { DisciplinasService } from "$lib/services/DisciplinasService";
	import { EspaciosService } from "$lib/services/EspaciosService";
	import { EventosService } from "$lib/services/EventosService";
	import { UsuariosService } from "$lib/services/UsuariosService";
	import { permisos, token, vinculadoMP } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

	let espacioId: number;
	let datosCreacion: DTODatosCreacionEvento | null = null;

	let subespaciosOpciones : Map<number, string> = new Map<number, string>();

	onMount(async () => {
		if (get(token) === "") {
			goto("/");
		}

		if (!get(permisos).includes("OrganizacionEventos")) {
			goto("/");
		}

		const espacioIdParam = $page.params.espacioId as string;
		espacioId = parseInt(espacioIdParam);

		try {
			datosCreacion = await EventosService.obtenerDatosCreacionEvento(espacioId);

			datosCreacion.subespacios.forEach(s => {
				subespaciosOpciones.set(s.id, s.nombre);
			})

			if (datosCreacion.espacioPublico) data.usarCronograma = false;
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
		idSubespacio: null,
		usarCronograma: true,
		fechaHoraInicio: null,
		fechaHoraFin: null,
		horarioId: -1,
		disciplinas: [],
		precio: 0,
		maxParticipantes: 2,
		pagos: []
	};

	$: permitirSeleccionarModoOrganizacion = true;

	$: (async () => {	
		if (data.idSubespacio === null || data.idSubespacio === undefined) return;
		if (datosCreacion === null) return;

		datosCreacion.subespacios.forEach(s => {
			if (s.id === data.idSubespacio) {	
				if (datosCreacion?.espacioPublico) return;

				if (datosCreacion?.administrador) {
					if (s.diasHaciaAdelante === 0) {
						permitirSeleccionarModoOrganizacion = false;
						data.usarCronograma = false;
					} else {
						permitirSeleccionarModoOrganizacion = true;
					}
				} else {
					permitirSeleccionarModoOrganizacion = false;
					data.usarCronograma = true;
					if (s.diasHaciaAdelante === 0) {
						warningSinCronogramaVisible = true;
					} else {
						warningSinCronogramaVisible = false;
					}
				}



				if (!datosCreacion?.espacioPublico && s.diasHaciaAdelante === 0 && !datosCreacion?.administrador) {
					warningSinCronogramaVisible = true;
				} else {
					warningSinCronogramaVisible = false;
				}				
				fechaMaxBusquedaHorarios = new Date();
				fechaMaxBusquedaHorarios.setDate((new Date()).getDate() + s.diasHaciaAdelante - 1)
			}
		})

		

	})()

	let prevSubespacio : number | null = null;
	$: (async () => {
		if (data.idSubespacio === null || data.idSubespacio === undefined) return;
		if (datosCreacion == null) return;

		if (data.idSubespacio === prevSubespacio) return;
		prevSubespacio = data.idSubespacio;
		
		if (datosCreacion.administrador) {
			let periodosLibresTmp = await CronogramaService.obtenerPeriodosLibres(data.idSubespacio);
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
	})()

	// Validation states
	$: warningNombreVisible = false;
	$: warningPrecioVisible = false;
	$: warningMaxParticipantesVisible = false;
	$: warningHorarioVisible = false;
	$: warningFechaHoraVisible = false;
	$: warningSubespacioVisible = false;
	$: warningSinCronogramaVisible = false;
	$: warningBasesVisible = false;

	// Error handling
	$: error = "";
	$: errorVisible = false;

	// Success popup
	$: popupExitoVisible = false;
	$: eventoId = -1;

	// Popup states
	$: popupDisciplinasVisible = false;

	// Selected items
	let disciplinasSeleccionadas: Map<number, string> = new Map();

	// Search functions for PopupSeleccion
	async function buscarDisciplinas(val: string) {
		let ret: Map<number, string> = new Map();

		if (data.idSubespacio === null || data.idSubespacio === undefined) return ret;

		let response;

		response = await DisciplinasService.buscarPorSubespacio(val, data.idSubespacio);

		
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
		if (datosCreacion == null) {
			return {
				valid: false,
				reason: "No se ha seleccionado el subespacio"
			};
		}
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

		let capacidadMaxima = 0;

		datosCreacion.subespacios.forEach(s => {
			if (s.id === data.idSubespacio) {
				capacidadMaxima = s.capacidadMaxima;
			}
		})

		if (capacidadMaxima === 0) {
			return {
				valid: false,
				reason: "No se ha seleccionado el subespacio"
			};
		}

		if (num > capacidadMaxima) {
			return {
				valid: false,
				reason: "La capacidad máxima del subespacio es de " + capacidadMaxima + " personas"
			};
		}

		return {
			valid: true,
			reason: undefined
		};
	}

	

	async function validatePreCrear() {
		// Reset warnings
		warningNombreVisible = false;
		warningPrecioVisible = false;
		warningMaxParticipantesVisible = false;
		warningHorarioVisible = false;
        warningFechaHoraVisible = false;
		warningSubespacioVisible = false;
		warningBasesVisible = false;

		let hasErrors = false;

		// Validate required fields
		if (data.nombre.trim() === "") {
			warningNombreVisible = true;
			hasErrors = true;
		}

		if (data.idSubespacio === null || data.idSubespacio === undefined) {
			warningSubespacioVisible = true;
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

        if ((datosCreacion?.espacioPublico || !datosCreacion?.espacioPublico && !data.usarCronograma ) && (data.fechaHoraInicio === null || data.fechaHoraFin === null)) {
            warningFechaHoraVisible = true;
            hasErrors = true;
        }

		if (!datosCreacion?.espacioPublico && datosCreacion?.tieneBasesYCondiciones && !checkedBases) {
			warningBasesVisible = true;
			hasErrors = true;
		}

		return hasErrors;
	}

	async function pagarCreacionEvento() {
		if (await validatePreCrear()) {           
			return;
		}

		// Set selected disciplines and modes
		data.disciplinas = Array.from(disciplinasSeleccionadas.keys());
		
		data.horarioId = selectedHorarioId !== null ? selectedHorarioId : -1;

		try {
			let preferencias = await EventosService.pagarCreacionEvento(data);
			startPopupPago(data, "eventos/crearEvento", `/MisEventos`, [preferencias]);
			
			//startPopupPago(crearEvento, preferencias);
		} catch (e) {
			if (e instanceof HttpError) {
				if (e.code === 900) {
					crearEvento([]);
				} else {
					error = e.message;
					errorVisible = true;
				}
			}
		}
	}

	async function crearEvento(datosPago: DTOPago[]) {
		if (await validatePreCrear()) {           
			return;
		}

		// Set selected disciplines and modes
		data.disciplinas = Array.from(disciplinasSeleccionadas.keys());

		data.horarioId = selectedHorarioId !== null ? selectedHorarioId : -1;

		if (datosPago.length > 0 )
			data.pagos = datosPago;

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
            data.fechaHoraInicio = null;
            data.fechaHoraFin = null;
            horarioSeleccionado = false;
        }
        data.usarCronograma = usar;
    }

    //Espacio privado con cronograma
    $: popupHorarioVisible = false;
    $: fechaBusquedaHorarios = new Date();
    let fechaMaxBusquedaHorarios = new Date();

    $: horarios = [] as {id: number, fechaHoraDesde: Date, fechaHoraHasta: Date, precioOrganizacion: number, adicionalPorInscripcion: number}[];

    async function buscarHorarios() {
		if (data.idSubespacio === null || data.idSubespacio === undefined) return;
        try {
            horarios = await CronogramaService.buscarHorariosDisponibles(data.idSubespacio, fechaBusquedaHorarios);
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
	$: adicionalInscripcion = 0;
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
                    data.fechaHoraInicio =  h.fechaHoraDesde
                    data.fechaHoraFin =  h.fechaHoraHasta
                    precioOrganizacion = h.precioOrganizacion;
					adicionalInscripcion = h.adicionalPorInscripcion;
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

    // Espacio público

    $: eventosSuperpuestos = null as number | null;

    $: (async () => {
        try {
            if (data.fechaHoraInicio !== null && data.fechaHoraFin !== null && datosCreacion?.espacioPublico) {
                eventosSuperpuestos = await EventosService.obtenerCantidadEventosSuperpuestos(espacioId, data.fechaHoraInicio, data.fechaHoraFin);
            }
        } catch (e) {
            if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
        }
    })()

	$: popupBasesVisible = false;
	$: urlBases = '';

	async function mostrarBasesYCondiciones() {
		try {
			urlBases = await EspaciosService.obtenerBasesYCondiciones(espacioId) + "#toolbar=0&navpanes=0";
			popupBasesVisible = true;
		} catch (e) {
            if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
        }
	}

	$: checkedBases = false;

	async function vincularMP() {
        let link = await UsuariosService.obtenerLinkIntegrarMP();        
        window.location.href = link;
    }
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

<Popup title="Bases y Condiciones" bind:visible={popupBasesVisible}>
	<div class="grow overflow-y-auto">
		<iframe src={urlBases} title="Bases y Condiciones" class="w-full h-full"></iframe>
	</div>
    <div class="flex gap-2 h-fit p-2 justify-center items-center">
        <Button action={() => {popupBasesVisible = false}}>Cerrar</Button>
    </div>
</Popup>


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
			max={500}
		/>

		<div class="mb-2 md:flex justify-start items-center gap-1">
			<span>Espacio:</span>
			<br/>
			<span>{datosCreacion.nombreEspacio}</span>
		</div>

		<div class="flex flex-col md:flex-row justify-start md:items-center gap-2">
			<span class="flex flex-row items-baseline gap-2">
				<span>Subespacio</span>
				<Button classes="text-xs info_subespacio min-w-[30px] font-bold">i</Button> 
			</span>
			<ComboBox classes="!md:w-[50%]" options={subespaciosOpciones} bind:selected={data.idSubespacio} placeholder="Subespacio" maxHeight={8}/>
			<Warning text="Seleccione un subespacio" visible={warningSubespacioVisible}/>
			<Warning text="Este subespacio no tiene horarios disponibles" visible={warningSinCronogramaVisible}/>
		</div>

		{#if data.idSubespacio !== null && data.idSubespacio !== undefined && !warningSinCronogramaVisible}
			{#if permitirSeleccionarModoOrganizacion}
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
				<DatePicker range time minDate={new Date()} bind:startDate={data.fechaHoraInicio} bind:endDate={data.fechaHoraFin} label="Fecha y Hora"/>
				<Warning text="La fecha y hora es obligatoria" visible={warningFechaHoraVisible}/>
				{#if eventosSuperpuestos !== null}
					<span>Hay {eventosSuperpuestos} eventos organizados en este espacio para este horario</span>
				{/if}
			{:else if !datosCreacion?.espacioPublico && data.usarCronograma}
				<!--Privado con cronograma-->
				<div class="md:flex justify-start items-center">
					<span class="text-s flex flex-row gap-2 items-center">Horario: <Button classes="text-xs" action={openPopupHorario}>Cambiar</Button></span>
					{#if horarioSeleccionado}
						<div class="ml-4 flex flex-col justify-start items-center md:flex-row md:justify-center md:gap-2">
							<div>{formatDate(data.fechaHoraInicio, true)}</div>
							<div>a</div>
							<div>{formatDate(data.fechaHoraFin, true)}</div>
						</div>
						{#if !datosCreacion?.administrador}
							<div>Cuota por organización: ${precioOrganizacion.toFixed(2).replaceAll(".",",")}</div>
						{/if}
						<div>Adicional por inscripción: ${adicionalInscripcion.toFixed(2).replaceAll(".",",")}</div>
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
						bind:startDate={data.fechaHoraInicio} 
						bind:endDate={data.fechaHoraFin} 
						label="Fecha y Hora"
					/>
				{/if}
				<Warning text="La fecha y hora es obligatoria" visible={warningFechaHoraVisible}/>
			{/if}

			<div class="mb-2 flex flex-col gap-2 md:flex-row md:items-baseline">
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
					{#if data.usarCronograma && !datosCreacion.espacioPublico}
						Precio más adicional y comisión: ${((data.precio + adicionalInscripcion) * (1 + (datosCreacion.comisionInscripcion.filter(c => c.montoLimite <= data.precio + adicionalInscripcion).reduce((prev, curr) => prev.montoLimite > curr.montoLimite ? prev : curr, {montoLimite: 0, porcentaje: 0}) || 0).porcentaje)).toFixed(2).replace(".", ",")}
					{:else}
						Precio más comisión: ${(data.precio * (1 + (datosCreacion.comisionInscripcion.filter(c => c.montoLimite <= data.precio + adicionalInscripcion).reduce((prev, curr) => prev.montoLimite > curr.montoLimite ? prev : curr, {montoLimite: 0, porcentaje: 0}) || 0).porcentaje)).toFixed(2).replace(".", ",")}
					{/if}
				</div>
			</div>
			

			<TextField 
				label="Cantidad máxima de participantes" 
				bind:value={maxParticipantesString} 
				validate={validateMaxParticipantes} 
				forceValidate={warningMaxParticipantesVisible}
			/>


			{#if !datosCreacion?.espacioPublico && datosCreacion.tieneBasesYCondiciones}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="flex flex-row items-start gap-2">
					<CheckBox bind:checked={checkedBases}/>
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<span>He leído y acepto las <span class="text-dark font-bold cursor-pointer" on:click={mostrarBasesYCondiciones}>bases y condiciones</span> del espacio</span>
				</div>
				<Warning text="Debe aceptar las bases y condiciones para poder organizar el evento" visible={warningBasesVisible}/>
			{/if}
		{/if}

		

		
	</div>

	<div class="flex gap-2 h-fit p-2 justify-center items-center">
		<Button action={() => goto("/")}>Cancelar</Button>
		<Button action={datosCreacion.administrador || !data.usarCronograma ? () => crearEvento([]) : pagarCreacionEvento}>Aceptar</Button>
	</div>
</div>
{/if}

<PopupError bind:visible={errorVisible}>
	{error}
</PopupError>

{#if !get(vinculadoMP)}
    <Popup title="Vincular a Mercado Pago" visible={true} fitH fitW>
        <p>Su cuenta de evtnet no está vinculada a Mercado Pago. Esto es necesario para que pueda cobrar por las inscripciones a sus eventos.</p>
        <div class="flex justify-center items-center w-full gap-2">
            <Button action={() => goto(`/Espacio/${espacioId}`)}>Cancelar</Button>
            <Button action={vincularMP}>Vincular</Button>
        </div>
    </Popup>
{/if}

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