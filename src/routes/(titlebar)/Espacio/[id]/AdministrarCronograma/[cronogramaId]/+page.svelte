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
	import type DTODetalleCronograma from "$lib/dtos/espacios/DTODetalleCronograma";
	import { CronogramaService } from "$lib/services/CronogramaService";
	import { HttpError } from "$lib/request/request";
	import { formatDate } from "$lib/components/DatePicker.svelte";

    $: errorPermiso = false;

    $: espacioId = Number(page.params.id);
    $: cronogramaId = Number(page.params.cronogramaId);

    $: data = {
		nombreEspacio: "",
        fechaDesde: new Date(),
        fechaHasta: new Date(),
        horarios: []
    } as DTODetalleCronograma;

    $: errorGenerico = ""
    $: errorGenericoVisible = false
    $: popupEliminarVisible = false
    $: horarioAEliminar = null as number | null
    $: eliminandoHorario = false

    const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

    function formatTime(date: Date): string {
        date = new Date(date);
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }

    function formatPrice(precio: number): string {
        return `$${precio.toFixed(2).replace('.', ',')}`;
    }

    function eliminarHorario(idHorario: number) {
        horarioAEliminar = idHorario;
        popupEliminarVisible = true;
    }

    async function confirmarEliminacion() {
        if (horarioAEliminar === null) return;
        
        eliminandoHorario = true;
        
        try {
            await CronogramaService.eliminarHorario(horarioAEliminar);
            // Reload data after deletion
            data = await CronogramaService.obtenerDetalleCronograma(cronogramaId);
            popupEliminarVisible = false;
            horarioAEliminar = null;
        } catch (e) {
            if (e instanceof HttpError) {
                errorGenerico = e.message;
                errorGenericoVisible = true;
            }
        } finally {
            eliminandoHorario = false;
        }
    }

    function cancelarEliminacion() {
        popupEliminarVisible = false;
        horarioAEliminar = null;
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
            data = await CronogramaService.obtenerDetalleCronograma(cronogramaId);
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
        
        <div class="flex flex-col gap-4 mt-4">
            {#each data.horarios as horario}
                <div class="flex flex-col items-center justify-between w-full">
                    <div class="flex w-full justify-between items-center">
                        <div class="text-s mb-1">
                            {diasSemana[horario.diaSemana]}
                        </div>
                        <Button icon="/icons/cross.svg" action={() => eliminarHorario(horario.id)}></Button>
                    </div>
                    <div class="flex w-full justify-between items-start ps-4">
                        <div class="text-xs">
                            {formatTime(horario.horaDesde)} - {formatTime(horario.horaHasta)}
                        </div>
                        <div class="text-xs">
                            {formatPrice(horario.precioOrganizacion)}
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <div class="flex flex-row flex-wrap gap-2 h-fit p-2 justify-center items-center">
        <Button action={() => {goto(`/Espacio/${espacioId}/AdministrarCronograma`)}}>Atrás</Button>
        <Button action={() => {goto(`/Espacio/${espacioId}/AdministrarCronograma/${cronogramaId}/NuevoHorario`)}}>Nuevo horario</Button>
        <Button action={() => {goto(`/Espacio/${espacioId}/AdministrarCronograma/${cronogramaId}/Excepciones`)}}>Administrar Excepciones</Button>
    </div>
</div>  

<Popup title="Eliminar horario" bind:visible={popupEliminarVisible} fitH fitW>
    <p class="text-xs mb-4">¿Está seguro de que desea eliminar este horario? <br/> Se cancelarán los eventos programados en el mismo.</p>
    <div class="flex gap-2 justify-center">
        <Button action={cancelarEliminacion}>Cancelar</Button>
        <Button action={confirmarEliminacion} disabled={eliminandoHorario}>
            {eliminandoHorario ? "Eliminando..." : "Confirmar"}
        </Button>
    </div>
</Popup>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para administrar cronogramas.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>