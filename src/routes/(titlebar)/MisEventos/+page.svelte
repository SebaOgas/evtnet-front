<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import { token, permisos } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";
	import { HttpError } from "$lib/request/request";
	import CheckBox from "$lib/components/CheckBox.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import type DTOBusquedaMisEventos from "$lib/dtos/eventos/DTOBusquedaMisEventos";
	import type DTOResultadoBusquedaMisEventos from "$lib/dtos/eventos/DTOResultadoBusquedaMisEventos";
	import { EventosService } from "$lib/services/EventosService";
	import DatePicker, { formatDate } from "$lib/components/DatePicker.svelte";

    $: errorPermiso = false;

	$: errorGenerico = "";
	$: errorGenericoVisible = false;

    $: filtros = {
		texto: "",
		fechaDesde: null,
		fechaHasta: null,
		organizador: true,
		administrador: true,
		participante: true
	} as DTOBusquedaMisEventos;

    $: resultados = [] as DTOResultadoBusquedaMisEventos[];

    async function buscar() {
        if (!filtros.organizador && !filtros.administrador && !filtros.participante && !filtrosVisibles) {
            filtrosVisibles = true;
        }
        if (!filtros.organizador && !filtros.administrador && !filtros.participante) {
            return;
        }

        try {
			resultados = await EventosService.buscarMisEventos(filtros);
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
    }


    $: filtrosVisibles = false;

	onMount(async () => {
		if (get(token) === "") {
			goto("/");
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("VisionEventos")) {
			errorPermiso = true;
			return;
		}

		buscar();
	});

    
</script>


<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="flex justify-center items-center gap-2">
            <span class="text-m">Mis Eventos</span>
            <Button icon="/icons/plus.svg" action={() => {goto("/CrearEvento")}}/>
        </h1>

        <div class="flex w-full gap-2 items-center">
            <TextField label={null} placeholder="Buscar..." classes="w-full" bind:value={filtros.texto} action={buscar}></TextField>
            <Button icon="/icons/search.svg" action={buscar} classes="h-fit"></Button>
            <Button icon="/icons/filter.svg" classes="h-fit {!filtros.organizador && !filtros.administrador && !filtros.participante && !filtrosVisibles ? "bg-orange" : ""}" toggable bind:active={filtrosVisibles}></Button>
        </div>

        {#if filtrosVisibles}
            <div class="flex justify-start items-center gap-2 w-full">
                <DatePicker 
                    range 
                    time
                    label="" 
                    bind:startDate={filtros.fechaDesde} 
                    bind:endDate={filtros.fechaHasta}
                    classes="w-full"
                />
            </div>
            <div>
                <div class="flex flex-col justify-start items-start pl-2 gap-2">
                    <CheckBox bind:checked={filtros.organizador}>Soy Organizador</CheckBox>
                    <CheckBox bind:checked={filtros.administrador}>Soy Administrador</CheckBox>
                    <CheckBox bind:checked={filtros.participante}>Soy Participante</CheckBox>
                </div>
            </div>

            <Warning visible={!filtros.organizador && !filtros.administrador && !filtros.participante} text={"Debe seleccionar al menos una de las opciones anteriores"}/>

            <div class="flex justify-center items-center mb-4 mt-4">
                <Button classes="text-xs" action={buscar}>Buscar</Button>
            </div>
        {/if}
        
        <div class="flex flex-col w-full gap-2 md:flex-row md:flex-wrap justify-between">
            {#each resultados as r}
                <div class="flex flex-col gap-2 pb-4 w-full md:w-[30%]">
                    <div class="flex justify-between items-center">
                        <span class="text-s">{r.nombre}</span>
                        <Button icon="/icons/arrow-right.svg" action={() => {goto(`/Evento/${r.id}`)}} classes="shrink-0"></Button>
                    </div>
                    <div class="flex justify-between items-center text-xs ml-4">
                        {formatDate(r.fechaDesde, true)} - {formatDate(r.fechaHasta, true)}
                    </div>
                    <div class="flex justify-between items-center text-xs ml-4">
                        {r.espacioNombre}
                    </div>
                    <div class="flex justify-between items-center text-xs ml-4">
                        {r.rol}
                    </div>
                    {#if r.participantes !== null}
                        <div class="flex justify-between items-center text-xs ml-4">
                            Participantes: {r.participantes}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
        

	</div>

</div>

<PopupError bind:visible={errorPermiso}>
	No tiene permiso para administrar cronogramas.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
	{errorGenerico}
</PopupError>