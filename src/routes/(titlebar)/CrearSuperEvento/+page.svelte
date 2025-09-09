<script lang="ts">
	import { afterNavigate, goto } from "$app/navigation";
	import { base } from "$app/paths";
	import Button from "$lib/components/Button.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import type DTOCrearSuperEvento from "$lib/dtos/eventos/DTOCrearSuperEvento";
	import { HttpError } from "$lib/request/request";
	import { SupereventosService } from "$lib/services/SupereventosService";
	import { permisos, token } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

    let previousPage: string = base;

	afterNavigate(({from}) => {
		previousPage = from?.url.pathname || previousPage
	});
    
    onMount(async () => {     
        if (get(token) === "") {
            goto("/");
        }

        if(!get(permisos).includes("OrganizacionEventos")) {
            goto("/MisSuperEventos")
        }
    });

    let data : DTOCrearSuperEvento = {
		nombre: "",
		descripcion: ""
	}

    let id : null | number = null;

    $: warningNombreVisible = false;
    $: error = ""
    $: errorVisible = false

    $: popupExitoVisible = false

    async function crearSuperEvento() {

        warningNombreVisible = !validateNombre(data.nombre).valid;
        if (warningNombreVisible) return;

        try {
            id = await SupereventosService.crearSuperEvento(data);
            popupExitoVisible = true;
        } catch (e) {
            if (e instanceof HttpError) {
                error = e.message
                errorVisible = true
            }   
        }
    }


    function validateNombre(val: string) {
        if (val.trim() === "") {
            return {
                valid: false,
                reason: "El nombre es obligatorio"
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
            Crear superevento
        </h1>

        <TextField label="Nombre del superevento" bind:value={data.nombre} validate={validateNombre} forceValidate={warningNombreVisible} min={1} max={50}/>

        <TextField label="Descripción del superevento" multiline bind:value={data.descripcion} rows={6} min={0} max={500}/>
    </div>

    <div class="flex gap-2 h-fit p-2 justify-center items-center">
        <Button classes="text-m" action={() => {goto(previousPage)}}>Cancelar</Button>
        <Button classes="text-m" action={crearSuperEvento}>Aceptar</Button>
    </div>

</div>


<PopupError bind:visible={errorVisible}>
    {error}
</PopupError>

<Popup bind:visible={popupExitoVisible} fitH fitW>
    Superevento registrado exitosamente
    <div class="flex justify-center items-center w-full">
        <Button action={() => {goto(`/SuperEvento/${id}`)}}>Aceptar</Button>
    </div>
</Popup>
