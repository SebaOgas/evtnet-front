<script lang="ts">
    /*
        Built with assistance from Claude
    */
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import { token, permisos } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";
    import { page } from "$app/state"
	import type DTOCronogramasEspacio from "$lib/dtos/espacios/DTOCronogramasEspacio";
	import { CronogramaService } from "$lib/services/CronogramaService";
	import { HttpError } from "$lib/request/request";
	import { formatDate } from "$lib/components/DatePicker.svelte";

    $: errorPermiso = false;

    $: id = Number(page.params.id);
    $: idSubEspacio = Number(page.url.searchParams.get("idSubEspacio")) || 0;

    $: data = {
		nombre: "",
        cronogramas: []
    } as DTOCronogramasEspacio;

    $: errorGenerico = ""
    $: errorGenericoVisible = false

    onMount(async () => {     
        if (get(token) === "") {
            goto("/");
        }

        if(!get(permisos).includes("AdministracionEspaciosPrivados")) {
            errorPermiso = true;
            return;
        }

        try {
            data = await CronogramaService.obtenerCronogramasEspacio(idSubEspacio);            
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
        <h1 class="text-s text-center flex justify-center items-center gap-2">
            <span>Administrar cronogramas</span>
            <Button classes="text-xs info_cronograma min-w-[30px] font-bold">i</Button>
        </h1>
        <h2 class="text-m text-center">
            {data.nombre}
        </h2>
        
        <div class="flex flex-col gap-4 mt-4">
            {#each data.cronogramas as cronograma}
                <div class="bg-white rounded-lg p-4">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="text-s mb-2">
                                {formatDate(cronograma.fechaDesde)} - {formatDate(cronograma.fechaHasta)}
                            </div>
                            <div class="text-s">
                                Anticipación máxima de reserva: {cronograma.diasHaciaAdelante} días
                            </div>
                        </div>
                        <div class="ml-4 flex gap-2">
                            <Button icon="/icons/arrow-right.svg" action={() => {goto(`/Espacio/${id}/AdministrarCronograma/${cronograma.id}?idSubEspacio=${idSubEspacio}`)}}></Button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <div class="flex flex-row flex-wrap gap-2 h-fit p-2 justify-center items-center">
        <Button action={() => {goto(`/Espacio/${id}/Administrar`)}}>Atrás</Button>
        <Button action={() => {goto(`/Espacio/${id}/AdministrarCronograma/Nuevo?idSubEspacio=${idSubEspacio}`)}}>Nuevo</Button>
    </div>
</div>  

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para administrar cronogramas.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>