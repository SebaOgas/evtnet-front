<script lang="ts">
	import { afterNavigate, goto } from "$app/navigation";
	import { base } from "$app/paths";
	import { page } from "$app/state";
	import Button from "$lib/components/Button.svelte";
	import { formatDate } from "$lib/components/DatePicker.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupBusquedaUsuarios from "$lib/components/PopupBusquedaUsuarios.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import type DTOAdministradores from "$lib/dtos/eventos/DTOAdministradores";
	import type DTOBusquedaUsuario from "$lib/dtos/usuarios/DTOBusquedaUsuario";
	import { HttpError } from "$lib/request/request";
	import { EventosService } from "$lib/services/EventosService";
	import { UsuariosService } from "$lib/services/UsuariosService";
	import { permisos, token, username } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

    let previousPage: string = base;

    afterNavigate(({from}) => {
        previousPage = from?.url.pathname || previousPage
    }) 

	$: id = Number(page.params.id);
	$: data = null as DTOAdministradores | null;

    async function cargarDatos() {
        popupAgregarExitoVisible = false;
        popupQuitarExitoVisible = false;
        popupOrganizadorExitoVisible = false;

        try {
			data = await EventosService.obtenerAdministradores(id);

			if (!data.esOrganizador) {
                errorPermiso = true;
                return;
            }
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
    }

	onMount(async () => {
		if (get(token) === "") {
			goto("/");
			return;
		}

		if (!get(permisos).includes("AdministracionEventos")) {
			errorPermiso = true;
			return;
		}

		cargarDatos();
	});

	// Error handling
	$: error = "";
	$: errorVisible = false;
	$: errorPermiso = false;

	// Popups agregar
	$: popupAgregarExitoVisible = false;
	$: popupAgregarConfirmacionVisible = false;

	// Popups quitar
	$: popupQuitarExitoVisible = false;
	$: popupQuitarConfirmacionVisible = false;

	// Popups organizador
	$: popupOrganizadorExitoVisible = false;
	$: popupOrganizadorConfirmacionVisible = false;




	
    $: adminSelec = null as null | {nombre: string, apellido: string, username: string}
	
	async function confirmarAgregarAdmin() {
        if (adminSelec === null) return;
		try {
			await EventosService.agregarAdministrador(id, adminSelec.username);
            adminSelec = null;
			popupAgregarExitoVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
		popupAgregarConfirmacionVisible = false;
	}
	
	async function confirmarQuitarAdmin() {
        if (adminSelec === null) return;
		try {
			await EventosService.quitarAdministrador(id, adminSelec.username);
            adminSelec = null;
			popupQuitarExitoVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
		popupQuitarConfirmacionVisible = false;
	}
	
	async function confirmarEntregarOrganizadorAdmin() {
        if (adminSelec === null) return;
		try {
			await EventosService.entregarOrganizador(id, adminSelec.username);
            adminSelec = null;
			popupOrganizadorExitoVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
		popupOrganizadorConfirmacionVisible = false;
	}


	function loadFotoDePerfil(img: HTMLImageElement, username: string) {	
		(async () => {
			img.src = await UsuariosService.obtenerFotoDePerfil(username);
			img.style.display = "block";
		})()	
	}


    $: usuario = null as null | DTOBusquedaUsuario;
	$: popupBusquedaUsuariosVisible = false;
	async function buscarUsuarios(valor: string) {
		return await EventosService.buscarUsuariosNoAdministradores(id, valor);
	}

    $: (() => {
        if (usuario === null) return;
        adminSelec = usuario;
        popupAgregarConfirmacionVisible = true;
    })()
 
</script>

{#if data !== null}
<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-s text-center">
			Evento
		</h1>
		<h1 class="text-m text-center">
			{data.nombreEvento}
		</h1>
		<h1 class="text-m flex justify-center items-center gap-2">
			<span>Gestionar Administradores</span>
            <Button icon="/icons/plus.svg" action={() => popupBusquedaUsuariosVisible = true}></Button>
		</h1>

        <div class="flex flex-col gap-4">
            {#each data.administradores as admin}
                {#if admin.vigente}
                    <div class="flex flex-col w-full gap-2 items-start">
                        <div class="flex flex-row justify-between w-full">
                            <div class="flex items-center gap-2">
                                <img use:loadFotoDePerfil={admin.username} alt="Foto de perfil" class="h-[40px] w-[40px] rounded-full object-cover cursor-pointer hidden">
                                <div>{admin.nombre} {admin.apellido}</div>
                            </div>
                            <div class="flex gap-2 items-center w-fit">
                                {#if admin.username !== get(username)}
                                    <Button icon="/icons/upgrade.svg" action={() => {adminSelec = admin; popupOrganizadorConfirmacionVisible = true}}></Button>
                                    <Button icon="/icons/cross.svg" action={() => {adminSelec = admin; popupQuitarConfirmacionVisible = true}}></Button>
                                {/if}
                            </div>
                        </div>
                        {#if admin.historico.filter(h => h.organizador).length > 0}
							<div class="flex flex-col items-center gap-2 w-full">
								<span>Organizador entre:</span>
								{#each admin.historico as fechas}
									{#if fechas.organizador}
										<span>{formatDate(fechas.fechaDesde, true)} - {fechas.fechaHasta !== null ? formatDate(fechas.fechaHasta, true) : "actualidad"}</span>
									{/if}
								{/each}
							</div>
						{/if}
						{#if admin.historico.filter(h => !h.organizador).length > 0}
							<div class="flex flex-col items-center gap-2 w-full">
								<span>Administrador entre:</span>
								{#each admin.historico as fechas}
									{#if !fechas.organizador}
										<span>{formatDate(fechas.fechaDesde, true)} - {fechas.fechaHasta !== null ? formatDate(fechas.fechaHasta, true) : "actualidad"}</span>
									{/if}
								{/each}
							</div>
						{/if}
                    </div>
                {/if}
            {/each}
        </div>

        <div class="text-m w-full text-center">Administradores anteriores</div>

        <div class="flex flex-col gap-4">
            {#each data.administradores as admin}
                {#if !admin.vigente}
                    <div class="flex flex-col w-full gap-2 items-start">
                        <div class="flex flex-row justify-between w-full">
                            <div class="flex items-center gap-2">
                                <img use:loadFotoDePerfil={admin.username} alt="Foto de perfil" class="h-[40px] w-[40px] rounded-full object-cover cursor-pointer hidden">
                                <div>{admin.nombre} {admin.apellido}</div>
                            </div>
                            <div class="flex gap-2 items-center w-fit">
                                {#if admin.username !== get(username)}
                                    <Button icon="/icons/check.png" action={() => {adminSelec = admin; popupAgregarConfirmacionVisible = true}}></Button>
                                {/if}
                            </div>
                        </div>
                        {#if admin.historico.filter(h => h.organizador).length > 0}
							<div class="flex flex-col items-center gap-2 w-full">
								<span>Organizador entre:</span>
								{#each admin.historico as fechas}
									{#if fechas.organizador}
										<span>{formatDate(fechas.fechaDesde, true)} - {fechas.fechaHasta !== null ? formatDate(fechas.fechaHasta, true) : "actualidad"}</span>
									{/if}
								{/each}
							</div>
						{/if}
						{#if admin.historico.filter(h => !h.organizador).length > 0}
							<div class="flex flex-col items-center gap-2 w-full">
								<span>Administrador entre:</span>
								{#each admin.historico as fechas}
									{#if !fechas.organizador}
										<span>{formatDate(fechas.fechaDesde, true)} - {fechas.fechaHasta !== null ? formatDate(fechas.fechaHasta, true) : "actualidad"}</span>
									{/if}
								{/each}
							</div>
						{/if}
                    </div>
                {/if}
            {/each}
        </div>
	</div>

	<div class="flex flex-wrap gap-2 h-fit p-2 justify-center items-center">
		<Button action={() => goto(`/Evento/${id}/Administrar`)}>Atrás</Button>
	</div>
</div>
{/if}

<!-- Popups -->
<Popup title="Confirmar" bind:visible={popupAgregarConfirmacionVisible} fitW fitH>
	<div class="grow overflow-y-auto">
		<p>¿Está seguro de que quiere designar a este usuario como administrador?</p>
        <p>{adminSelec?.nombre}, {adminSelec?.apellido} ({adminSelec?.username})</p>
	</div>
	<div class="flex gap-2 h-fit p-2 justify-center items-center">
		<Button action={() => {popupAgregarConfirmacionVisible = false}}>Cancelar</Button>
		<Button action={() => confirmarAgregarAdmin()}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={popupAgregarExitoVisible} fitH fitW>
	Administrador designado exitosamente
	<div class="flex justify-center items-center w-full">
		<Button action={cargarDatos}>Aceptar</Button>
	</div>
</Popup>


<Popup title="Confirmar" bind:visible={popupQuitarConfirmacionVisible} fitW fitH>
	<div class="grow overflow-y-auto">
		<p>¿Está seguro de quitar los privilegios de administrador a este usuario?</p>
        <p>{adminSelec?.nombre}, {adminSelec?.apellido} ({adminSelec?.username})</p>
	</div>
	<div class="flex gap-2 h-fit p-2 justify-center items-center">
		<Button action={() => {popupQuitarConfirmacionVisible = false}}>Cancelar</Button>
		<Button action={() => confirmarQuitarAdmin()}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={popupQuitarExitoVisible} fitH fitW>
	El usuario ya no es administrador.
	<div class="flex justify-center items-center w-full">
		<Button action={cargarDatos}>Aceptar</Button>
	</div>
</Popup>


<Popup title="Confirmar" bind:visible={popupOrganizadorConfirmacionVisible} fitW fitH>
	<div class="grow overflow-y-auto">
		<p>¿Está seguro de designar a este usuario como organizador?</p>
        <p>{adminSelec?.nombre}, {adminSelec?.apellido} ({adminSelec?.username})</p>
        <p>Usted ya no será organizador, sino que pasará a ser solo administrador del evento.</p>
	</div>
	<div class="flex gap-2 h-fit p-2 justify-center items-center">
		<Button action={() => {popupOrganizadorConfirmacionVisible = false}}>Cancelar</Button>
		<Button action={() => confirmarEntregarOrganizadorAdmin()}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={popupOrganizadorExitoVisible} fitH fitW>
	Usuario designado como organizador exitosamente.
	<div class="flex justify-center items-center w-full">
		<Button action={() => goto("./")}>Aceptar</Button>
	</div>
</Popup>


<PopupError bind:visible={errorPermiso} redir={previousPage}>
	No tiene permiso para administrar este evento.
</PopupError>

<PopupError bind:visible={errorVisible}>
	{error}
</PopupError>

<PopupBusquedaUsuarios searchFunction={buscarUsuarios} bind:selected={usuario} bind:visible={popupBusquedaUsuariosVisible}/>