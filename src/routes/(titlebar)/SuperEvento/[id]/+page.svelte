<script lang="ts">
	import { afterNavigate, goto } from "$app/navigation";
	import { base } from "$app/paths";
	import { page } from "$app/state";
	import Button from "$lib/components/Button.svelte";
	import { formatDate } from "$lib/components/DatePicker.svelte";
	import MapDisplay from "$lib/components/MapDisplay.svelte";
	import PopupComparticion from "$lib/components/PopupComparticion.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import type DTOSuperEvento from "$lib/dtos/eventos/DTOSuperEvento";
	import { HttpError } from "$lib/request/request";
	import { SupereventosService } from "$lib/services/SupereventosService";
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

    $: id = Number(page.params.id);
    $: superevento = null as null | DTOSuperEvento;

    onMount(async () => {
        try {

            superevento = await SupereventosService.obtenerSuperEvento(id)

            if (get(token) === "") {
                goto("/");
            }

            if(!get(permisos).includes("VisionEventos")) {
                errorPermiso = true;
                return;
            }
        } catch (e) {
            

            if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			} 
        }
    })

    $: compartir = false;
</script>


<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-s text-center">
			Superevento
		</h1>
        {#if superevento !== null}
            <h1 class="text-m text-center">
                {superevento.nombre}
            </h1>
            
            <p class="text-xs mb-4">
                {superevento.descripcion}
            </p>

            <div class="flex flex-col gap-8 justify-start items-start w-full md:flex-row md:flex-wrap md:justify-around">
                {#each superevento.eventos as evento}
                    <div class="flex flex-col gap-2 w-full !md:grow md:w-fit">
                        <div class="flex justify-between items-center gap-2">
                            <span>{evento.nombre}</span>
                            <span>
                                {#if evento.esAdministrador || evento.fechaHasta > new Date()}
                                    <Button icon="/icons/arrow-right.svg" action={()=>goto(`/Evento/${evento.id}`)}></Button>
                                {/if}
                            </span>
                        </div>
                        <div class="ml-4">
                            {formatDate(evento.fechaDesde, true)} - {formatDate(evento.fechaHasta, true)}
                        </div>
                        <div class="ml-4">
                            {evento.nombreEspacio}
                        </div>
                        <div class="ml-4">
                            <Warning visible={evento.cancelado} text="Cancelado"/>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
	</div>

	<div class="flex flex-row flex-wrap gap-2 h-fit p-2 justify-center items-center">
		<Button action={() => {goto(previousPage)}}>Atrás</Button>

		{#if superevento !== null && superevento.esAdministrador}
			<Button action={() => {goto(`${page.url.pathname}/Administrar`)}}>Administrar</Button>
        {/if}

        <Button icon="/icons/share.svg" action={() => compartir = true}></Button>
        {#if superevento?.esAdministrador}
            <Button classes="aspect-square" icon="/icons/chat.svg" action={() => goto(`/Chat/${superevento?.chatId}`)}></Button>
        {/if}
    </div>
</div>


<PopupError bind:visible={errorPermiso}>
	No tiene permiso para acceder a este evento.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
	{errorGenerico}
</PopupError>

<PopupComparticion bind:visible={compartir} mensaje={`¡Mirá el superevento ${superevento?.nombre}!`} mensajeExito="Superevento compartido"/>