<script lang="ts">
	import { afterNavigate, goto } from "$app/navigation";
	import { base } from "$app/paths";
	import Button from "$lib/components/Button.svelte";
	import DatePicker, { formatDate } from "$lib/components/DatePicker.svelte";
	import Popup from "$lib/components/Popup.svelte";
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

    onMount(() => {
        if (get(token) === "") {
            goto("/");
        }

        if(!get(permisos).includes("RealizacionBackup")) {
            errorPermiso = true;
            return;
        }

        load();
    })

	async function load() {
		try {
            backups = await BackupsService.obtenerBackups();
        } catch (e) {
            if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			} 
        }
	}


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

	// Copia Manuale
	$: popupManualVisible = false;
	$: fechaCopiaManual = null as Date | null;
	$: popupManualExitoVisible = false;

	async function programarCopiaManual() {
		if (fechaCopiaManual === null) return;
		try {
            await BackupsService.programarCopiaManual(fechaCopiaManual);
			fechaCopiaManual = null;
			popupManualVisible = false;
			popupManualExitoVisible = true;
        } catch (e) {
            if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			} 
        }
	}
</script>


<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="flex flex-row flex-wrap gap-2">
            <span class="text-m">Copias de seguridad</span>
            <Button action={() => popupManualVisible = true}>Nueva Copia Manual</Button>
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

<Popup bind:visible={popupManualVisible} title="Realizar Copia de Seguridad Manual" fitW fitH>
	<DatePicker time label="Fecha y hora:" minDate={new Date()} bind:value={fechaCopiaManual} classes="[&_.calendars-container]:!static"/>
	<div>Se realizará una copia de seguridad completa.</div>
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => popupManualVisible = false}>Atrás</Button>
		<Button action={programarCopiaManual} disabled={fechaCopiaManual===null}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={popupManualExitoVisible} title="Éxito" fitW fitH>
	<div>Copia programada exitosamente</div>
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {load(); popupManualExitoVisible = false;}}>Aceptar</Button>
	</div>
</Popup>



<PopupError bind:visible={errorPermiso} redir={previousPage}>
	No tiene permiso para realizar copias de seguridad.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
	{errorGenerico}
</PopupError>