<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import { token, permisos } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";
    import { page } from "$app/state"
	import { EspaciosService } from "$lib/services/EspaciosService";
	import { HttpError } from "$lib/request/request";
	import CheckBox from "$lib/components/CheckBox.svelte";
	import PopupSeleccion from "$lib/components/PopupSeleccion.svelte";
	import { DisciplinasService } from "$lib/services/DisciplinasService";
	import DatePicker, { formatDate } from "$lib/components/DatePicker.svelte";
	import TimeRangePicker, { parseTime } from "$lib/components/TimeRangePicker.svelte";
	import { ModosDeEventoService } from "$lib/services/ModosDeEventoService";
	import Warning from "$lib/components/Warning.svelte";
    import type DTOBusquedaEventosPorEspacio from "$lib/dtos/espacios/DTOBusquedaEventosPorEspacio";
	import type DTOResultadoBusquedaEventosPorEspacio from "$lib/dtos/espacios/DTOResultadoBusquedaEventosPorEspacio";
	import Popup from "$lib/components/Popup.svelte";

    $: errorPermiso = false;

	$: errorGenerico = "";
	$: errorGenericoVisible = false;

    $: id = Number(page.params.id);
    $: idEvento=0;
    $: nombreEspacio = "";

    $: filtros = {
        idEspacio: id,
		texto: "",
		fechaDesde: null,
		fechaHasta: null,
		horaDesde: null,
		horaHasta: null,
		disciplinas: [],
		modos: [],
		precioLimite: undefined
	} as DTOBusquedaEventosPorEspacio;

    $: resultados = [] as DTOResultadoBusquedaEventosPorEspacio[];

    async function buscar() {

        filtros.horaDesde = null
        if (horaDesde !== null && horaDesde !== undefined)
            filtros.horaDesde = parseTime(horaDesde).getTime()

        filtros.horaHasta = null
        if (horaHasta !== null && horaHasta !== undefined)
            filtros.horaHasta = parseTime(horaHasta).getTime()

        filtros.disciplinas = [];
        disciplinas.keys().forEach(d => {
            filtros.disciplinas.push(d);
        })

        filtros.modos = [];
        modos.keys().forEach(d => {
            filtros.modos.push(d);
        })

        if (usarPrecioLimite) {
            filtros.precioLimite = parseFloat(precioLimite.replace(',', '.'));
        }

        try {
			resultados = await EspaciosService.buscarEventosPorEspacio(filtros);          
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}            
		}
    }


    $: filtrosVisibles = false;
    $: popupDisciplinasVisible = false;
    $: popupConfirmCancelarVisible = false;
    $: popupConfirmAceptarVisible = false;
    $: popupExitoVisible = false;
    $: popupCancelacionVisible = false;

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
		buscar();
	});

    async function cancelarEvento() {
		try {
            const evento=resultados.find(e => e.id===idEvento);
            if(evento?.estado!=="En revisión")
                await EspaciosService.cancelarEvento(idEvento, id);
            else await EspaciosService.aprobarRechazarEvento(idEvento, "Rechazado");
            popupCancelacionVisible = true;
            //buscar();
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
		popupConfirmCancelarVisible = false;
	}

    async function aprobarEvento() {
        try {
            await EspaciosService.aprobarRechazarEvento(idEvento, "Aceptado");
            popupExitoVisible = true;
            //buscar();
        } catch (e) {
            if (e instanceof HttpError) {
                errorGenerico = e.message;
                errorGenericoVisible = true;
            }
        }
    }
    
</script>

<PopupSeleccion title="Disciplinas" multiple={true} bind:visible={popupDisciplinasVisible} searchFunction={buscarDisciplinas} bind:selected={disciplinas}/>
<PopupSeleccion title="Modos de evento" multiple={true} bind:visible={popupModosVisible} searchFunction={buscarModos} bind:selected={modos}/>


<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-m text-center">Eventos del espacio</h1>
        <h1 class="text-m text-center">{nombreEspacio}</h1>     
        <div class="flex w-full gap-2 items-center">
            <TextField label={null} placeholder="Buscar..." classes="w-full" bind:value={filtros.texto} action={buscar}></TextField>
            <Button icon="/icons/search.svg" action={buscar} classes="h-fit"></Button>
            <Button icon="/icons/filter.svg" classes="h-fit" toggable bind:active={filtrosVisibles}></Button>
        </div>

        {#if filtrosVisibles}

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

            <div>
                <div class="flex justify-start items-center gap-2">
                    <CheckBox bind:checked={usarPrecioLimite}><span class="whitespace-nowrap">Precio máximo $</span></CheckBox>
                    <TextField bind:value={precioLimite} label={null} disabled={!usarPrecioLimite} classes="w-full md:w-[500px]"/>
                </div>
                <Warning text="El monto superior (“Precio máximo”) debe ser un número no negativo" visible={warningPrecioLimiteVisible}/>
            </div>            

            <div class="flex justify-center items-center mb-4">
                <Button classes="text-xs" action={buscar}>Buscar</Button>
            </div>
        {/if}
        
        <div class="flex flex-col w-full gap-2 md:flex-row md:flex-wrap justify-between">
            {#each resultados as r}
                {#if r.estado==="En revisión" || r.estado==="Aceptado"}
                    <div class="flex flex-col gap-2 pb-4 w-full md:w-[30%]">
                    {#if  r.fechaHoraInicio !== undefined && r.precio !== undefined && r.disciplinas !== undefined}
                        <div class="flex justify-between items-center">
                            <span class="text-s">{r.nombre}</span>
                            <div class="flex gap-2 shrink-0">
                                <Button icon="/icons/cross.svg" action={() => {popupConfirmCancelarVisible = true; idEvento=r.id}} classes="shrink-0"></Button>
                                <Button icon="/icons/arrow-right.svg" action={() => {goto(`/Evento/${r.id}`)}} classes="shrink-0"></Button>
                                {#if r.estado === "En revisión" || r.requiereAprobacion}
                                    <Button icon="/icons/check.png" action={() => {popupConfirmAceptarVisible = true; idEvento=r.id}} classes="shrink-0"></Button>
                                {/if}
                            </div>
                        </div>
                        <div class="flex justify-between items-center ml-4">
                            <span class="text-s">{formatDate(new Date(r.fechaHoraInicio), true)}</span>
                            <span class="text-s">${("" + r.precio.toFixed(2)).replace(".", ",")}</span>
                        </div>
                        <div class="commaList text-xs ml-4">
                            {#each r.disciplinas as d}
                                <span>{d}</span>
                            {/each}
                        </div>
                    {/if}

                </div>
                {/if}
            {/each}
        </div>
        

	</div>

</div>

<Popup bind:visible={popupExitoVisible} fitH fitW>
	Evento aprobado exitosamente
	<div class="flex justify-center items-center w-full">
		<Button action={() => {buscar; popupExitoVisible = false}}>Aceptar</Button>
	</div>
</Popup>

<Popup bind:visible={popupCancelacionVisible} fitH fitW>
	Evento cancelado exitosamente
	<div class="flex justify-center items-center w-full">
		<Button action={() => {buscar; popupCancelacionVisible = false}}>Aceptar</Button>
	</div>
</Popup>

<Popup bind:visible={popupConfirmCancelarVisible} fitH fitW>
	¿Está seguro que desea eliminar/rechazar el evento?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupConfirmCancelarVisible = false}}>Cancelar</Button>
		<Button action={cancelarEvento}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={popupConfirmAceptarVisible} fitH fitW>
	¿Está seguro que desea aceptar el evento?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupConfirmAceptarVisible = false}}>Cancelar</Button>
		<Button action={aprobarEvento}>Confirmar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorPermiso}>
	No tiene permiso para ver eventos del espacio.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
	{errorGenerico}
</PopupError>