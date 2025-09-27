<script lang="ts">
	import { afterNavigate, goto } from "$app/navigation";
	import { base } from "$app/paths";
	import Button from "$lib/components/Button.svelte";
	import DatePicker, { formatDate } from "$lib/components/DatePicker.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import Table from "$lib/components/Table.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import type DTOBackup from "$lib/dtos/backups/DTOBackup";
	import type DTOProgramacionBackupsAutomaticos from "$lib/dtos/backups/DTOProgramacionBackupsAutomaticos";
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
			programacion = await BackupsService.obtenerProgramacion();
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


	// Programar copias automáticas
	$: popupAutomaticaVisible = false;
	$: programacion = null as null | DTOProgramacionBackupsAutomaticos;
	$: popupAutomaticaExitoVisible = false;

	async function programarCopiaAutomatica() {
		if (programacion === null) return;
		try {
            await BackupsService.programarCopiasAutomaticas(programacion);
			popupAutomaticaVisible = false;
			popupAutomaticaExitoVisible = true;
        } catch (e) {
            if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			} 
        }
	}

	$: (() => {
		if (programacion === null) return;

		if (programacion.frecuencia.meses < 0) programacion.frecuencia.meses = 0;

		if (programacion.frecuencia.dias < 0) programacion.frecuencia.dias = 0;

		if (programacion.frecuencia.horas < 0) programacion.frecuencia.horas = 0;

		if (programacion.copiasIncrementalesPorCompleta < 0) programacion.copiasIncrementalesPorCompleta = 0;

		if (programacion.copiasAnterioresAConservar < 0) programacion.copiasAnterioresAConservar = 0;
	})()

	$: warningFrecuencia = (() => {
		if (programacion === null) return "";
		
		if (programacion.frecuencia.dias > 30) return "No puede indicar más de 30 días ni más de 23 horas";
		
		if (programacion.frecuencia.horas > 23) return "No puede indicar más de 30 días ni más de 23 horas";

		if (
			programacion.frecuencia.meses === 0
			&& programacion.frecuencia.dias === 0
			&& programacion.frecuencia.horas === 0
		) {
			return "Es obligatorio establecer al menos uno de los campos anteriores: meses, días u horas";
		}

		return "";
	})()

	function validateFechaHoraInicio(fecha: Date | null) {
        if (fecha === null) {
            return {
                valid: false,
                reason: "Es obligatorio ingresar la fecha de inicio"
            };
        }

		return {
			valid: true,
			reason: undefined
		}
	}
</script>


<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="flex flex-row flex-wrap gap-2">
            <span class="text-m">Copias de seguridad</span>
            <Button action={() => popupManualVisible = true}>Nueva Copia Manual</Button>
            <Button action={() => popupAutomaticaVisible = true}>Programar Copia Automática</Button>
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



<Popup bind:visible={popupAutomaticaVisible} title="Realizar Copia de Seguridad Manual" fitW fitH>
	<div class="flex flex-col gap-2 md:max-w-[600px] mb-4">
		{#if programacion !== null}
		<div class="flex flex-wrap gap-2 justify-start items-center w-full">
			<span>Realizar cada:</span>
			<span class="flex flex-1 justify-start items-center gap-2">
				<TextField 
					label={null} 
					bind:value={programacion.frecuencia.meses} 
					classes="flex-1 min-w-16 [&>input]:w-full"
					integer
				/>
				<span>meses</span>
			</span>
			
			<span class="flex flex-1 justify-start items-center gap-2">
				<TextField 
					label={null} 
					bind:value={programacion.frecuencia.dias} 
					classes="flex-1 min-w-16 [&>input]:w-full"
					integer
				/>
				<span>días</span>
			</span>
			
			<span class="flex flex-1 justify-start items-center gap-2">
				<TextField 
					label={null} 
					bind:value={programacion.frecuencia.horas} 
					classes="flex-1 min-w-16 [&>input]:w-full"
					integer
				/>
				<span>horas</span>
			</span>
		</div>
		<Warning text={warningFrecuencia} visible={warningFrecuencia !== ""}/>

		<DatePicker time label="Empezando en:" bind:value={programacion.fechaHoraInicio} classes="[&_.calendars-container]:!static" validate={validateFechaHoraInicio}/>

		<div class="flex flex-wrap gap-2 justify-start items-center w-full">
			<span>Realizar por cada copia completa</span>
			<span class="flex flex-1 justify-start items-center gap-2">
				<TextField 
					label={null} 
					bind:value={programacion.copiasIncrementalesPorCompleta} 
					classes="flex-1 min-w-16 [&>input]:w-full"
					integer
				/>
				<span>incrementales</span>
			</span>
		</div>

		<div class="">
			<span>Conservar</span>
			<TextField 
				label={null} 
				bind:value={programacion.copiasAnterioresAConservar} 
				classes="flex-1 min-w-16 inline-block"
					integer
			/>
			<span>copias completas (e incrementales dependientes) anteriores</span>
		</div>
		{/if}
	</div>
	
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => popupAutomaticaVisible = false}>Atrás</Button>
		<Button action={programarCopiaAutomatica}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={popupAutomaticaExitoVisible} title="Éxito" fitW fitH>
	<div>Copias programadas exitosamente</div>
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupAutomaticaExitoVisible = false;}}>Aceptar</Button>
	</div>
</Popup>


<PopupError bind:visible={errorPermiso} redir={previousPage}>
	No tiene permiso para realizar copias de seguridad.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
	{errorGenerico}
</PopupError>