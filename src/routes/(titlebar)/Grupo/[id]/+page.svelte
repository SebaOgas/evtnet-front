<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import Button from "$lib/components/Button.svelte";
	import { formatDate } from "$lib/components/DatePicker.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import type DTOGrupo from "$lib/dtos/grupos/DTOGrupo";
	import { HttpError } from "$lib/request/request";
	import { GruposService } from "$lib/services/GruposService";
	import { UsuariosService } from "$lib/services/UsuariosService";
	import { permisos } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

    $: errorPermiso = false;

	$: error = "";
	$: errorVisible = false;

    $: id = Number(page.params.id);

    let grupo : DTOGrupo | null = null;
    
    let puedeAdministrar = false;

    onMount(async () => {
        if(!get(permisos).includes("ParticipacionGrupos")) {
            errorPermiso = true;
            return;
        }

        puedeAdministrar = get(permisos).includes("AdministracionGrupos")

        load();
    })

	async function load() {
		grupo = await GruposService.obtenerGrupo(id);
	}

    let popupBaja = false;
    let exitoBaja = false;

    async function baja() {
        try {
			await GruposService.salir(id);
            exitoBaja = true;
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}

    }

    function loadFotoDePerfil(img: HTMLImageElement, username: string) {	
		(async () => {
			img.src = await UsuariosService.obtenerFotoDePerfil(username);
			img.style.display = "block";
		})()	
	}


	$: popupInvitacion = false;
	$: aceptarInvitacion = true;
    $: exitoInvitacion = false;
    $: mensajeInvitacion = "";
    async function toggleInvitacion(aceptar: boolean) {
		if (grupo === null) return;
		popupInvitacion = true;
        aceptarInvitacion = aceptar;
        if (aceptarInvitacion) {
            mensajeInvitacion = `¿Estás seguro de que deseás unirte al grupo ${grupo.nombre}?`
        } else {
            mensajeInvitacion = `¿Estás seguro de que deseás rechazar la invitación al grupo ${grupo.nombre}?`
        }
    }

    async function ejecutarToggleInvitacion() {
		if (grupo === null) return;
        try {
			await GruposService.toggleInvitacion(grupo.id, aceptarInvitacion);
			if (!aceptarInvitacion) goto(`/MisGrupos`);
            load();
			popupInvitacion = false;
            exitoInvitacion = true;
            if (aceptarInvitacion) {
                mensajeInvitacion = "Te has unido al grupo exitosamente"
            } else {
                mensajeInvitacion = "Invitación rechazada"
            }
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
    }

</script>


<div id="content">
    {#if grupo !== null}
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-s text-center">
			Grupos
		</h1>
		<h1 class="text-m text-center">
			{grupo.nombre}
		</h1>
        <div class="text-xs">
            {grupo.descripcion}
        </div>
        <div class="text-xs mb-4">
            Creado en {formatDate(grupo.fechaAlta, true)}
        </div>
        <div>
            <span>Participantes:</span>
            <div class="flex flex-col gap-2">
                {#each grupo.participantes as p}
                    <div class="flex flex-col w-full gap-2 items-start">
                        <div class="flex flex-row justify-start w-full items-center gap-2">
                            <img use:loadFotoDePerfil={p.username} alt="Foto de perfil" class="h-[40px] w-[40px] rounded-full object-cover cursor-pointer hidden">
                            <div>{p.nombre} {p.apellido} {#if !p.aceptado}<span class="text-xs">(Pendiente de aceptación)</span>{/if}</div>
                        </div>
                        <div class="ml-8">
							{#if p.aceptado}
								Se unió en {formatDate(p.fechaHoraUnion, true)}
							{:else}
								Invitado en {formatDate(p.fechaHoraUnion, true)}
							{/if}
							
						</div>
                    </div>
                {/each}
            </div>
        </div>


	</div>

	<div class="flex flex-wrap gap-2 h-fit p-2 justify-center items-center">
		<Button action={() => goto(`/MisGrupos`)}>Atrás</Button>
		{#if !grupo.invitado}
			{#if grupo.esAdministrador && puedeAdministrar}
				<Button action={() => goto(`/Grupo/${id}/Modificar`)}>Modificar</Button>
			{/if}
			<Button action={() => {popupBaja = true}}>Salir</Button>
			<Button classes="aspect-square" icon="/icons/chat.svg" action={() => goto(`/Chat/${grupo?.idChat}`)}></Button>
		{:else}
			<Button classes="h-fit" action={() => {toggleInvitacion(true)}}>Aceptar</Button>
			<Button classes="h-fit" action={() => {toggleInvitacion(false)}}>Rechazar</Button>
		{/if}
	</div>
	{/if}
</div>

<Popup bind:visible={popupBaja} fitH fitW>
	¿Está seguro de que desea salir del grupo?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupBaja = false}}>Cancelar</Button>
		<Button action={baja}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={exitoBaja} fitH fitW>
	Salió del grupo exitosamente
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {goto(`/MisGrupos`)}}>Aceptar</Button>
	</div>
</Popup>

<Popup visible={popupInvitacion} fitH fitW>
	{mensajeInvitacion}
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupInvitacion = false}}>Cancelar</Button>
		<Button action={ejecutarToggleInvitacion}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={exitoInvitacion} fitH fitW>
	{mensajeInvitacion}
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {exitoInvitacion = false}}>Aceptar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorVisible}>
    {error}
</PopupError>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para ver sus grupos.
</PopupError>
