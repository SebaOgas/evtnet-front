<script lang="ts">
	import { afterNavigate, goto } from "$app/navigation";
	import { base } from "$app/paths";
	import Button from "$lib/components/Button.svelte";
	import { formatDate } from "$lib/components/DatePicker.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import Table from "$lib/components/Table.svelte";
	import type DTOBackup from "$lib/dtos/backups/DTOBackup";
	import type DTORegistroMeta from "$lib/dtos/registros/DTORegistroMeta";
	import { HttpError } from "$lib/request/request";
	import { BackupsService } from "$lib/services/BackupsService";
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


    let backups : DTOBackup[] = []

    onMount(async () => {
        if (get(token) === "") {
            goto("/");
        }

        if(!get(permisos).includes("RealizacionBackup")) {
            errorPermiso = true;
            return;
        }

        try {
            backups = await BackupsService.obtenerBackups();
        } catch (e) {
            if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			} 
        }
    })


	function formatNombre(b: DTOBackup) {
		let ret = ""
		if (b.programacion === "Automática") {
			ret = `${b.tipo} ${b.id}`;
			if (b.tipo === "Incremental")
				ret += ` (${b.dependeDe})`;
		} else {
			ret = `${b.programacion}, `;
			if (b.pendiente) {
				ret += `Pendiente `;
			} else {
				ret += `Completa `;
			}
			ret += `${b.id}`;
		}
		return ret;
	}
</script>


<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-m flex flex-row flex-wrap gap-2 items-baseline">
            <span>Copias de seguridad</span>
            <Button>Nueva Copia Manual</Button>
            <Button>Programar Copia Automática</Button>
		</h1>

		<Table cols={["Ruta", "Tamaño", "Fecha y Hora", "Nombre", "Acciones"]}>
			{#each backups as b}
				<tr>
					<td class="!text-wrap !text-start !break-all">{b.ruta}</td>
					<td>{b.tamano === null ? "-" : b.tamano.toFixed(1).replace(".", ",") + " GB"}</td>
					<td class="!text-wrap">{formatDate(b.fechaHora, true)}</td>
					<td class="!text-wrap">{formatNombre(b)}</td>
					<td>
						<div class="w-full flex justify-center items-center">
							<Button icon="/icons/trash.svg"></Button>
						</div>
					</td>
				</tr>
			{/each}
		</Table>

	</div>
</div>

<PopupError bind:visible={errorPermiso} redir={previousPage}>
	No tiene permiso para realizar copias de seguridad.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
	{errorGenerico}
</PopupError>