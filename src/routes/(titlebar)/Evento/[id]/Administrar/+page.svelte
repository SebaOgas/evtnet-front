<script lang="ts">
	import { afterNavigate, goto } from "$app/navigation";
	import { base } from "$app/paths";
	import { page } from "$app/state";
	import Button from "$lib/components/Button.svelte";
	import { formatDate } from "$lib/components/DatePicker.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import PopupSeleccion from "$lib/components/PopupSeleccion.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import type DTODatosModificarEvento from "$lib/dtos/eventos/DTODatosModificarEvento";
	import type DTOModificarEvento from "$lib/dtos/eventos/DTOModificarEvento";
	import { HttpError } from "$lib/request/request";
	import { DisciplinasService } from "$lib/services/DisciplinasService";
	import { EventosService } from "$lib/services/EventosService";
	import { SupereventosService } from "$lib/services/SupereventosService";
	import { permisos, token } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

    let previousPage: string = base;

	afterNavigate(({from}) => {
		previousPage = from?.url.pathname || previousPage
	});

	$: id = Number(page.params.id);
	let datosOriginales: DTODatosModificarEvento | null = null;

	onMount(async () => {
		if (get(token) === "") {
			goto("/");
			return;
		}

		if (!get(permisos).includes("AdministracionEventos")) {
			errorPermiso = true;
			return;
		}

		try {
			datosOriginales = await EventosService.obtenerDatosModificacionEvento(id);
			data = {
				id: id,
				nombre: datosOriginales.nombre,
				descripcion: datosOriginales.descripcion,
				disciplinas: datosOriginales.disciplinas,
				precioInscripcion: datosOriginales.precioInscripcion,
				cantidadMaximaParticipantes: datosOriginales.cantidadMaximaParticipantes,
				cantidadMaximaInvitados: datosOriginales.cantidadMaximaInvitados,
				crearSuperevento: false,
				superevento: datosOriginales.superevento,
				rangosReintegro: datosOriginales.rangosReintegro
			};

            if (!datosOriginales.administradorEvento && !datosOriginales.organizadorEvento) {
                errorPermiso = true;
                return;
            }

			// Convert disciplinas to a Map
			disciplinasSeleccionadas.clear();
			data.disciplinas.forEach(d => {
				disciplinasSeleccionadas.set(d.id, d.nombre);
			});
			disciplinasSeleccionadas = disciplinasSeleccionadas;

		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}			
		}
	});

	let data: DTOModificarEvento = {
		id: 0,
		nombre: "",
		descripcion: "",
		disciplinas: [],
		precioInscripcion: 0,
		cantidadMaximaParticipantes: 2,
		cantidadMaximaInvitados: 0,
		crearSuperevento: false,
		superevento: null,
		rangosReintegro: []
	}

	// Form state
	let disciplinasSeleccionadas: Map<number, string> = new Map();

	// Validation states
	$: warningNombreVisible = false;
	$: warningPrecioVisible = false;
	$: warningMaxParticipantesVisible = false;
	$: warningMaxInvitadosVisible = false;
	$: warningRangosReintegroVisible = false;
	$: warningSupereventoNombreVisible = false;

	// Error handling
	$: error = "";
	$: errorVisible = false;
	$: errorPermiso = false;

	// Success popup
	$: popupExitoVisible = false;
	$: popupConfirmacionVisible = false;
	$: observaciones = [] as string[];
	$: popupDejarAdminVisible = false;

	// Popup states
	$: popupDisciplinasVisible = false;
	$: popupSupereventosVisible = false;
	$: popupCancelarEventoVisible = false;

	function formatTime(time: Date) {
		time = new Date(time);
		return ("" + time.getHours()).padStart(2, "0") + ":" + ("" + time.getMinutes()).padStart(2, "0");
	}


	// String representations for TextFields
	$: precioString = data.precioInscripcion.toString();
	$: data.precioInscripcion = parseFloat(precioString) || 0;

	$: maxParticipantesString = data.cantidadMaximaParticipantes.toString();
	$: data.cantidadMaximaParticipantes = parseInt(maxParticipantesString) || 2;

	$: maxInvitadosString = data.cantidadMaximaInvitados.toString();
	$: data.cantidadMaximaInvitados = parseInt(maxInvitadosString) || 0;


	// Search functions
	async function buscarDisciplinas(val: string) {
		let response = await DisciplinasService.buscar(val);
		let ret: Map<number, string> = new Map();
		response.forEach((item) => {
			ret.set(item.id, item.nombre);
		});
		return ret;
	}

	async function buscarSupereventos(val: string) {
		let response = await SupereventosService.buscarAdministrados(val);
		let ret: Map<number, string> = new Map();
		ret.set(-1, "Ninguno");
		ret.set(-2, "Crear nuevo");
		response.forEach((item) => {
			ret.set(item.id, item.nombre);
		});
		return ret;
	}

	// Validation functions
	function validateNombre(val: string) {
		const trimmed = val.trim();
		if (trimmed.length === 0) {
			return { valid: false, reason: "El nombre del evento es obligatorio" };
		}
		if (trimmed.length > 50) {
			return { valid: false, reason: "El nombre no puede tener más de 50 caracteres" };
		}
		return { valid: true, reason: undefined };
	}

	function validateDescripcion(val: string) {
		if (val.length > 500) {
			return { valid: false, reason: "La descripción no puede tener más de 500 caracteres" };
		}
		return { valid: true, reason: undefined };
	}

	function validateMotivoCancelacion(val: string) {
		if (val.length > 500) {
			return { valid: false, reason: "El motivo de cancelación no puede tener más de 500 caracteres" };
		}
		return { valid: true, reason: undefined };
	}

	function validatePrecio(val: string) {
		const num = parseFloat(val);
		if (isNaN(num) || num < 0) {
			return { valid: false, reason: "El precio debe ser un número no negativo" };
		}
		return { valid: true, reason: undefined };
	}

	function validateMaxParticipantes(val: string) {
		const num = parseInt(val);
		if (!/^\d+$/.test(val)) {
			return { valid: false, reason: "Debe ser un número entero" };
		}
		if (num < 2) {
			return { valid: false, reason: "Debe haber al menos 2 participantes" };
		}
		return { valid: true, reason: undefined };
	}

	function validateMaxInvitados(val: string) {
		const num = parseInt(val);
		if (!/^\d+$/.test(val)) {
			return { valid: false, reason: "Debe ser un número entero" };
		}
		if (num < 0) {
			return { valid: false, reason: "No puede ser negativo" };
		}
		return { valid: true, reason: undefined };
	}

	function validateSupereventoNombre(val: string) {
		if (data.crearSuperevento && val.trim().length === 0) {
			return { valid: false, reason: "El nombre del superevento es obligatorio" };
		}
		if (val.length > 50) {
			return { valid: false, reason: "El nombre no puede tener más de 50 caracteres" };
		}
		return { valid: true, reason: undefined };
	}

	function validateSupereventoDescripcion(val: string) {
		if (val.length > 500) {
			return { valid: false, reason: "La descripción no puede tener más de 500 caracteres" };
		}
		return { valid: true, reason: undefined };
	}

	function validateRangoReintegro(dias: number, horas: number, minutos: number, porcentaje: number) {
		if (dias < 0 || horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
			return { valid: false, reason: "Valores de tiempo inválidos" };
		}
		if (porcentaje < 0 || porcentaje > 100) {
			return { valid: false, reason: "El porcentaje debe estar entre 0 y 100" };
		}
		return { valid: true, reason: undefined };
	}

	// Rango reintegro management
	function agregarRangoReintegro() {
		data.rangosReintegro = [...data.rangosReintegro, {
			dias: 0,
			horas: 0,
			minutos: 0,
			porcentaje: 0
		}];
	}

	function eliminarRangoReintegro(index: number) {
		data.rangosReintegro = data.rangosReintegro.filter((_, i) => i !== index);
	}

	// Superevento handling
	let supereventosSeleccionado: Map<number, string> = new Map();

	$: {
		if (supereventosSeleccionado.size > 0) {
			const [selectedId] = supereventosSeleccionado.keys();
			if (selectedId === -1) {
				// Ninguno
				data.superevento = null;
				data.crearSuperevento = false;
			} else if (selectedId === -2) {
				// Crear nuevo
				data.crearSuperevento = true;
                data.superevento = {
                    id: undefined,
                    nombre: "",
                    descripcion: ""
                };
			} else {
				// Seleccionar existente
				data.crearSuperevento = false;
				const nombre = supereventosSeleccionado.get(selectedId) || "";
				data.superevento = {
					id: selectedId,
					nombre: nombre,
					descripcion: ""
				};
			}
		}
	}

	function generarObservaciones(): string[] {
		const obs: string[] = [];
		
		if (!datosOriginales) return obs;

		// Check if name changed
		if (data.nombre !== datosOriginales.nombre) {
			obs.push("Cambiar el nombre del evento podría confundir a quienes ya se inscribieron. Hágalo solo si está seguro de ello.");
		}

		// Price changes
		if (data.precioInscripcion !== datosOriginales.precioInscripcion) {
			obs.push("Los cambios en el precio de inscripción solo aplica luego de realizar el cambio; quienes ya se inscribieron no deberán pagar ningún adicional ni se les devolverá nada de dinero.");
		}

		// Participant limit changes                
		if (data.cantidadMaximaParticipantes < datosOriginales.cantidadMaximaParticipantes && data.cantidadMaximaParticipantes < datosOriginales.cantidadParticipantesActual) {
			obs.push(`La cantidad de inscriptos y sus invitados supera la nueva cantidad máxima de participantes (${data.cantidadMaximaParticipantes}). Si continúa, se cancelarán las inscripciones más recientes necesarias para no superar este límite, devolviendo el dinero correspondiente.`);
		}

		// Guest limit changes
		if (data.cantidadMaximaInvitados < datosOriginales.cantidadMaximaInvitados && data.cantidadMaximaInvitados < datosOriginales.cantidadMaximaInvitadosPorInvitacionEfectiva) {
			obs.push("Disminuir el límite de invitados por inscripción solo aplica luego de realizar el cambio; quienes ya se inscribieron con más invitados no se verán afectados.");
		}

		// Superevento changes
		if (datosOriginales.superevento && !data.superevento) {
			obs.push("Desvincular al evento del superevento permitirá que quienes se inscribieron hasta este momento cancelen su inscripción, obteniendo una devolución total del precio de inscripción.");
		}

		return obs;
	}

	async function guardarEvento() {
		// Reset warnings
		warningNombreVisible = false;
		warningPrecioVisible = false;
		warningMaxParticipantesVisible = false;
		warningMaxInvitadosVisible = false;
		warningRangosReintegroVisible = false;
		warningSupereventoNombreVisible = false;

		let hasErrors = false;

		// Validate fields
		if (!validateNombre(data.nombre).valid) {
			warningNombreVisible = true;
			hasErrors = true;
		}

		if (!validatePrecio(precioString).valid) {
			warningPrecioVisible = true;
			hasErrors = true;
		}

		if (!validateMaxParticipantes(maxParticipantesString).valid) {
			warningMaxParticipantesVisible = true;
			hasErrors = true;
		}

		if (!validateMaxInvitados(maxInvitadosString).valid) {
			warningMaxInvitadosVisible = true;
			hasErrors = true;
		}

		if (data.crearSuperevento && data.superevento && !validateSupereventoNombre(data.superevento.nombre).valid) {
			warningSupereventoNombreVisible = true;
			hasErrors = true;
		}

		// Validate rangos reintegro
		for (let i = 0; i < data.rangosReintegro.length; i++) {
			const rango = data.rangosReintegro[i];
			if (!validateRangoReintegro(rango.dias, rango.horas, rango.minutos, rango.porcentaje).valid) {
				warningRangosReintegroVisible = true;
				hasErrors = true;
				break;
			}
		}

		if (hasErrors) {
			return;
		}

		// Set selected disciplines
		data.disciplinas = Array.from(disciplinasSeleccionadas.entries()).map(([id, nombre]) => ({id, nombre}));

		// Generate observations for confirmation
		observaciones = generarObservaciones();
		popupConfirmacionVisible = true;
	}

	async function confirmarGuardar() {
		try {
			await EventosService.modificarEvento(data);
			popupExitoVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
		popupConfirmacionVisible = false;
	}

	async function dejarDeSerAdministrador() {
		try {
			await EventosService.dejarDeAdministrar(id);
			goto(`/Evento/${id}`);
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
		popupDejarAdminVisible = false;
	}

	$: motivoCancelacionEvento = "";

	async function cancelarEvento() {
		try {
			await EventosService.cancelarEvento(id, motivoCancelacionEvento);
			popupExitoVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
		popupCancelarEventoVisible = false;
	}

	// Check if user can edit refund ranges (is organizer)
	$: puedeEditarRangos = datosOriginales !== null && datosOriginales.organizadorEvento === true;
	$: puedeGestionarAdmins = datosOriginales !== null && datosOriginales.organizadorEvento === true;
	$: puedeCancelarEvento = datosOriginales !== null && datosOriginales.organizadorEvento === true;
	// Check if user can leave admin (is not organizer)
	$: puedeDejarAdmin = datosOriginales !== null && datosOriginales.organizadorEvento !== true && datosOriginales.administradorEvento === true;
</script>

{#if datosOriginales}
<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-m text-center">
			Administrar evento
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
			validate={validateDescripcion}
			rows={6}
		/>

		<div class="mb-2 flex flex-col gap-2 md:flex-row">
			<span>Espacio:</span>
			<span>{datosOriginales.nombreEspacio}</span>
		</div>

		<div class="mb-2 flex flex-col gap-2 md:flex-row">
			<span>Subespacio:</span>
			<span>{datosOriginales.nombreSubespacio}</span>
		</div>

		<div class="md:flex justify-start items-center">
			<span class="text-s">Horario:</span>
			<div class="ml-4 flex flex-col justify-start items-center md:flex-row md:justify-center md:gap-2">
				<div>{formatDate(datosOriginales.fechaHoraDesde, true)}</div>
				<div>a</div>
				<div>{formatDate(datosOriginales.fechaHoraHasta, true)}</div>
			</div>
			<div>Adicional por inscripción: ${datosOriginales.adicionalPorInscripcion !== null ? datosOriginales.adicionalPorInscripcion.toFixed(2).replaceAll(".",",") : "-"}</div>
		</div>

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
					{#if !datosOriginales.espacioPublico}
						Precio más adicional y comisión: ${((data.precioInscripcion + datosOriginales.adicionalPorInscripcion) * (1 + (datosOriginales.comisionInscripcion || 0))).toFixed(2).replace(".", ",")}
					{:else}
						Precio más comisión: ${(data.precioInscripcion * (1 + (datosOriginales.comisionInscripcion || 0))).toFixed(2).replace(".", ",")}
					{/if}
				</div>
			</div>

		<div class="flex flex-col gap-2 lg:flex-row">
			<TextField 
				label="Cantidad máxima de participantes" 
				bind:value={maxParticipantesString} 
				validate={validateMaxParticipantes}
				forceValidate={warningMaxParticipantesVisible}
				classes="lg:flex-1 lg:[&>input]:w-full lg:[&>span]:whitespace-nowrap"
			/>

			<TextField 
				label="Cantidad máxima de invitados por inscripción" 
				bind:value={maxInvitadosString} 
				validate={validateMaxInvitados}
				forceValidate={warningMaxInvitadosVisible}
				classes="lg:flex-1 lg:[&>input]:w-full lg:[&>span]:whitespace-nowrap"
			/>
		</div>		

		<div class="mb-2 flex flex-col gap-2 md:flex-row md:items-baseline">
			<div class="flex justify-start gap-2 items-baseline">
				<span>Superevento</span>
				<Button action={() => {popupSupereventosVisible = true}}>Cambiar</Button>
			</div>
			<div>
                {#if data.crearSuperevento}
                    Nuevo
                {:else if data.superevento}
					{data.superevento.nombre}
				{:else}
					Ninguno
				{/if}
			</div>
		</div>

		{#if data.crearSuperevento && data.superevento}
			<TextField 
				label="Nombre del superevento" 
				bind:value={data.superevento.nombre}
				validate={validateSupereventoNombre}
				forceValidate={warningSupereventoNombreVisible}
			/>

			<TextField 
				label="Descripción del superevento" 
				multiline 
				bind:value={data.superevento.descripcion}
				validate={validateSupereventoDescripcion}
				rows={4}
			/>
		{/if}

        {#if !datosOriginales.espacioPublico}
            {#if puedeEditarRangos}
                <div class="mb-2">
                    <div class="flex justify-between items-center mb-2">
                        <span>Rangos de reintegro por cancelación de inscripción</span>
                        <Button icon="/icons/plus.svg" action={agregarRangoReintegro}></Button>
                    </div>
                    
                    {#each data.rangosReintegro as rango, i}
                        <div class="flex flex-col md:flex-row justify-start items-start mb-2 md:gap-4">
                            <div class="flex flex-wrap gap-2 justify-start items-center w-full">
                                <span>Hasta</span>
                                <span class="flex flex-1 justify-start items-center gap-2">
                                    <TextField 
                                        label={null} 
                                        bind:value={rango.dias} 
                                        classes="flex-1 min-w-16 [&>input]:w-full"
                                    />
                                    <span>d</span>
                                </span>
                                
                                <span class="flex flex-1 justify-start items-center gap-2">
                                    <TextField 
                                        label={null} 
                                        bind:value={rango.horas} 
                                        classes="flex-1 min-w-16 [&>input]:w-full"
                                    />
                                    <span>h</span>
                                </span>
                                
                                <span class="flex flex-1 justify-start items-center gap-2">
                                    <TextField 
                                        label={null} 
                                        bind:value={rango.minutos} 
                                        classes="flex-1 min-w-16 [&>input]:w-full"
                                    />
                                    <span>min</span>
                                </span>
                                
                            </div>
							<div class="hidden md:flex justify-center self-stretch items-center"><span>|</span></div>
                            <div class="flex flex-wrap gap-2 justify-start items-center w-full">
                                <span>Reintegrar el</span>
                                <span class="flex flex-1 justify-start items-center gap-2">
                                    <TextField 
                                        label={null} 
                                        bind:value={rango.porcentaje} 
                                        classes="flex-1 min-w-16 [&>input]:w-full"
                                    />
                                    <span>%</span>
                                </span>
                                <Button 
                                    icon="/icons/cross.svg" 
                                    action={() => eliminarRangoReintegro(i)}
                                    classes="h-fit"
                                ></Button>
                            </div>
                        </div>
                    {/each}
                    <Warning text="Verifique que los valores de tiempo y porcentaje sean válidos" visible={warningRangosReintegroVisible}/>
                </div>
            {:else}
                <div class="mb-2">
                    <span>Rangos de reintegro por cancelación de inscripción</span>
                    {#each data.rangosReintegro as rango}
                        <div class="ml-4">
                            Hasta {rango.dias}d {rango.horas}h {rango.minutos}min - Reintegrar el {rango.porcentaje}%
                        </div>
                    {/each}
                </div>
            {/if}
        {/if}
	</div>

	<div class="flex flex-wrap gap-2 h-fit p-2 justify-center items-center">
		<Button action={() => goto(`/Evento/${id}`)}>Atrás</Button>
		<Button action={guardarEvento}>Guardar</Button>
		<Button action={() => goto(`/Evento/${id}/Inscripciones`)}>Administrar inscripciones</Button>
		{#if puedeGestionarAdmins}
			<Button action={() => goto(`/Evento/${id}/GestionarAdministradores`)}>Gestionar administradores</Button>
		{/if}
		{#if puedeDejarAdmin}
			<Button action={() => {popupDejarAdminVisible = true}}>Dejar de ser administrador</Button>
		{/if}
		{#if puedeCancelarEvento}
			<Button action={() => {popupCancelarEventoVisible = true}}>Cancelar evento</Button>
		{/if}
	</div>
</div>
{/if}

<!-- Popups -->
<PopupSeleccion 
	title="Seleccionar disciplinas" 
	multiple={true} 
	bind:visible={popupDisciplinasVisible} 
	searchFunction={buscarDisciplinas} 
	bind:selected={disciplinasSeleccionadas}
/>

<PopupSeleccion 
	title="Seleccionar superevento" 
	multiple={false} 
	bind:visible={popupSupereventosVisible} 
	searchFunction={buscarSupereventos} 
	bind:selected={supereventosSeleccionado}
/>

<Popup title="Confirmar cambios" bind:visible={popupConfirmacionVisible} fitW fitH>
	<div class="grow overflow-y-auto">
		{#if observaciones.length > 0}
			<div class="mb-4">
				<span class="text-s">Observaciones:</span>
				<ul class="mt-2">
					{#each observaciones as obs}
						<li class="mb-2">• {obs}</li>
					{/each}
				</ul>
			</div>
		{/if}
		<p>¿Está seguro de que desea guardar estos cambios?</p>
	</div>
	<div class="flex gap-2 h-fit p-2 justify-center items-center">
		<Button action={() => {popupConfirmacionVisible = false}}>Cancelar</Button>
		<Button action={confirmarGuardar}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={popupExitoVisible} fitH fitW>
	Evento modificado exitosamente
	<div class="flex justify-center items-center w-full">
		<Button action={() => goto(`/Evento/${id}`)}>Aceptar</Button>
	</div>
</Popup>

<Popup bind:visible={popupDejarAdminVisible} fitH fitW>
	¿Está seguro de que desea dejar de ser administrador del evento?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupDejarAdminVisible = false}}>Cancelar</Button>
		<Button action={dejarDeSerAdministrador}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={popupCancelarEventoVisible} fitH fitW title="Cancelar evento">
	<p>¿Está seguro de que desea cancelar el evento?</p>
	<p>Se devolverá el monto pagado a los inscriptos, pero no recuperará lo pagado al espacio. Esta acción es irreversible.</p>
	<TextField 
			label="Motivo" 
			multiline 
			bind:value={motivoCancelacionEvento} 
			validate={validateMotivoCancelacion}
			rows={6}
			max={500}
		/>
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupCancelarEventoVisible = false}}>Cancelar</Button>
		<Button action={cancelarEvento}>Confirmar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorPermiso} redir={previousPage}>
	No tiene permiso para administrar este evento.
</PopupError>

<PopupError bind:visible={errorVisible}>
	{error}
</PopupError>