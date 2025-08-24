<script lang="ts">
	import { afterNavigate, goto } from "$app/navigation";
	import { base } from "$app/paths";
	import { page } from "$app/state";
	import Button from "$lib/components/Button.svelte";
	import ComboBox from "$lib/components/ComboBox.svelte";
	import DatePicker, { formatDate } from "$lib/components/DatePicker.svelte";
	import MapDisplay from "$lib/components/MapDisplay.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import PopupSeleccion from "$lib/components/PopupSeleccion.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import type DTOModificarEvento from "$lib/dtos/eventos/DTOModificarEvento";
	import { HttpError } from "$lib/request/request";
	import { CronogramaService } from "$lib/services/CronogramaService";
	import { DisciplinasService } from "$lib/services/DisciplinasService";
	import { EventosService } from "$lib/services/EventosService";
	import { ModosDeEventoService } from "$lib/services/ModosDeEventoService";
	import { SupereventosService } from "$lib/services/SupereventosService";
	import { permisos, token } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

    let previousPage: string = base;

	afterNavigate(({from}) => {
		previousPage = from?.url.pathname || previousPage
	});

	$: id = Number(page.params.id);
	let datosOriginales: DTOModificarEvento | null = null;

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
			data = { ...datosOriginales };

            if (!data.administradorEvento && !data.organizadorEvento) {
                errorPermiso = true;
                return;
            }
			
			// Set up reactive data
			if (data.tiposInscripcion.length > 0) {
				const selected = data.tiposInscripcion.find(t => t.seleccionado);
				tipoInscripcionSeleccionado = selected ? selected.id : data.tiposInscripcion[0].id;
			}

			// Convert disciplinas and modos to Maps
			disciplinasSeleccionadas.clear();
			data.disciplinas.forEach(d => {
				disciplinasSeleccionadas.set(d.id, d.nombre);
			});
			disciplinasSeleccionadas = disciplinasSeleccionadas;

			modosSeleccionados.clear();
			data.modos.forEach(m => {
				modosSeleccionados.set(m.id, m.nombre);
			});
			modosSeleccionados = modosSeleccionados;

			// Set up ubicacion for MapDisplay
			if (data.ubicacion.latitud && data.ubicacion.longitud) {
				ubicacionMarcada = {x: data.ubicacion.latitud, y: data.ubicacion.longitud};
			}

			// Set up fecha max for horario search
			if (data.diasHaciaAdelante > 0) {
				fechaMaxBusquedaHorarios = new Date();
				fechaMaxBusquedaHorarios.setDate(fechaMaxBusquedaHorarios.getDate() + data.diasHaciaAdelante - 1);
			}

			// Cargar periodos libres, para cuando se organiza de forma libre
            if (data.administradorEspacio && data.nombreEspacio && data.idEspacio !== null) {
                let periodosLibresTmp = await CronogramaService.obtenerPeriodosLibres(data.idEspacio);
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

	let data: DTOModificarEvento = {
		id: 0,
		nombre: "",
		descripcion: "",
		idEspacio: null,
		nombreEspacio: null,
		usarCronograma: true,
		fechaDesde: new Date(),
		fechaHasta: new Date(),
		horarioId: -1,
		precioOrganizacion: null,
		direccion: "",
		ubicacion: {
			latitud: undefined,
			longitud: undefined
		},
		disciplinas: [],
		modos: [],
		tiposInscripcion: [],
		precioInscripcion: 0,
		comisionInscripcion: 0,
		cantidadMaximaParticipantes: 2,
		cantidadMaximaInvitados: 0,
        cantidadParticipantesActual: 0,
        cantidadMaximaInvitadosPorInvitacionEfectiva: 0,
		crearSuperevento: false,
		superevento: null,
		rangosReintegro: [],
		espacioPublico: null,
		administradorEspacio: null,
		administradorEvento: null,
		organizadorEvento: null,
		diasHaciaAdelante: 0
	};

	// Form state
	let ubicacionMarcada: {x: number, y: number} | undefined = undefined;
	let disciplinasSeleccionadas: Map<number, string> = new Map();
	let modosSeleccionados: Map<number, string> = new Map();
	let tipoInscripcionSeleccionado: number | undefined = undefined;

	// Validation states
	$: warningNombreVisible = false;
	$: warningDireccionVisible = false;
	$: warningUbicacionVisible = false;
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
	$: popupModosVisible = false;
	$: popupSupereventosVisible = false;

	// Horario selection logic (for private spaces with schedule)
	$: popupHorarioVisible = false;
	$: fechaBusquedaHorarios = new Date();
	let fechaMaxBusquedaHorarios = new Date();

	$: horarios = [] as {id: number, fechaHoraDesde: Date, fechaHoraHasta: Date, precioOrganizacion: number}[];

	async function buscarHorarios() {
		if (!data.nombreEspacio || data.espacioPublico) return;
		
		try {
			horarios = await CronogramaService.buscarHorariosDisponibles(id, fechaBusquedaHorarios);
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
	$: horarioSeleccionado = true; // Already has a schedule selected initially

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
					data.fechaDesde = h.fechaHoraDesde;
					data.fechaHasta = h.fechaHoraHasta;
					data.precioOrganizacion = h.precioOrganizacion;
					data.horarioId = h.id;
				}
			});
			horarioSeleccionado = true;
		}
	}

	// String representations for TextFields
	$: precioString = data.precioInscripcion.toString();
	$: data.precioInscripcion = parseFloat(precioString) || 0;

	$: maxParticipantesString = data.cantidadMaximaParticipantes.toString();
	$: data.cantidadMaximaParticipantes = parseInt(maxParticipantesString) || 2;

	$: maxInvitadosString = data.cantidadMaximaInvitados.toString();
	$: data.cantidadMaximaInvitados = parseInt(maxInvitadosString) || 0;

	function toggleUsarCronograma(usar: boolean) {
		if (datosOriginales === null) return;
        if (data.usarCronograma !== usar) {
            data.fechaDesde = datosOriginales.fechaDesde;
            data.fechaHasta = datosOriginales.fechaHasta;
            horarioSeleccionado = false;
        }
        data.usarCronograma = usar;
    }

	// ComboBox options
	$: tiposInscripcionOptions = new Map(
		data.tiposInscripcion.map(tipo => [tipo.id, tipo.nombre])
	);

	// Search functions
	async function buscarDisciplinas(val: string) {
		let response = await DisciplinasService.buscar(val);
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

	function validateDireccion(val: string) {
		if (data.nombreEspacio === null && val.trim() === "") {
			return { valid: false, reason: "La dirección es obligatoria" };
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
                    descripcion: undefined
                };
			} else {
				// Seleccionar existente
				data.crearSuperevento = false;
				const nombre = supereventosSeleccionado.get(selectedId) || "";
				data.superevento = {
					id: selectedId,
					nombre: nombre,
					descripcion: undefined
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

		// Check if schedule/configuration changed
		const scheduleChanged = 
			(new Date(data.fechaDesde)).getTime() !== (new Date(datosOriginales.fechaDesde)).getTime() ||
			(new Date(data.fechaHasta)).getTime() !== (new Date(datosOriginales.fechaHasta)).getTime() ||
			JSON.stringify(data.disciplinas) !== JSON.stringify(datosOriginales.disciplinas);

		if (scheduleChanged) {
			obs.push("Cambiar los horarios y/o disciplinas permitirá que quienes se inscribieron hasta este momento cancelen su inscripción, obteniendo una devolución total del precio de inscripción.");
			
			// Price changes due to schedule
			if (data.precioOrganizacion && datosOriginales.precioOrganizacion) {
				if (data.precioOrganizacion < datosOriginales.precioOrganizacion) {
					obs.push(`El cambio de horario provocó que disminuya el precio por organizar de $${datosOriginales.precioOrganizacion.toFixed(2)} a $${data.precioOrganizacion.toFixed(2)}, la diferencia le será devuelta automáticamente.`);
				} else if (data.precioOrganizacion > datosOriginales.precioOrganizacion) {
					obs.push(`El cambio de horario provocó que aumente el precio por organizar de $${datosOriginales.precioOrganizacion.toFixed(2)} a $${data.precioOrganizacion.toFixed(2)}, la diferencia será pagada automáticamente al espacio.`);
				}
			}
		}

		// Price changes
		if (data.precioInscripcion < datosOriginales.precioInscripcion) {
			obs.push("Disminuir el precio de inscripción provocará que se devuelva a quienes ya se inscribieron la diferencia con el precio que ellos pagaron.");
		} else if (data.precioInscripcion > datosOriginales.precioInscripcion) {
			obs.push("Aumentar el precio de inscripción solo aplica luego de realizar el cambio; quienes ya se inscribieron no deberán pagar ningún adicional.");
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
		warningDireccionVisible = false;
		warningUbicacionVisible = false;
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

		if (data.nombreEspacio === null && !validateDireccion(data.direccion).valid) {
			warningDireccionVisible = true;
			hasErrors = true;
		}

		if (data.nombreEspacio === null && ubicacionMarcada === undefined) {
			warningUbicacionVisible = true;
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

		// Set location data for unregistered spaces
		if (data.nombreEspacio === null && ubicacionMarcada) {
			data.ubicacion.latitud = ubicacionMarcada.x;
			data.ubicacion.longitud = ubicacionMarcada.y;
		}

		// Set selected disciplines and modes
		data.disciplinas = Array.from(disciplinasSeleccionadas.entries()).map(([id, nombre]) => ({id, nombre}));
		data.modos = Array.from(modosSeleccionados.entries()).map(([id, nombre]) => ({id, nombre}));

		// Set selected inscription type
		if (tipoInscripcionSeleccionado !== undefined) {
			data.tiposInscripcion.forEach(tipo => {
				tipo.seleccionado = tipo.id === tipoInscripcionSeleccionado;
			});
		}

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
		// Implementation would go here
		// For now, just show success and redirect
		popupDejarAdminVisible = false;
		goto(`/Evento/${id}`);
	}

	// Check if user can edit refund ranges (is organizer)
	$: puedeEditarRangos = data.organizadorEvento === true;
	// Check if user can leave admin (is not organizer)
	$: puedeDejarAdmin = data.organizadorEvento !== true && data.administradorEvento === true;

	
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
            if (data.fechaDesde !== null && data.fechaHasta !== null && data.espacioPublico && data.nombreEspacio && data.idEspacio !== null) {
                eventosSuperpuestos = await EventosService.obtenerCantidadEventosSuperpuestos(data.idEspacio, data.fechaDesde, data.fechaHasta);
            }
        } catch (e) {
            if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
        }
    })()
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
			<span>{data.nombreEspacio || "Espacio no registrado"}</span>
		</div>

		{#if data.nombreEspacio && data.administradorEspacio && !data.espacioPublico}
			<div class="mb-2 md:flex justify-start items-center gap-2">
				<span class="whitespace-nowrap">Organizar evento:</span>
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

		{#if data.nombreEspacio && data.espacioPublico}
			<!--Público-->
			<DatePicker range time minDate={new Date()} bind:startDate={data.fechaDesde} bind:endDate={data.fechaHasta} label="Fecha y Hora"/>
            <Warning text="La fecha y hora es obligatoria" visible={(!data.nombreEspacio || data.espacioPublico || !data.espacioPublico && !data.usarCronograma ) && (data.fechaDesde === null || data.fechaHasta === null)}/>
            {#if eventosSuperpuestos !== null}
                <span>Hay {eventosSuperpuestos} eventos organizados en este espacio para este horario</span>
            {/if}
		{:else if !data.nombreEspacio}
			<!--No registrado-->
			<DatePicker range time bind:startDate={data.fechaDesde} bind:endDate={data.fechaHasta} label="Fecha y Hora"/>
            <Warning text="La fecha y hora es obligatoria" visible={(!data.nombreEspacio || data.espacioPublico || !data.espacioPublico && !data.usarCronograma ) && (data.fechaDesde === null || data.fechaHasta === null)}/>
			<TextField 
				label="Dirección" 
				bind:value={data.direccion} 
				validate={validateDireccion}
				forceValidate={warningDireccionVisible}
			/>

			<div class="mb-2">
				<span>Ubicación</span>
				<MapDisplay 
					latitude={data.ubicacion.latitud || -32.89084} 
					longitude={data.ubicacion.longitud || -68.82717} 
					bind:marked={ubicacionMarcada} 
					zoom={12}
				/>
				<Warning text="La ubicación es obligatoria" visible={warningUbicacionVisible}/>
			</div>
		{:else if data.nombreEspacio && !data.espacioPublico && data.usarCronograma}
			<!--Privado con cronograma-->
			<div class="mb-2">
				<div class="md:flex justify-start items-center">
					<span class="text-s flex flex-row gap-2 items-center">Horario: <Button classes="text-xs" action={openPopupHorario}>Cambiar</Button></span>
					{#if horarioSeleccionado}
						<div class="ml-4 flex flex-col justify-start items-center md:flex-row md:justify-center md:gap-2">
							<div>{formatDate(data.fechaDesde, true)}</div>
							<div>a</div>
							<div>{formatDate(data.fechaHasta, true)}</div>
						</div>
						{#if data.precioOrganizacion !== null && !data.administradorEspacio}
							<span>Cuota por organización: ${data.precioOrganizacion.toFixed(2)}</span>
						{/if}
					{/if}
				</div>
			</div>
		{:else if data.nombreEspacio && !data.espacioPublico && !data.usarCronograma}
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
            <Warning text="La fecha y hora es obligatoria" visible={(!data.nombreEspacio || data.espacioPublico || !data.espacioPublico && !data.usarCronograma ) && (data.fechaDesde === null || data.fechaHasta === null)}/>
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

		<div class="mb-2 flex flex-col gap-2 md:flex-row md:items-baseline">
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
			bind:selected={tipoInscripcionSeleccionado} 
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
				Precio más comisión: ${(data.precioInscripcion * (1 + data.comisionInscripcion)).toFixed(2).replace(".", ",")}
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

        {#if !data.espacioPublico}
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
		<Button action={() => goto(`/Evento/${id}`)}>Cancelar</Button>
		<Button action={guardarEvento}>Guardar</Button>
		<Button action={() => goto(`/Evento/${id}/Inscripciones`)}>Administrar inscripciones</Button>
		{#if puedeEditarRangos}
			<Button action={() => goto(`/Evento/${id}/GestionarAdministradores`)}>Gestionar administradores</Button>
		{/if}
		{#if puedeDejarAdmin}
			<Button action={() => {popupDejarAdminVisible = true}}>Dejar de ser administrador</Button>
		{/if}
	</div>
</div>
{/if}

<!-- Popups -->
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
	¿Está seguro que desea dejar de ser administrador del evento?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupDejarAdminVisible = false}}>Cancelar</Button>
		<Button action={dejarDeSerAdministrador}>Confirmar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorPermiso} redir={previousPage}>
	No tiene permiso para administrar este evento.
</PopupError>

<PopupError bind:visible={errorVisible}>
	{error}
</PopupError>

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