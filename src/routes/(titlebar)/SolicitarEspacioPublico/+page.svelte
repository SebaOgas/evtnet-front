<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import MapDisplay from "$lib/components/MapDisplay.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import { HttpError } from "$lib/request/request";
	import { DisciplinasService } from "$lib/services/DisciplinasService";
	import { EspaciosService } from "$lib/services/EspaciosService";
	import { permisos, token } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";
	import { page } from "$app/state";
	import type DTOCrearSolicitudEspacio from "$lib/dtos/espacios/DTOCrearSolicitudEspacio";

    onMount(async () => {     
        if (get(token) === "") {
            goto("/");
        }

        if(!get(permisos).includes("CreacionEspaciosPublicos")) {
            goto("/Espacios")
        }
    });

    let searchParams = page.url.searchParams;

    let data : DTOCrearSolicitudEspacio = {
		nombre: searchParams.get("nombre") ?? "",
		descripcion: searchParams.get("descripcion") ?? "",
		direccion: searchParams.get("direccion") ?? "",
		latitud: Number(searchParams.get("latitud")) ?? undefined,
		longitud: Number(searchParams.get("direccion")) ?? undefined,
		justificacion: searchParams.get("justificacion") ?? "",
        publico: true,
        sepId: Number(searchParams.get("sep"))
	}

    let ubicacion : {x: number, y: number} | undefined = undefined

    $: popupCancelarVisible = false;

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

    function validateDireccion(val: string) {
        if (val.trim() === "") {
            return {
                valid: false,
                reason: "La dirección es obligatoria"
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
                reason: "Se recomienda ingresar una descripción"
            }
        }

        return {
            valid: true,
            reason: undefined
        }
    }

    function validateJustificacion(val: string) {
        if (val.trim() === "" || val.length < 50) {
            return {
                valid: false,
                reason: "La justificación debe tener al menos 50 caracteres"
            }
        }

        return {
            valid: true,
            reason: undefined
        }
    }

    $: warningNombreVisible = false;
    $: warningDireccionVisible = false;
    $: warningUbicacionVisible = false;
    $: warningJustificacionVisible = false;
    $: warningDescripcionVisible = false;

    $: error = ""
    $: errorVisible = false

    $: popupExitoVisible = false
    $: espacioId = -1;

    async function crearSolicitudEspacio() {
        if (data.nombre === "") {
            warningNombreVisible = true;
        } else {
            warningNombreVisible = false;
        }

        if (data.direccion === "") {
            warningDireccionVisible = true;
        } else {
            warningDireccionVisible = false;
        }

        if (ubicacion === undefined) {
            warningUbicacionVisible = true;
        } else {
            warningUbicacionVisible = false;
        }

        if (data.descripcion === "") {
            warningDescripcionVisible = true;
        } else {
            warningDescripcionVisible = false;
        }

        if (data.descripcion === "") {
            warningJustificacionVisible = true;
        } else {
            warningJustificacionVisible = false;
        }

        if (
            data.nombre === ""
            || data.direccion === ""
            || ubicacion === undefined
            || data.justificacion.trim() === "" || data.justificacion.length < 50
            || data.descripcion === ""
        ) {return}

        data.latitud = ubicacion.x;
        data.longitud = ubicacion.y;

        try {
            espacioId = await EspaciosService.crearSolicitudEspacio(data);
            popupExitoVisible = true;
        } catch (e) {
            if (e instanceof HttpError) {
                error = e.message
                errorVisible = true
            }   
        }
        
    }


</script>


<div id="content">
    <div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
        <h1 class="text-m text-center">
            Realiza solicitud de espacio público
        </h1>
        <h5 class="justify-center">
            Complete este formulario para solicitar que se genere en el sistema un espacio público. <br> El proceso puede durar varios días.
        </h5>

        <TextField label="Nombre del espacio" bind:value={data.nombre} validate={validateNombre} forceValidate={warningNombreVisible}/>

        <TextField label="Descripción del espacio" multiline bind:value={data.descripcion} rows={6} validate={validateDescripcion} forceValidate={warningDescripcionVisible}/>

        <TextField label="Dirección" bind:value={data.direccion} validate={validateDireccion} forceValidate={warningDireccionVisible}/>
        <div class="mb-2 mt-2">
            Ubicación
            <MapDisplay latitude={-32.89084} longitude={-68.82717} bind:marked={ubicacion} zoom={12}/>
            <Warning text="La ubicación es obligatoria" visible={warningUbicacionVisible}/>
        </div>

        <TextField label="Justificación" multiline bind:value={data.justificacion} rows={6} validate={validateJustificacion} forceValidate={warningJustificacionVisible}/>

    </div>

    <div class="flex gap-2 h-fit p-2 justify-center items-center">
        <Button classes="text-m" action={() => {popupCancelarVisible=true}}>Cancelar</Button>
        <Button classes="text-m" action={crearSolicitudEspacio}>Solicitar</Button>
    </div>

</div>

<Popup title="Confirmar" bind:visible={popupCancelarVisible} fitW fitH>
	<div class="grow overflow-y-auto">
		<p>¿Está seguro de desea cancelar la creación de la solicitud?</p>
	</div>
	<div class="flex gap-2 h-fit p-2 justify-center items-center">
		<Button action={() => {popupCancelarVisible = false}}>Cancelar</Button>
		<Button action={() => {goto(`/Eventos`)}}>Confirmar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorVisible}>
    {error}
</PopupError>

<Popup bind:visible={popupExitoVisible} fitH fitW>
    Solicitud de Espacio público registrada exitosamente
    <div class="flex justify-center items-center w-full">
        <Button action={() => {goto(`/Eventos`)}}>Aceptar</Button>
    </div>
</Popup>