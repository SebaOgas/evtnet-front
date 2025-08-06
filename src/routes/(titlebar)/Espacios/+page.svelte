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
	import type DTOBusquedaEspacios from "$lib/dtos/espacios/DTOBusquedaEspacios";
	import type DTOResultadoBusquedaEspacios from "$lib/dtos/espacios/DTOResultadoBusquedaEspacios";
	import CheckBox from "$lib/components/CheckBox.svelte";
	import PopupSeleccion from "$lib/components/PopupSeleccion.svelte";
	import { DisciplinasService } from "$lib/services/DisciplinasService";
	import PopupUbicacion from "$lib/components/PopupUbicacion.svelte";

    $: errorPermiso = false;

	$: errorGenerico = "";
	$: errorGenericoVisible = false;

    $: filtros = {
		texto: "",
		ubicacion: undefined,
		tipos: [],
		disciplinas: []
	} as DTOBusquedaEspacios;

    $: resultados = [] as DTOResultadoBusquedaEspacios[];

    $: tiposEspacio = [] as {id: number, nombre: string, checked: boolean | undefined}[];

    async function buscar() {
        filtros.tipos = [];
        tiposEspacio.forEach(tipo => {
            if (tipo.checked) {
                filtros.tipos.push(tipo.id);
            }
        })

        filtros.disciplinas = [];
        disciplinas.keys().forEach(d => {
            filtros.disciplinas.push(d);
        })

        if (ubicacion !== undefined && buscarPorUbicacion) {
            filtros.ubicacion = {
                latitud: ubicacion.x,
                longitud: ubicacion.y,
                rango: rango
            };
        } else {
            filtros.ubicacion = undefined;
        }

        try {
			resultados = await EspaciosService.buscar(filtros);
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
    }


    $: filtrosVisibles = false;
    $: buscarPorUbicacion = false;
    $: popupUbicacionVisible = false;
    let ubicacion : {x: number, y: number} | undefined;
    let rango : number;

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

<PopupSeleccion title="Disciplinas" multiple={true} bind:visible={popupDisciplinasVisible} searchFunction={buscarDisciplinas} bind:selected={disciplinas}/>

<PopupUbicacion bind:visible={popupUbicacionVisible} max={100000} bind:ubicacion={ubicacion} bind:radius={rango}/>

<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-m text-center">Espacios</h1>

        <div class="flex w-full gap-2 items-center">
            <TextField label={null} placeholder="Buscar..." classes="w-full" bind:value={filtros.texto} action={buscar}></TextField>
            <Button icon="/icons/search.svg" action={buscar} classes="h-fit"></Button>
            <Button icon="/icons/filter.svg" classes="h-fit" toggable bind:active={filtrosVisibles}></Button>
        </div>

        {#if filtrosVisibles}
            <div class="flex justify-start items-center gap-2">
                <CheckBox bind:checked={buscarPorUbicacion}>Buscar por ubicación</CheckBox>
                <Button disabled={!buscarPorUbicacion} action={() => {popupUbicacionVisible = true;}}>{#if ubicacion === undefined}Seleccionar{:else}Cambiar{/if}</Button>
            </div>

            <div>
                <span>Tipos:</span>
                <div class="flex flex-col justify-start items-start pl-2 gap-2">
                    {#each tiposEspacio as tipo}
                        <CheckBox bind:checked={tipo.checked}>{tipo.nombre}</CheckBox>
                    {/each}
                </div>
            </div>

            <div class="mb-2 mt-2">
                <div class="flex justify-start gap-2 items-center">
                    <span>Disciplinas</span>
                    <Button action={() => {popupDisciplinasVisible = !popupDisciplinasVisible}}>Seleccionar</Button>
                </div>
                {#if disciplinas.size > 0}
                <div class="commaList">
                    {#each disciplinas as d}
                        <span>{d[1]}</span>
                    {/each}
                </div>
                {:else}
                Cualquiera
                {/if}
            </div>

            <div class="flex justify-center items-center mb-4">
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
                        {r.tipo}
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