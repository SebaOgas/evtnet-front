<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import { HttpError } from "$lib/request/request";
	import { GruposService } from "$lib/services/GruposService";
	import { permisos } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

    $: errorPermiso = false;

	$: error = "";
	$: errorVisible = false;

    $: grupos = [] as {id: number, nombre: string, idChat: number}[];

    let puedeCrear = false;

    onMount(() => {
        if(!get(permisos).includes("ParticipacionGrupos")) {
            errorPermiso = true;
            return;
        }

        puedeCrear = get(permisos).includes("CreacionGrupos")

        load();
    })

    async function load() {
        try {
			grupos = await GruposService.obtenerMisGrupos();
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
    }

    let popupBaja = false;
    let grupoBaja : number | null = null;
    $: popupBaja = grupoBaja === null ? false : true;
    let exitoBaja = false;

    async function baja() {
        if (grupoBaja === null) {
            error = "No se pudo identificar al rol a dar de baja";
            errorVisible = true;
            return;
        }

        try {
			await GruposService.bajaGrupo(grupoBaja);
            load();
            grupoBaja = null;
            exitoBaja = true;
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}

    }

</script>


<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-m flex justify-center items-center gap-2">
			<span>Mis Grupos</span>
            {#if puedeCrear}
                <Button icon="/icons/plus.svg" action={() => goto("/CrearGrupo")}></Button>
            {/if}
		</h1>

        <div class="flex flex-col gap-4 md:gap-16 md:flex-row md:flex-wrap md:justify-center">
            {#each grupos as g}
                <div class="flex flex-row justify-between items-center gap-2 md:max-w-[45vw] lg:max-w-[30vw]">
                    <div>{g.nombre}</div>
                    <div class="flex justify-center items-center gap-2">
                        <Button icon="/icons/view.svg" classes="h-fit" action={() => {goto(`/Grupo/${g.id}`)}}></Button>
                        <Button icon="/icons/chat.svg" classes="h-fit" action={() => {goto(`/Chat/${g.idChat}`)}}></Button>
                        <Button icon="/icons/trash.svg" classes="h-fit" action={() => {grupoBaja = g.id}}></Button>
                    </div>
                </div>
            {/each}
        </div>
	</div>

	<div class="flex flex-wrap gap-2 h-fit p-2 justify-center items-center">
		<Button action={() => goto(`/Perfil`)}>Atrás</Button>
	</div>
</div>

<Popup bind:visible={popupBaja} fitH fitW>
	¿Está seguro de que desea dar de baja a este grupo?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {grupoBaja = null}}>Cancelar</Button>
		<Button action={baja}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={exitoBaja} fitH fitW>
	Rol dado de baja exitosamente
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {exitoBaja = false}}>Aceptar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorVisible}>
    {error}
</PopupError>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para modificar su perfil.
</PopupError>
