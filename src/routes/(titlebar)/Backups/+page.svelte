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

	// Copia Manual
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


	// Eliminar copia
	$: popupEliminarVisible = false;
	$: copiaAEliminar = null as DTOBackup | null;
	$: popupEliminarExitoVisible = false;

	async function eliminarCopia() {
		if (copiaAEliminar === null) return;
		try {
            await BackupsService.eliminarCopia(copiaAEliminar);
			copiaAEliminar = null;
			popupEliminarVisible = false;
			popupEliminarExitoVisible = true;
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
						<div class="md:w-full flex justify-center items-center">
							<Button icon="/icons/trash.svg" action={() => {copiaAEliminar = b; popupEliminarVisible = true;}}></Button>
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


<Popup bind:visible={popupEliminarVisible} title="Eliminar Copia de Seguridad" fitW fitH>
	<div class="flex flex-col gap-2 md:max-w-[400px] mb-4">
		{#if copiaAEliminar !== null}
			<div>Fecha y hora: {formatDate(copiaAEliminar.fechaHora, true)}</div>

			<div>¿Está seguro de que desea eliminar esta copia de seguridad? Esta acción no puede ser deshecha.</div>

			{#if copiaAEliminar.programacion === "Manual" && copiaAEliminar.pendiente}
				<div>Esta copia aún no ha sido realizada</div>
			{/if}

			{#if copiaAEliminar.tipo === "Completa" && copiaAEliminar.programacion === "Automática" && backups.map(b => b.dependeDe).includes(copiaAEliminar.id)}
				<div>Esta copia completa tiene copias incrementales dependientes. Si la elimina, también eliminará todas las copias incrementales que dependen de ella.</div>
			{/if}

			{#if copiaAEliminar.tipo === "Incremental" && copiaAEliminar.programacion === "Automática"}
				<div>Esta copia es incremental. Si la elimina, también eliminará la copia completa y las incrementales vinculadas.</div>
			{/if}
		{/if}
	</div>
	
	
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => popupEliminarVisible = false}>Atrás</Button>
		<Button action={eliminarCopia} >Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={popupEliminarExitoVisible} title="Éxito" fitW fitH>
	<div>Copia eliminada exitosamente</div>
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {load(); popupEliminarExitoVisible = false;}}>Aceptar</Button>
	</div>
</Popup>



<PopupError bind:visible={errorPermiso} redir={previousPage}>
	No tiene permiso para realizar copias de seguridad.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
	{errorGenerico}
</PopupError>