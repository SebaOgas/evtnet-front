<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import { token, permisos } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";
	import { EspaciosService } from "$lib/services/EspaciosService";
	import { HttpError } from "$lib/request/request";
	import CheckBox from "$lib/components/CheckBox.svelte";
	import type DTOBusquedaMisEspacios from "$lib/dtos/espacios/DTOBusquedaMisEspacios";
	import type DTOResultadoBusquedaMisEspacios from "$lib/dtos/espacios/DTOResultadoBusquedaMisEspacios";
	import Warning from "$lib/components/Warning.svelte";

    $: errorPermiso = false;

	$: errorGenerico = "";
	$: errorGenericoVisible = false;

    $: filtros = {
		texto: "",
		propietario: true,
        administrador: true
	} as DTOBusquedaMisEspacios;

    $: resultados = [] as DTOResultadoBusquedaMisEspacios[];

    $: tiposEspacio = [] as {id: number, nombre: string, checked: boolean | undefined}[];

    async function buscar() {
        if (!filtros.administrador && !filtros.propietario && !filtrosVisibles) {
            filtrosVisibles = true;
        }
        if (!filtros.administrador && !filtros.propietario) {
            return;
        }

        try {
			resultados = await EspaciosService.buscarMisEspacios(filtros);
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
		if (!userPermisos.includes("VisionEspacios")) {
			errorPermiso = true;
			return;
		}

		buscar();

        try {
			tiposEspacio = await EspaciosService.obtenerTiposEspacio();
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
		<h1 class="flex justify-center items-center gap-2">
            <span class="text-m">Mis Espacios</span>
            <Button icon="/icons/plus.svg" action={() => {goto("/CrearEspacio")}}/>
        </h1>

        <div class="flex w-full gap-2 items-center">
            <TextField label={null} placeholder="Buscar..." classes="w-full" bind:value={filtros.texto} action={buscar}></TextField>
            <Button icon="/icons/search.svg" action={buscar} classes="h-fit"></Button>
            <Button icon="/icons/filter.svg" classes="h-fit {!filtros.administrador && !filtros.propietario && !filtrosVisibles ? "bg-orange" : ""}" toggable bind:active={filtrosVisibles}></Button>
        </div>

        {#if filtrosVisibles}
            <div>
                <div class="flex flex-col justify-start items-start pl-2 gap-2">
                    <CheckBox bind:checked={filtros.propietario}>Soy Propietario</CheckBox>
                    <CheckBox bind:checked={filtros.administrador}>Soy Administrador</CheckBox>
                </div>
            </div>

            <Warning visible={!filtros.administrador && !filtros.propietario} text={"Debe seleccionar al menos una de las opciones anteriores"}/>

            <div class="flex justify-center items-center mb-4 mt-4">
                <Button classes="text-xs" action={buscar}>Buscar</Button>
            </div>
        {/if}
        
        <div class="flex flex-col w-full gap-2 md:flex-row md:flex-wrap justify-between">
            {#each resultados as r}
                <div class="flex flex-col gap-2 pb-4 w-full md:w-[30%]">
                    <div class="flex justify-between items-center">
                        <span class="text-s">{r.nombre}</span>
                        <Button icon="/icons/arrow-right.svg" action={() => {goto(`/Espacio/${r.id}`)}} classes="shrink-0"></Button>
                    </div>
                    <div class="flex justify-between items-center text-xs ml-4">
                        {r.rol}
                    </div>
                    <div class="commaList text-xs ml-4">
                        {#each r.disciplinas as d}
                            <span>{d}</span>
                        {/each}
                    </div>

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