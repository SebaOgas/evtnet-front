<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import { token, permisos } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";
    import { page } from "$app/state"
    import { base } from "$app/paths";
    import type DTOCaracteristica from "$lib/dtos/espacios/DTOCaracteristica";
	import Popup from "$lib/components/Popup.svelte";
	import { EspaciosService } from "$lib/services/EspaciosService";
	import { IconosCaracteristicasService } from "$lib/services/IconosCaracteristicasService";
	import PopupCaracteristicas from "$lib/components/PopupCaracteristicas.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import Warning from "$lib/components/Warning.svelte";

    let previousPage: string = base;
    $: errorPermiso = false;

	$: errorGenerico = "";
	$: errorGenericoVisible = false;
    
    $: popupConfirmEliminarVisible = false;
    $: popupExitoVisible = false;
    $: cambiosPendientes = false;

    $: warningNombreVisible = false;
    $: warningIconoNombreVisible = false;

    $: nombreEspacio = "";
    $: id = Number(page.params.id);
    $: idCaracteristica = 0;
    $: idIconoSeleccionado = 0;

    $: caracteristicaEspacio = {
        id: 0,
        idIconoCaracteristica: 0,
		idEspacio: id,
		nombre: "",
        urlIcono: ""
	} as DTOCaracteristica;

    $: resultados = [] as DTOCaracteristica[];

    $: popupIconosVisible = false;

    // Actualiza el ícono de la característica seleccionada al cerrar el popup
    $: if (!popupIconosVisible && idIconoSeleccionado) {
        if (idIconoSeleccionado) {
            resultados[resultados.length - 1].idIconoCaracteristica = idIconoSeleccionado;
            const icono = iconos.find(i => i.id === idIconoSeleccionado);
            if (icono) resultados[resultados.length - 1].urlIcono = icono.url;
            resultados = [...resultados];
        }
    }

    let iconos : {id:number, url:string}[] = [];

    onMount(async () => {
		if (get(token) === "") {
			goto("/");
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("AdministracionEspaciosPrivados")) {
			errorPermiso = true;
			return;
		}
        nombreEspacio = await EspaciosService.obtenerNombreEspacio(id);
        resultados = await IconosCaracteristicasService.obtenerCaracteristicasEspacio(id);
        iconos = await IconosCaracteristicasService.obtenerListaIconos();

	});

    function agregarNuevaCaracteristica() {
        resultados.push(caracteristicaEspacio);
        resultados = [...resultados];
        idIconoSeleccionado = 0;
        cambiosPendientes = true;
    }

    async function eliminarCaracteristica(){
        resultados.splice(idCaracteristica, 1);
        resultados = [...resultados];
        popupConfirmEliminarVisible=false;
        cambiosPendientes = true;
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

    async function guardar(){
        for (const r of resultados) {
            if (r.nombre.trim() === "" || r.idIconoCaracteristica === 0) {
                warningIconoNombreVisible = true;
                return;
            }
        }        
        try {
            warningIconoNombreVisible = false;
            await EspaciosService.actualizarCaracteristicasEspacio(id, resultados);
            popupExitoVisible = true;
        } catch (e) {
            if (e instanceof Error) {
                errorGenerico = e.message;
                errorGenericoVisible = true;
            }            
        }
    }
    
</script>

<PopupCaracteristicas bind:visible={popupIconosVisible} iconos={iconos} bind:selectedId={idIconoSeleccionado} title="Seleccionar ícono de característica"/>

<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-m text-center">Administrar características de espacio</h1>
		<h1 class="text-m text-center">{nombreEspacio}</h1>       
        <div class="flex flex-col w-full gap-2 md:flex-row md:flex-wrap justify-between">
            {#each resultados as r, idx}
                <div class="flex flex-col p-4 bg-white gap-2">
                    <div class="flex flex-row gap-2">
                        <span class="min-w-[60px] text-right">Ícono:</span>
                        {#if r.urlIcono}
                        <img src={r.urlIcono} alt="Ícono" class="w-8 h-8" />
                        {/if}
                        <Button action={() => {popupIconosVisible = true; idCaracteristica = r.id}} classes="ml-2">Cambiar</Button>
                    </div>
                    <div class="flex justify-between items-center gap-2">
                        <TextField label="Nombre:" max={20} bind:value={r.nombre} validate={validateNombre} forceValidate={warningNombreVisible}/>
                        <Button icon="/icons/cross.svg" action={() => {popupConfirmEliminarVisible = true; idCaracteristica=idx}} classes="shrink-0"></Button>
                    </div>                    
                </div>
            {/each}
            <Warning text="Es obligatorio seleccionar un ícono e ingresar un nombre" visible={warningIconoNombreVisible}/>
        </div>
	</div>
    
    <div class="flex flex-row flex-wrap gap-2 h-fit p-2 justify-center items-center">
        <Button action={()=>{goto(previousPage)}}>Atrás</Button>
        <Button action={guardar} disabled={!cambiosPendientes}>Guardar</Button>
        <Button action={agregarNuevaCaracteristica}>Nueva</Button>
    </div>
</div>

<Popup bind:visible={popupConfirmEliminarVisible} fitH fitW>
	¿Está seguro que desea eliminar la característica?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupConfirmEliminarVisible = false}}>Cancelar</Button>
		<Button action={eliminarCaracteristica}>Confirmar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorPermiso}>
	No tiene permiso para ver eventos del espacio.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
	{errorGenerico}
</PopupError>

<Popup bind:visible={popupExitoVisible} fitH fitW>
    Características guardadas exitosamente
    <div class="flex justify-center items-center w-full">
        <Button action={() => {goto(`/Espacio/${id}`)}}>Aceptar</Button>
    </div>
</Popup>