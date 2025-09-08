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
	import PopupSeleccion from "$lib/components/PopupSeleccion.svelte";
	import { EspaciosService } from "$lib/services/EspaciosService";
	import { IconosCaracteristicasService } from "$lib/services/IconosCaracteristicasService";

    let previousPage: string = base;
    $: errorPermiso = false;

	$: errorGenerico = "";
	$: errorGenericoVisible = false;
    
    $: popupConfirmEliminarVisible = false;

    $: nombreEspacio = "";
    $: id = Number(page.params.id);
    $: idCaracteristica = 0;

    $: caracteristicaEspacio = {
        id: 0,
        idIconoCaracteristica: 0,
		idEspacio: id,
		nombre: ""
	} as DTOCaracteristica;

    $: resultados = [] as DTOCaracteristica[];

    $: popupIconosVisible = false;

    let iconos : {id:number, url:string}[] = [];

    async function buscarIconosCaracteristicas(val: string) {
        let response = await IconosCaracteristicasService.obtenerListaIconos();

        let ret : Map<number, string> = new Map();

        // response.forEach((val) => {
        //     ret.set(val.id, val.nombre);
        // });

        return ret;
    }

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
        resultados.push({
            id: 0,
            idIconoCaracteristica: 0,
            idEspacio: id,
            nombre: ""
        });
        resultados = [...resultados];
    }

    async function eliminarCaracteristica(){
        resultados.splice(idCaracteristica, 1);
        resultados = [...resultados];
    }

    async function guardar(){}
    
</script>

<!--<PopupSeleccion title="Seleccionar ícono de característica" multiple={true} bind:visible={popupIconosVisible} noSearch={true} bind:selected={iconos} searchFunction={async () => new Map()}/>
TODO hacer nuevo componente para mostrar los íconos de características--> 
<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-m text-center">Administrar características de espacio</h1>
		<h1 class="text-m text-center">Espacio {nombreEspacio}</h1>       
        <div class="flex flex-col w-full gap-2 md:flex-row md:flex-wrap justify-between">
            {#each resultados as r, idx}
                <div class="flex flex-row items-center gap-2 border rounded p-2 bg-white">
                    <img src="/icons/placeholder.png" alt="Ícono" class="w-8 h-8" />
                    <Button icon="/icons/edit.svg" action={() => {/* lógica para cambiar ícono */}} classes="ml-2" />
                    <input type="text" class="border rounded px-2 py-1 flex-1" bind:value={r.nombre} placeholder="Nombre de característica" />
                    <Button icon="/icons/cross.svg" action={() => {popupConfirmEliminarVisible = true; idCaracteristica=idx}} classes="shrink-0"></Button>
                </div>
            {/each}
        </div>
	</div>
    
    <div class="flex flex-row flex-wrap gap-2 h-fit p-2 justify-center items-center">
        <Button action={()=>{goto(previousPage)}}>Atrás</Button>
        <Button action={guardar} disabled={false}>Guardar</Button>
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