<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import MapDisplay from "$lib/components/MapDisplay.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import PopupSeleccion from "$lib/components/PopupSeleccion.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import type DTOCrearEspacio from "$lib/dtos/espacios/DTOCrearEspacio";
	import { HttpError } from "$lib/request/request";
	import { DisciplinasService } from "$lib/services/DisciplinasService";
	import { EspaciosService } from "$lib/services/EspaciosService";
	import { permisos, token } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";
	import { page } from "$app/state";

    onMount(async () => {     
        if (get(token) === "") {
            goto("/");
        }

        if(!get(permisos).includes("CreacionEspaciosPublicos")) {
            goto("/Espacios")
        }
    });

    let searchParams = page.url.searchParams;

    let data : DTOCrearEspacio = {
		nombre: searchParams.get("nombre") ?? "",
		descripcion: searchParams.get("descripcion") ?? "",
		direccion: searchParams.get("direccion") ?? "",
		latitud: Number(searchParams.get("latitud")) ?? undefined,
		longitud: Number(searchParams.get("direccion")) ?? undefined,
		disciplinas: [],
        publico: true,
        sepId: Number(searchParams.get("sep"))
	}

    let ubicacion : {x: number, y: number} | undefined = undefined

    $: popupDisciplinasVisible = false;

    let disciplinas : Map<number, string> = new Map<number, string>();

    async function buscarDisciplinas(val: string) {
        let response = await DisciplinasService.buscar(val);

        let ret : Map<number, string> = new Map();

        response.forEach((val) => {
            ret.set(val.id, val.nombre);
        });

        return ret;
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

    $: warningNombreVisible = false;
    $: warningDireccionVisible = false;
    $: warningUbicacionVisible = false;

    $: error = ""
    $: errorVisible = false

    $: popupExitoVisible = false
    $: espacioId = -1;

    async function crearEspacio() {
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

        if (
            data.nombre === ""
            || data.direccion === ""
            || ubicacion === undefined
        ) {return}

        data.latitud = ubicacion.x;
        data.longitud = ubicacion.y;

        disciplinas.forEach((value, key) => {
            data.disciplinas.push(key);
        })

        try {
            espacioId = await EspaciosService.crearEspacio(data);
            popupExitoVisible = true;
        } catch (e) {
            if (e instanceof HttpError) {
                error = e.message
                errorVisible = true
            }   
        }
        
    }


</script>


<PopupSeleccion title="Selección múltiple" multiple={true} bind:visible={popupDisciplinasVisible} searchFunction={buscarDisciplinas} bind:selected={disciplinas}/>
            

<div id="content">
    <div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
        <h1 class="text-m text-center">
            Crear espacio público
        </h1>

        <TextField label="Nombre del espacio" bind:value={data.nombre} validate={validateNombre} forceValidate={warningNombreVisible}/>

        <TextField label="Descripción del espacio" multiline bind:value={data.descripcion} rows={6}/>

        <TextField label="Dirección" bind:value={data.direccion} validate={validateDireccion} forceValidate={warningDireccionVisible}/>
        <div class="mb-2 mt-2">
            Ubicación
            <MapDisplay latitude={-32.89084} longitude={-68.82717} bind:marked={ubicacion} zoom={12}/>
            <Warning text="La ubicación es obligatoria" visible={warningUbicacionVisible}/>
        </div>

        <div class="mb-2 mt-2">
            <div class="flex justify-start gap-2">
                <span>Disciplinas</span>
                <Button action={() => {popupDisciplinasVisible = !popupDisciplinasVisible}}>Seleccionar</Button>
            </div>
            <div class="commaList">
                {#each disciplinas as d}
                    <span>{d[1]}</span>
                {/each}
            </div>
        </div>
        

    </div>

    <div class="flex gap-2 h-fit p-2 justify-center items-center">
        <Button classes="text-m">Cancelar</Button>
        <Button classes="text-m" action={crearEspacio}>Aceptar</Button>
    </div>

</div>

<PopupError bind:visible={errorVisible}>
    {error}
</PopupError>

<Popup bind:visible={popupExitoVisible} fitH fitW>
    Espacio registrado exitosamente
    <div class="flex justify-center items-center w-full">
        <Button action={() => {goto(`/Espacio/${espacioId}`)}}>Aceptar</Button>
    </div>
</Popup>



<style>
    .commaList>*:not(:last-child)::after {
        content: ", ";
    }
</style>