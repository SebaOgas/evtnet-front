<script lang="ts">
	import { afterNavigate, goto } from "$app/navigation";
	import { base } from "$app/paths";
	import { page } from "$app/state";
	import Button from "$lib/components/Button.svelte";
	import ComboBox from "$lib/components/ComboBox.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import type DTOCambioEstadoDenuncia from "$lib/dtos/eventos/DTOCambioEstadoDenuncia";
	import type DTODatosParaCambioEstadoDenuncia from "$lib/dtos/eventos/DTODatosParaCambioEstadoDenuncia";
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
    $: denuncia = null as null | DTODatosParaCambioEstadoDenuncia;
    $: data = {
        idDenuncia: id,
		estado: 0,
		descripcion: ""
    } as DTOCambioEstadoDenuncia;

    let estados = new Map<number, string>();
    $: estado = undefined as undefined | number;
    
    onMount(async () => {     
        if (get(token) === "") {
            goto("/");
        }

        if(!get(permisos).includes("AdministracionDenunciasEventos")) {
            goto("/Eventos")
        }

        try {
            estados = new Map<number, string>();
            denuncia = await EventosService.obtenerDatosParaCambioEstadoDenuncia(id);
            denuncia.estados.forEach(e => {
                estados.set(e.id, e.nombre);
            });
        } catch (e) {
            if (e instanceof HttpError) {
                error = e.message
                errorVisible = true
            }   
        }
    });

    $: warningEstadoVisible = false;
    $: warningDescripcionVisible = false;
    $: error = ""
    $: errorVisible = false
    $: errorPermisos = ""
    $: errorPermisosVisible = false

    $: popupExitoVisible = false

    async function realizarCambioEstado() {
        warningEstadoVisible = estado === undefined;
        warningDescripcionVisible = !validateDescripcion(data.descripcion).valid;
        if (warningEstadoVisible || warningDescripcionVisible) return;
        
        if (estado === undefined) return;
        data.estado = estado;

        try {
            await EventosService.cambiarEstadoDenuncia(data);
            popupExitoVisible = true;
        } catch (e) {
            if (e instanceof HttpError) {
                error = e.message
                errorVisible = true
            }   
        }
    }


    function validateDescripcion(val: string) {
        if (val.trim() === "") {
            return {
                valid: false,
                reason: "Debe ingresar una descripción del cambio de estado"
            }
        }

        return {
            valid: true,
            reason: undefined
        }
    }
</script>

<div id="content">
    <div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow md:grow-0">
        <h1 class="text-m text-center md:text-start">
            Realizar cambio de estado a denuncia a evento
        </h1>
        {#if denuncia !== null}
            <div class="flex flex-col gap-2 overflow-y-auto grow w-full md:max-w-[800px]">
                <span>
                    Título: {denuncia.titulo}
                </span>

                <span class="flex flex-col md:flex-row gap-2 mt-2 mb-2">
                    <span>Estado:</span>
                    <ComboBox 
                        options={estados} 
                        bind:selected={estado}
                        placeholder="Seleccione el estado"
                        classes="self-start"
                    />
                    <Warning visible={warningEstadoVisible} text={"Debe seleccionar el estado"}/>
                </span>
                    
                <TextField label="Descripción" multiline bind:value={data.descripcion} validate={validateDescripcion} forceValidate={warningDescripcionVisible} rows={6} min={1} max={1000}/>
            </div>
        {/if}
    </div>

    <div class="flex gap-2 h-fit p-2 justify-center items-center md:justify-start">
        <Button classes="text-m" action={() => {goto(previousPage)}}>Cancelar</Button>
        <Button classes="text-m" action={realizarCambioEstado}>Aceptar</Button>
    </div>

</div>


<PopupError bind:visible={errorVisible}>
    {error}
</PopupError>

<PopupError bind:visible={errorPermisosVisible} redir={previousPage}>
    {errorPermisos}
</PopupError>

<Popup bind:visible={popupExitoVisible} fitH fitW>
    Cambio de estado realizado correctamente
    <div class="flex justify-center items-center w-full">
        <Button action={() => {goto(`/AdministrarDenunciasEventos`)}}>Aceptar</Button>
    </div>
</Popup>
