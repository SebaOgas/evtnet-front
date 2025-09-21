<script lang="ts">
	import { afterNavigate, goto } from "$app/navigation";
	import { base } from "$app/paths";
	import Button from "$lib/components/Button.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import type DTORegistroMeta from "$lib/dtos/registros/DTORegistroMeta";
	import { HttpError } from "$lib/request/request";
	import { RegistrosService } from "$lib/services/RegistrosService";
	import { permisos, token } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

    let previousPage: string = base;

	afterNavigate(({from}) => {
		previousPage = from?.url.pathname || previousPage
	});

	$: errorPermiso = false;
    $: errorGenerico = ""
	$: errorGenericoVisible = false

    let permisosList : string[] = [];

    let registrosVisibles : DTORegistroMeta[] = []

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

        try {
            registrosVisibles = await RegistrosService.obtenerRegistros();
        } catch (e) {
            if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			} 
        }
    })
</script>


<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-m text-center md:text-start">
			Registros
		</h1>

        {#each registrosVisibles as r}
            <div class="flex justify-start gap-2 items-baseline">
                <span>Registro de {r.nombreFormateado}</span>
                <Button action={() => goto(`/Registros/${r.nombre}`)}>Ver</Button>
            </div>
        {/each}
	</div>
</div>

<PopupError bind:visible={errorPermiso} redir={previousPage}>
	No tiene permiso para acceder a ver registros.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
	{errorGenerico}
</PopupError>