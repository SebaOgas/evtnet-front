<script lang="ts">
    /*
        Built with assistance from Claude
    */
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import { token, permisos } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";
    import { page } from "$app/state"
	import type DTOExcepcionesCronograma from "$lib/dtos/espacios/DTOExcepcionesCronograma";
	import { CronogramaService } from "$lib/services/CronogramaService";
	import { HttpError } from "$lib/request/request";
	import { formatDate } from "$lib/components/DatePicker.svelte";

    $: errorPermiso = false;

    $: espacioId = Number(page.params.id);
    $: cronogramaId = Number(page.params.cronogramaId);
    $: idSubEspacio = Number(page.url.searchParams.get("idSubEspacio")) || 0;

    $: data = {
		nombreEspacio: "",
        fechaDesde: new Date(),
        fechaHasta: new Date(),
        excepciones: []
    } as DTOExcepcionesCronograma;

    $: errorGenerico = ""
    $: errorGenericoVisible = false
    $: popupEliminarVisible = false
    $: excepcionAEliminar = null as number | null
    $: eliminandoExcepcion = false

    function formatDateTime(date: Date): string {
        date = new Date(date);
        const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        return `${dateStr} ${timeStr}`;
    }

    function eliminarExcepcion(idExcepcion: number) {
        excepcionAEliminar = idExcepcion;
        popupEliminarVisible = true;
    }

    async function confirmarEliminacion() {
        if (excepcionAEliminar === null) return;
        
        eliminandoExcepcion = true;
        
        try {
            await CronogramaService.eliminarExcepcion(excepcionAEliminar);
            // Reload data after deletion
            data = await CronogramaService.obtenerExcepcionesCronograma(cronogramaId);
            popupEliminarVisible = false;
            excepcionAEliminar = null;
        } catch (e) {
            if (e instanceof HttpError) {
                errorGenerico = e.message;
                errorGenericoVisible = true;
            }
        } finally {
            eliminandoExcepcion = false;
        }
    }

    function cancelarEliminacion() {
        popupEliminarVisible = false;
        excepcionAEliminar = null;
    }

    function esDeletable(excepcion: any): boolean {
        return excepcion.tipo === "Externa" && !excepcion.hayEventosProgramados || excepcion.tipo !== "Externa";
    }

    onMount(async () => {     
        if (get(token) === "") {
            goto("/");
        }

        if(!get(permisos).includes("AdministracionEspaciosPrivados")) {
            errorPermiso = true;
            return;
        }

        try {
            data = await CronogramaService.obtenerExcepcionesCronograma(cronogramaId);
        } catch (e) {
            if (e instanceof HttpError) {
                errorGenerico = e.message;
                errorGenericoVisible = true;
            }            
        }
    });
</script>

<div id="content">
    <div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
        <h1 class="text-s text-center">
            Administrar cronograma de espacio
        </h1>
        <h2 class="text-m text-center">
            {data.nombreEspacio}
        </h2>
        <h3 class="text-s text-center">
            Del {formatDate(data.fechaDesde)} al {formatDate(data.fechaHasta)}
        </h3>
        <h4 class="text-m text-center">
            Excepciones
        </h4>
        
        <div class="flex flex-col gap-4 mt-4">
            {#each data.excepciones as excepcion}
                <div class="flex flex-col items-center justify-between w-full">
                    <div class="flex w-full justify-between items-center">
                        <div class="text-s mb-1 flex-1">
                            {formatDateTime(excepcion.fechaHoraDesde)} - {formatDateTime(excepcion.fechaHoraHasta)}
                        </div>
                        {#if esDeletable(excepcion)}
                            <Button icon="/icons/cross.svg" action={() => eliminarExcepcion(excepcion.id)}></Button>
                        {/if}
                    </div>
                    <div class="flex w-full justify-start items-start ps-4">
                        <div class="text-s">
                            {excepcion.tipo}
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <div class="flex flex-row flex-wrap gap-2 h-fit p-2 justify-center items-center">
        <Button action={() => {goto(`/Espacio/${espacioId}/AdministrarCronograma/${cronogramaId}?idSubEspacio=${idSubEspacio}`)}}>Atrás</Button>
        <Button action={() => {goto(`/Espacio/${espacioId}/AdministrarCronograma/${cronogramaId}/Excepciones/Nueva?idSubEspacio=${idSubEspacio}`)}}>Nueva excepción</Button>
    </div>
</div>  

<Popup title="Eliminar excepción" bind:visible={popupEliminarVisible} fitH fitW>
    <p class="text-xs mb-4">¿Está seguro de que desea eliminar esta excepción?</p>
    <div class="flex gap-2 justify-center">
        <Button action={cancelarEliminacion}>Cancelar</Button>
        <Button action={confirmarEliminacion} disabled={eliminandoExcepcion}>
            {eliminandoExcepcion ? "Eliminando..." : "Confirmar"}
        </Button>
    </div>
</Popup>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para administrar cronogramas.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>