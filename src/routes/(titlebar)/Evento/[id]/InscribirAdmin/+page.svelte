<script lang="ts">
	import { goto } from "$app/navigation";
	import { base } from "$app/paths";
	import { page } from "$app/state";
	import Button from "$lib/components/Button.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupBusquedaUsuarios from "$lib/components/PopupBusquedaUsuarios.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import type DTODatosParaInscripcion from "$lib/dtos/eventos/DTODatosParaInscripcion";
	import type DTOInscripcion from "$lib/dtos/eventos/DTOInscripcion";
	import type DTOBusquedaUsuario from "$lib/dtos/usuarios/DTOBusquedaUsuario";
	import { HttpError } from "$lib/request/request";
	import { EventosService } from "$lib/services/EventosService";
	import { UsuariosService } from "$lib/services/UsuariosService";
	import { permisos, token } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

    let previousPage: string = base;

	$: id = Number(page.params.id);
	$: evento = null as DTODatosParaInscripcion | null;

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
			evento = await EventosService.obtenerDatosParaInscripcion(id);

			if (!evento.esAdministrador && !evento.esOrganizador) {
                errorPermiso = true;
                return;
            }
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
	});

	// Error handling
	$: error = "";
	$: errorVisible = false;
	$: errorPermiso = false;

	// Success popup
	$: popupExitoVisible = false;
	$: popupConfirmacionVisible = false;

	$: usuario = null as null | DTOBusquedaUsuario;

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
	
	async function confirmar() {
		if (usuario === null) return;

		const data: DTOInscripcion = {
			idEvento: id,
			username: usuario.username,
			invitados: invitados,
			precioInscripcion: 0,
			datosPago: undefined
		};

		try {
			await EventosService.inscribirUsuario(data);
			popupExitoVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
		popupConfirmacionVisible = false;
	}


	function loadFotoDePerfil(img: HTMLImageElement, username: string) {	
		(async () => {
			img.src = await UsuariosService.obtenerFotoDePerfil(username);
			img.style.display = "block";
		})()	
	}

	$: popupBusquedaUsuariosVisible = false;
	async function buscarUsuarios(valor: string) {
		return await EventosService.buscarUsuariosNoInscriptos(id, valor);
	}
 
</script>

{#if evento !== null}
<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-s text-center">
			Inscripción
		</h1>
		<h1 class="text-m text-center">
			{evento.nombreEvento}
		</h1>

		{#if usuario === null}
			<div class="w-full flex justify-center">
				<Button action={() => popupBusquedaUsuariosVisible = true}>Seleccionar usuario</Button>
			</div>
		{:else}
			<div class="flex flex-row justify-between">
				<div class="flex items-center gap-2">
					<img use:loadFotoDePerfil={usuario.username} alt="Foto de perfil" class="h-[40px] w-[40px] rounded-full object-cover cursor-pointer hidden">
					<div>{usuario.nombre} {usuario.apellido}</div>
				</div>
				<Button action={() => popupBusquedaUsuariosVisible = true}>Cambiar</Button>
			</div>
		{/if}
	</div>

	<div class="flex flex-wrap gap-2 h-fit p-2 justify-center items-center">
		<Button action={() => goto(`/Evento/${id}/Inscripciones`)}>Cancelar</Button>
		{#if usuario !== null}
			<Button action={() => {popupConfirmacionVisible = true;}} disabled={!validarFormulario()}>Inscribir</Button>
		{/if}
	</div>
</div>
{/if}

<!-- Popups -->
<Popup title="Confirmar cambios" bind:visible={popupConfirmacionVisible} fitW fitH>
	<div class="grow overflow-y-auto">
		<p>¿Está seguro de que desea realizar esta inscripción?</p>

		<p>No se le cobrará nada al usuario.</p>
	</div>
	<div class="flex gap-2 h-fit p-2 justify-center items-center">
		<Button action={() => {popupConfirmacionVisible = false}}>Cancelar</Button>
		<Button action={() => confirmar()}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={popupExitoVisible} fitH fitW>
	Inscripción realizada exitosamente
	<div class="flex justify-center items-center w-full">
		<Button action={() => {goto(`/Evento/${id}/Inscripciones`)}}>Aceptar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorPermiso} redir={previousPage}>
	No tiene permiso para administrar este evento.
</PopupError>

<PopupError bind:visible={errorVisible}>
	{error}
</PopupError>

<PopupBusquedaUsuarios searchFunction={buscarUsuarios} bind:selected={usuario} bind:visible={popupBusquedaUsuariosVisible}/>