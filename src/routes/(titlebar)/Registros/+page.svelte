<script lang="ts">
	import { afterNavigate, goto } from "$app/navigation";
	import { base } from "$app/paths";
	import Button from "$lib/components/Button.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import { permisos, token } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

    let previousPage: string = base;

	afterNavigate(({from}) => {
		previousPage = from?.url.pathname || previousPage
	});

	$: errorPermiso = false;

    let permisosList : string[] = [];

    onMount(async () => {
        if (get(token) === "") {
            goto("/");
        }

        permisosList = get(permisos);

        if(!permisosList.includes("VisionLogUsuariosGrupos") && 
            !permisosList.includes("VisionLogEventos") && 
            !permisosList.includes("VisionLogEspacios") && 
            !permisosList.includes("VisionLogPagos") && 
            !permisosList.includes("VisionLogParametros")) {
            errorPermiso = true;
            return;
        }
    })
</script>


<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-m text-center md:text-start">
			Registros
		</h1>

        {#if permisosList.includes("VisionLogUsuariosGrupos")}
            <div class="flex justify-start gap-2 items-baseline">
                <span>Registro de Usuarios y Grupos</span>
                <Button action={() => goto("/Registros/UsuariosGrupos")}>Ver</Button>
            </div>
        {/if}
        {#if permisosList.includes("VisionLogEventos")}
            <div class="flex justify-start gap-2 items-baseline">
                <span>Registro de Eventos</span>
                <Button action={() => goto("/Registros/Eventos")}>Ver</Button>
            </div>
        {/if}
        {#if permisosList.includes("VisionLogEspacios")}
            <div class="flex justify-start gap-2 items-baseline">
                <span>Registro de Espacios</span>
                <Button action={() => goto("/Registros/Espacios")}>Ver</Button>
            </div>
        {/if}
        {#if permisosList.includes("VisionLogPagos")}
            <div class="flex justify-start gap-2 items-baseline">
                <span>Registro de Pagos</span>
                <Button action={() => goto("/Registros/Pagos")}>Ver</Button>
            </div>
        {/if}
        {#if permisosList.includes("VisionLogParametros")}
            <div class="flex justify-start gap-2 items-baseline">
                <span>Registro de Parámetros</span>
                <Button action={() => goto("/Registros/Parametros")}>Ver</Button>
            </div>
        {/if}
	</div>
</div>

<PopupError bind:visible={errorPermiso} redir={previousPage}>
	No tiene permiso para acceder a ver registros.
</PopupError>