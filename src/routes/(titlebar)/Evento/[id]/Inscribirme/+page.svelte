<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { onMount } from "svelte";
	import { get } from "svelte/store";
	import Button from "$lib/components/Button.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import MapDisplay from "$lib/components/MapDisplay.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import { startPopupPago } from "$lib/components/PopupPago.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import { formatDate } from "$lib/components/DatePicker.svelte";
	import { token, permisos } from "$lib/stores";
	import { EventosService } from "$lib/services/EventosService";
	import { HttpError } from "$lib/request/request";
	import type DTOEventoParaInscripcion from "$lib/dtos/eventos/DTOEventoParaInscripcion";
	import type DTOInscripcion from "$lib/dtos/eventos/DTOInscripcion";
	import type DTOPago from "$lib/dtos/usuarios/DTOPago";
	import Warning from "$lib/components/Warning.svelte";

	$: errorPermiso = false;
	$: errorGenerico = "";
	$: errorGenericoVisible = false;
	$: popupExitoVisible = false;

	$: id = Number(page.params.id);
	let evento: DTOEventoParaInscripcion | null = null;

	let invitados: Array<{
		nombre: string,
		apellido: string,
		dni: string
	}> = [];

	function validateNombre(val: string) {
		const trimmed = val.trim();
		if (trimmed.length === 0) {
			return { valid: false, reason: "El nombre es obligatorio" };
		}
		if (trimmed.length < 1 || trimmed.length > 30) {
			return { valid: false, reason: "El nombre debe tener entre 1 y 30 caracteres" };
		}
		return { valid: true, reason: undefined };
	}

	function validateApellido(val: string) {
		const trimmed = val.trim();
		if (trimmed.length === 0) {
			return { valid: false, reason: "El apellido es obligatorio" };
		}
		if (trimmed.length < 1 || trimmed.length > 30) {
			return { valid: false, reason: "El apellido debe tener entre 1 y 30 caracteres" };
		}
		return { valid: true, reason: undefined };
	}

	function validateDNI(val: string) {
		const trimmed = val.trim();
		if (trimmed.length === 0) {
			return { valid: false, reason: "El DNI es obligatorio" };
		}
		if (!/^\d{7,8}$/.test(trimmed)) {
			return { valid: false, reason: "El DNI debe ser numérico de 7 u 8 dígitos" };
		}
		return { valid: true, reason: undefined };
	}

	function agregarInvitado() {
		if (!evento) return;
		
		const maxInvitados = Math.min(
			evento.cantidadMaximaInvitados,
			evento.limiteParticipantes - 1
		);
		
		if (invitados.length < maxInvitados) {
			invitados = [...invitados, { nombre: "", apellido: "", dni: "" }];
		}
	}

	function eliminarInvitado(index: number) {
		invitados = invitados.filter((_, i) => i !== index);
	}

	function calcularPrecioTotal(): number {
		if (!evento) return 0;
		return evento.precioPorAsistente * (1 + invitados.length);
	}

	function validarFormulario(): boolean {
		if (!evento) return false;

		// Validate all invitados
		for (let i = 0; i < invitados.length; i++) {
			const inv = invitados[i];
			if (!validateNombre(inv.nombre).valid ||
				!validateApellido(inv.apellido).valid ||
				!validateDNI(inv.dni).valid) {
				return false;
			}
		}

		return true;
	}

	async function realizarPago() {
		if (!evento) {
			return;
		}

		if (!validarFormulario()) {
			return;
		}

		const inscripcionData: DTOInscripcion = {
			idEvento: id,
			username: "", // Will be set by backend
			invitados: invitados,
			precioInscripcion: calcularPrecioTotal(),
			datosPago: []
		};

		try {
			const response = await EventosService.verificarDatosPrePago(inscripcionData);
			if (!response.valido) {
				errorGenerico = "Los datos ingresados no son válidos";
				errorGenericoVisible = true;
				return;
			}

			if (response.preferencias.length === 0) {
				procesarPago([]);
			} else {		
				startPopupPago(procesarPago, response.preferencias);
			}

		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
	}

	async function procesarPago(datosPago: DTOPago[]) {
		if (!evento) return;		

		const inscripcionData: DTOInscripcion = {
			idEvento: id,
			username: "",
			invitados: invitados,
			precioInscripcion: calcularPrecioTotal(),
			datosPago: datosPago
		};

		try {
			await EventosService.inscribirse(inscripcionData);
			popupExitoVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
	}

	onMount(async () => {
		if (get(token) === "") {
			goto("/");
			return;
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("InscripcionEventos")) {
			errorPermiso = true;
			return;
		}

		try {
			evento = await EventosService.obtenerEventoParaInscripcion(id);
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
	});
</script>

<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-s text-center">Inscripción</h1>

		{#if evento}
			<div class="text-center">
				<h2 class="text-m">{evento.nombre}</h2>
				<p class="text-xs mt-2">{evento.descripcion}</p>
			</div>

			{#if evento.idSuperevento}
				<div class="text-center text-xs">
					<p>Este evento pertenece a un superevento.</p>
					<p>¿Desea verlo?</p>
                    <div class="flex justify-center">
					    <Button classes="text-xs" action={() => goto(`/SuperEvento/${evento !== null ? evento.idSuperevento : ""}`)}>Ver Superevento</Button>
                    </div>
				</div>
			{/if}

			<div>
				<h3>Horario</h3>
				<p class="ml-4 text-center">
					{formatDate(evento.fechaDesde, true)}
					<br/>
					a
					<br/>
					{formatDate(evento.fechaHasta, true)}
				</p>
			</div>

			{#if evento.espacio}
				<div>
					<h3>Espacio</h3>
					<p class="ml-4">{evento.espacio.nombre}</p>
					<p class="ml-4">{evento.espacio.descripcion}</p>
				</div>
			{/if}

			<div>
				<h3>Dirección</h3>
				<p class="ml-4">{evento.direccion}</p>
			</div>

			{#if evento.ubicacion.latitud && evento.ubicacion.longitud}
				<div>
					<h3>Ubicación</h3>
					<MapDisplay 
						latitude={evento.ubicacion.latitud} 
						longitude={evento.ubicacion.longitud}
                        marked={{x: evento.ubicacion.latitud, y: evento.ubicacion.longitud}}
						zoom={14}
						disableMarking
					/>
				</div>
			{/if}

			<div class="flex justify-between items-center">
				<h3>Invitados</h3>
				<Button 
					icon="/icons/plus.svg" 
					action={agregarInvitado}
					disabled={invitados.length >= Math.min(evento.cantidadMaximaInvitados, evento.limiteParticipantes - 1)}
				></Button>
			</div>

            
			<div class="flex flex-col gap-4">
			    {#each invitados as invitado, i}
					<div class="flex flex-row w-full flex-wrap gap-2 items-center">
						<TextField 
							label={null} 
							placeholder="Nombre..." 
							bind:value={invitado.nombre}
							classes="flex-1"
						/>
						<TextField 
							label={null} 
							placeholder="Apellido..." 
							bind:value={invitado.apellido}
							classes="flex-1"
						/>
                        <TextField 
                            label={null} 
                            placeholder="Número de DNI..." 
                            bind:value={invitado.dni}
							classes="flex-1"
                        />
                        <Button 
                            icon="/icons/cross.svg" 
                            action={() => eliminarInvitado(i)}
                            classes="h-fit"
                        ></Button>
                        <Warning text="Ingrese nombre, apellido y DNI del invitado" visible={!validateNombre(invitado.nombre).valid || !validateApellido(invitado.apellido).valid || !validateDNI(invitado.dni).valid}/>
					</div>
			    {/each}
            </div>

			<div>
				Precio de inscripción: ${(evento.precioPorAsistente * (1 + invitados.length)).toFixed(2).replace(".", ",")}
			</div>
		{/if}
	</div>

	<div class="flex gap-2 h-fit p-2 justify-center items-center">
		<Button action={() => goto(`/Evento/${id}`)}>Cancelar</Button>
		{#if evento !== null}
			<Button action={realizarPago} disabled={!evento || !validarFormulario()}>
				{evento.precioPorAsistente * (1 + invitados.length) === 0 ? "Inscribirme" : "Realizar pago"}
			</Button>
		{/if}
	</div>
</div>

<Popup bind:visible={popupExitoVisible} fitH fitW>
	Inscripción realizada exitosamente
	<div class="flex justify-center items-center w-full">
		<Button action={() => goto(`/Evento/${id}`)}>Aceptar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorPermiso}>
	No tiene permiso para inscribirse a eventos.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
	{errorGenerico}
</PopupError>