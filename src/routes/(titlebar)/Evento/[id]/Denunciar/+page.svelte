<script lang="ts">
	import { afterNavigate, goto } from "$app/navigation";
	import { base } from "$app/paths";
	import { page } from "$app/state";
	import Button from "$lib/components/Button.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import type DTODatosParaDenunciarEvento from "$lib/dtos/eventos/DTODatosParaDenunciar";
	import type DTODenunciaEvento from "$lib/dtos/eventos/DTODenunciaEvento";
	import { HttpError } from "$lib/request/request";
	import { EventosService } from "$lib/services/EventosService";
	import { permisos, token } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

    let previousPage: string = base;

	afterNavigate(({from}) => {
		previousPage = from?.url.pathname || previousPage
	});

    $: id = Number(page.params.id);
    $: evento = null as null | DTODatosParaDenunciarEvento;
    $: data = {
        idEvento: id,
        titulo: "",
		descripcion: ""
    } as DTODenunciaEvento;
    
    onMount(async () => {     
        if (get(token) === "") {
            goto("/");
        }

        if(!get(permisos).includes("DenunciaEventos")) {
            goto("/MisSuperEventos")
        }

        try {
            evento = await EventosService.getDatosParaDenunciar(id);
            
            if (!evento.inscripto) {
                errorPermisos = "No puede denunciar el evento porque no está inscripto al mismo"
                errorPermisosVisible = true;
                return;
            }

            if (evento.fechaDesde > new Date()) {
                errorPermisos = "Debe esperar a que el evento comience para poder denunciarlo"
                errorPermisosVisible = true;
                return;
            }

            if (evento.hayDenunciaPrevia) {
                errorPermisos = "No puede denunciar el evento, puesto que ya se ha registrado una denuncia hecha por usted"
                errorPermisosVisible = true;
                return;
            }
        } catch (e) {
            if (e instanceof HttpError) {
                error = e.message
                errorVisible = true
            }   
        }
    });

    $: warningTituloVisible = false;
    $: warningDescripcionVisible = false;
    $: error = ""
    $: errorVisible = false
    $: errorPermisos = ""
    $: errorPermisosVisible = false

    $: popupExitoVisible = false

    async function denunciar() {

        warningTituloVisible = !validateTitulo(data.titulo).valid;
        warningDescripcionVisible = !validateDescripcion(data.descripcion).valid;
        if (warningTituloVisible || warningDescripcionVisible) return;

        try {
            await EventosService.denunciar(data);
            popupExitoVisible = true;
        } catch (e) {
            if (e instanceof HttpError) {
                error = e.message
                errorVisible = true
            }   
        }
    }


    function validateTitulo(val: string) {
        if (val.trim() === "") {
            return {
                valid: false,
                reason: "Debe ingresar el título"
            }
        }

        return {
            valid: true,
            reason: undefined
        }
    }

    function validateDescripcion(val: string) {
        if (val.trim() === "") {
            return {
                valid: false,
                reason: "Debe ingresar la descripción"
            }
        }

        return {
            valid: true,
            reason: undefined
        }
    }
</script>

<div id="content">
    <div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
        <h1 class="text-m text-center">
            Denunciar evento
        </h1>
        {#if evento !== null}
            <h1 class="text-m text-center">
                {evento.nombre}
            </h1>

            <TextField label="Título" bind:value={data.titulo} validate={validateTitulo} forceValidate={warningTituloVisible} min={1} max={50}/>

            <TextField label="Descripción" multiline bind:value={data.descripcion} validate={validateDescripcion} forceValidate={warningDescripcionVisible} rows={10} min={1} max={1000}/>
            
        {/if}
    </div>

    <div class="flex gap-2 h-fit p-2 justify-center items-center">
        <Button classes="text-m" action={() => {goto(previousPage)}}>Cancelar</Button>
        <Button classes="text-m" action={denunciar}>Aceptar</Button>
    </div>

</div>


<PopupError bind:visible={errorVisible}>
    {error}
</PopupError>

<PopupError bind:visible={errorPermisosVisible} redir={previousPage}>
    {errorPermisos}
</PopupError>

<Popup bind:visible={popupExitoVisible} fitH fitW>
    Denuncia realizada
    <div class="flex justify-center items-center w-full">
        <Button action={() => {goto(`/Evento/${id}`)}}>Aceptar</Button>
    </div>
</Popup>
