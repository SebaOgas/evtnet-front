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
	import PopupSeleccion from "$lib/components/PopupSeleccion.svelte";
	import { DisciplinasService } from "$lib/services/DisciplinasService";
	import PopupUbicacion from "$lib/components/PopupUbicacion.svelte";
	import type DTOBusquedaEventos from "$lib/dtos/eventos/DTOBusquedaEventos";
	import type DTOResultadoBusquedaEventos from "$lib/dtos/eventos/DTOResultadoBusquedaEventos";
	import { EventosService } from "$lib/services/EventosService";
	import DatePicker, { formatDate } from "$lib/components/DatePicker.svelte";
	import TimeRangePicker, { parseTime } from "$lib/components/TimeRangePicker.svelte";
	import ComboBox from "$lib/components/ComboBox.svelte";
	import { ModosDeEventoService } from "$lib/services/ModosDeEventoService";
	import Warning from "$lib/components/Warning.svelte";

    $: errorPermiso = false;

	$: errorGenerico = "";
	$: errorGenericoVisible = false;

    $: filtros = {
		texto: "",
		ubicacion: undefined,
		fechaDesde: null,
		fechaHasta: null,
		horaDesde: null,
		horaHasta: null,
		tiposEspacio: [],
		espaciosNoRegistrados: false,
		disciplinas: [],
		modos: [],
		precioLimite: undefined,
		buscarEventos: true,
		buscarSuperventos: true
	} as DTOBusquedaEventos;

    $: resultados = [] as DTOResultadoBusquedaEventos[];

    $: tiposEspacio = new Map<number, string>();
    let idToCombination = new Map<number, number[]>();
    let tipoEspacioSeleccionado : number | undefined = undefined;

    async function buscar() {

        filtros.horaDesde = null
        if (horaDesde !== null && horaDesde !== undefined)
            filtros.horaDesde = parseTime(horaDesde)

        filtros.horaHasta = null
        if (horaHasta !== null && horaHasta !== undefined)
            filtros.horaHasta = parseTime(horaHasta)

        filtros.tiposEspacio = []
        filtros.espaciosNoRegistrados = false;
        if (tipoEspacioSeleccionado !== undefined) {
            let aux = idToCombination.get(tipoEspacioSeleccionado);
            if (aux !== undefined)
                filtros.tiposEspacio = aux;

            let nr = filtros.tiposEspacio.indexOf(-1);

            if (nr !== -1) {
                filtros.tiposEspacio.splice(nr, 1)
                filtros.espaciosNoRegistrados = true;
            }

        }

        filtros.disciplinas = [];
        disciplinas.keys().forEach(d => {
            filtros.disciplinas.push(d);
        })

        filtros.modos = [];
        modos.keys().forEach(d => {
            filtros.modos.push(d);
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

        if (usarPrecioLimite) {
            filtros.precioLimite = parseFloat(precioLimite.replace(',', '.'));
        }

        if (buscarSoloSupereventos) {
            filtros.buscarEventos = false;
        } else {
            filtros.buscarEventos = true;
        }

        try {
			resultados = await EventosService.buscar(filtros);          
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

    $: popupModosVisible = false;

    let modos : Map<number, string> = new Map<number, string>();

    async function buscarModos(val: string) {
        let response = await ModosDeEventoService.buscar(val);

        let ret : Map<number, string> = new Map();

        response.forEach((val) => {
            ret.set(val.id, val.nombre);
        });

        return ret;
    }

    let horaDesde : string | null;
    let horaHasta : string | null;

    $: usarPrecioLimite = false;
    $: precioLimite = "";
    $: warningPrecioLimiteVisible = false;

    $: (() => {
        const numero = parseFloat(precioLimite.replace(',', '.'));
        if (usarPrecioLimite && (isNaN(numero) || numero < 0)) {
            warningPrecioLimiteVisible = true;
            return;
        }
        warningPrecioLimiteVisible = false;
    })()

    $: buscarSoloSupereventos = false;

    $: (() => {
        if (!filtros.buscarSuperventos) {
            buscarSoloSupereventos = false;
        }
    })()


	onMount(async () => {
		if (get(token) === "") {
			goto("/");
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("VisionEventos")) {
			errorPermiso = true;
			return;
		}

		buscar();

        try {
			let tiposEspacioRaw : {id: number, nombre: string, checked: boolean | undefined}[] = await EspaciosService.obtenerTiposEspacio();
            tiposEspacioRaw.push({
                id: -1,
                nombre: "No Registrado",
                checked: undefined
            })

            let aux = generateCombinations(
                tiposEspacioRaw.map(item => ({id: item.id, nombre: item.nombre}))
            );

            tiposEspacio = aux.tiposEspacio;
            idToCombination = aux.idToCombination;
            

            idToCombination.forEach((v, k) => {                
                if (v.length === tiposEspacioRaw.length)
                    tipoEspacioSeleccionado = k;
            })

		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
	});


function generateCombinations(items: {id: number, nombre: string}[]): {
  tiposEspacio: Map<number, string>,
  idToCombination: Map<number, number[]>
} {
  const tiposEspacio = new Map<number, string>();
  const idToCombination = new Map<number, number[]>();
  const n = items.length;
  let combinationId = 1;
  
  // Generate all combinations except empty (start from 1, not 0)
  for (let i = 1; i < (1 << n); i++) {
    const combination: {id: number, nombre: string}[] = [];
    
    for (let j = 0; j < n; j++) {
      if (i & (1 << j)) {
        combination.push(items[j]);
      }
    }
    
    const ids = combination.map(item => item.id);
    let name: string;
    
    // Check if this is the complete set (all items)
    if (combination.length === n) {
      name = "Todos";
    } else {
      // Format names with commas and "y" for the last one
      const nombres = combination.map(item => item.nombre);
      if (nombres.length === 1) {
        name = nombres[0];
      } else {
        const allButLast = nombres.slice(0, -1);
        const last = nombres[nombres.length - 1];
        name = allButLast.join(", ") + " y " + last;
      }
    }
    
    tiposEspacio.set(combinationId, name);
    idToCombination.set(combinationId, ids);
    combinationId++;
  }
  
  return { tiposEspacio, idToCombination };
}

    
</script>

<PopupSeleccion title="Disciplinas" multiple={true} bind:visible={popupDisciplinasVisible} searchFunction={buscarDisciplinas} bind:selected={disciplinas}/>
<PopupSeleccion title="Modos de evento" multiple={true} bind:visible={popupModosVisible} searchFunction={buscarModos} bind:selected={modos}/>

<PopupUbicacion bind:visible={popupUbicacionVisible} max={100000} bind:ubicacion={ubicacion} bind:radius={rango}/>

<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-m text-center">Eventos</h1>

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

            <div class="flex flex-col gap-2 md:flex-row items-start justify-start">
                <div class="flex justify-start items-center gap-2 w-full md:w-fit">
                    <span>Fechas:</span>
                    <DatePicker 
                        range 
                        label="" 
                        bind:startDate={filtros.fechaDesde} 
                        bind:endDate={filtros.fechaHasta}
                        minDate={new Date()}
                        classes="w-full"
                    />
                </div>

                <div class="flex justify-start items-center gap-2 w-full md:w-fit">
                    <span>Horario:</span>
                    <TimeRangePicker 
                        bind:startTime={horaDesde} 
                        bind:endTime={horaHasta} 
                        label={null}
                        classes="w-full"
                    />
                </div>
            </div>

            

            {#if tipoEspacioSeleccionado !== undefined}
                <div class="flex justify-start items-center gap-2">
                    <span>Espacios:</span>
                    <ComboBox options={tiposEspacio} bind:selected={tipoEspacioSeleccionado} placeholder="Tipos de espacio" maxHeight={7} classes="md:w-[500px]"/>
                </div>
            {/if}

            <div class="md:flex flex-row justify-start items-center gap-4">
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

            <div class="md:flex flex-row justify-start items-center gap-4">
                <div class="flex justify-start gap-2 items-center">
                    <span>Modos de evento</span>
                    <Button action={() => {popupModosVisible = !popupModosVisible}}>Seleccionar</Button>
                </div>
                {#if modos.size > 0}
                <div class="commaList">
                    {#each modos as m}
                        <span>{m[1]}</span>
                    {/each}
                </div>
                {:else}
                Cualquiera
                {/if}
            </div>

            <div>
                <div class="flex justify-start items-center gap-2">
                    <CheckBox bind:checked={usarPrecioLimite}><span class="whitespace-nowrap">Hasta $</span></CheckBox>
                    <TextField bind:value={precioLimite} label={null} disabled={!usarPrecioLimite} classes="w-full md:w-[500px]"/>
                </div>
                <Warning text="El monto superior (“Hasta”) debe ser un número no negativo" visible={warningPrecioLimiteVisible}/>
            </div>

            <div class="md:flex flex-row justify-start items-center">
                <div class="mb-2 md:mb-0">
                    <CheckBox bind:checked={filtros.buscarSuperventos}>Incluir supereventos</CheckBox>
                </div>
                <div class="ml-8">
                    <CheckBox bind:checked={buscarSoloSupereventos} disabled={!filtros.buscarSuperventos}>Solo supereventos</CheckBox>
                </div>
            </div>
            

            <div class="flex justify-center items-center mb-4">
                <Button classes="text-xs" action={buscar}>Buscar</Button>
            </div>
        {/if}
        
        <div class="flex flex-col w-full gap-2 md:flex-row md:flex-wrap justify-between">
            {#each resultados as r}
                <div class="flex flex-col gap-2 pb-4 w-full md:w-[30%]">
                    {#if !r.esSuperevento && r.fechaHoraInicio !== undefined && r.precio !== undefined && r.disciplinas !== undefined}
                        <div class="flex justify-between items-center">
                            <span class="text-s">{r.nombre}</span>
                            <Button icon="/icons/arrow-right.svg" action={() => {goto(`/Evento/${r.id}`)}} classes="shrink-0"></Button>
                        </div>
                        <div class="flex justify-between items-center ml-4">
                            <span class="text-s">{formatDate(new Date(r.fechaHoraInicio), true)}</span>
                            <span class="text-s">${("" + r.precio.toFixed(2)).replace(".", ",")}</span>
                        </div>
                        <div class="flex justify-between items-center text-xs ml-4">
                            {r.nombreEspacio}
                        </div>
                        <div class="commaList text-xs ml-4">
                            {#each r.disciplinas as d}
                                <span>{d}</span>
                            {/each}
                        </div>
                    {:else if r.fechaHoraProximoEvento !== undefined}
                        <div class="flex justify-between items-center">
                            <span class="text-s">{r.nombre}</span>
                            <Button icon="/icons/arrow-right.svg" action={() => {goto(`/Superevento/${r.id}`)}} classes="shrink-0"></Button>
                        </div>
                        <div class="flex justify-start items-center text-xs ml-4">
                            <img src={"/icons/superevento.svg"} alt="S" class="object-contain">
                            <span>Superevento</span>
                        </div>
                        <div class="flex justify-between items-center text-xs ml-4">
                            <span class="text-s">Próximo evento: {formatDate(new Date(r.fechaHoraProximoEvento), true)}</span>
                        </div>
                    {/if}

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