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
		fechaDesde: new Date(),
		fechaHasta: new Date(),
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

		if (data.maxParticipantes < 2) {
			warningMaxParticipantesVisible = true;
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
            console.log(e);
		}
	}
  

	// Convert price to string for TextField
	$: precioString = data.precio.toString();
	$: data.precio = parseFloat(precioString) || 0;

	// Convert maxParticipantes to string for TextField  
	let maxParticipantesString = "2";
</script>

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
            <div class="mb-2">
                <span>Espacio:</span>
                <br/>
                <span>{datosCreacion.nombreEspacio}</span>
            </div>
        {/if}

		{#if !esEspacioNoRegistrado && datosCreacion?.administrador}
			<div class="mb-2">
				<span>Organizar evento:</span>
				<div class="flex gap-2 mt-1 border rounded-lg p-1">
					<Button 
						action={() => data.usarCronograma = true}
						classes="grow { + data.usarCronograma ? "" : "bg-white [&>span]:text-black"}"
					>
						<span>Según cronograma</span>
					</Button>
					<Button 
						action={() => data.usarCronograma = false}
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
                <span class="text-s flex flex-row gap-2 items-center">Horario: <Button classes="text-xs">Cambiar</Button></span>
                <div class="ml-4 flex flex-col justify-start items-center md:flex-row md:justify-center md:gap-2">
                    <div>{formatDate(data.fechaDesde, true)}</div>
                    <div>a</div>
                    <div>{formatDate(data.fechaHasta, true)}</div>
                </div>
                {#if !datosCreacion?.administrador}
                    <span>Cuota por organización: <!--TO-DO--></span>
                {/if}
            </div>
        {:else if !datosCreacion?.espacioPublico && !data.usarCronograma && datosCreacion?.administrador}
            <!--Privado sin cronograma-->
            <div>
                <span>Periodo</span>
                <!--TO-DO-->
                <ComboBox 
                    options={tiposInscripcionOptions} 
                    bind:selected={data.tipoInscripcion} 
                    placeholder=""
                />
            </div>
            <DatePicker range time minDate={new Date()} bind:startDate={data.fechaDesde} bind:endDate={data.fechaHasta} label="Fecha y Hora"/>
		{/if}

		<div class="mb-2">
			<div class="flex justify-start gap-2">
				<span>Disciplinas</span>
				<Button action={() => {popupDisciplinasVisible = true}}>Seleccionar</Button>
			</div>
			<div class="commaList">
				{#each disciplinasSeleccionadas as d}
					<span>{d[1]}</span>
				{/each}
			</div>
		</div>

		<div class="mb-2">
			<div class="flex justify-start gap-2">
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

        <div class="flex flex-col">
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
			change={() => data.maxParticipantes = parseInt(maxParticipantesString) || 2}
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
	.commaList>*:not(:last-child)::after {
		content: ", ";
	}
</style>