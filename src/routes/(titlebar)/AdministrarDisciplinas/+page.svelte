<script lang="ts">
	import PopupError from "$lib/components/PopupError.svelte";
	import { onMount } from "svelte";
    import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
    import { permisos, token } from "$lib/stores";
	import { get } from "svelte/store";
	import TextField from "$lib/components/TextField.svelte";
	import DatePicker, { formatDate } from "$lib/components/DatePicker.svelte";
	import Table from "$lib/components/Table.svelte";
	import PageControl from "$lib/components/PageControl.svelte";
	import type DTODisciplina from "$lib/dtos/disciplinas/DTODisciplina";
	import Popup from "$lib/components/Popup.svelte";
	import { DisciplinasService } from "$lib/services/DisciplinasService";
	import type DTOBusquedaDisciplina from "$lib/dtos/disciplinas/DTOBusquedaDisciplinas";
	import { HttpError } from "$lib/request/request";


    $: errorPermiso = false;
    $: errorGenerico = "";
    $: errorGenericoVisible = false;
    $: popupDetalle = false;

    let page = 0;
    let lastPage = 0;
    

    let listo = false;

    let filtros : DTOBusquedaDisciplina={texto:"", fechaDesde:null, fechaHasta:null};

    
    let minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 100);
    let maxDate = new Date();

    let fechaDesde: Date | null = filtros.fechaDesde;
    let fechaHasta: Date | null = filtros.fechaHasta;

    let resultados=[] as DTODisciplina[];

    let disciplinaDetalle: DTODisciplina | null = null;
    let disciplinaBaja: number | null = null;

    $: popupBaja = disciplinaBaja !== null;
    let exitoBaja = false;

    onMount(() => {
        if (get(token) === "") {
			goto("/");
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("AdministracionDisciplinas")) {
			errorPermiso = true;
			return;
		}

        buscar();
        listo = true;
    });

    async function buscar() {
        filtros.fechaDesde = fechaDesde;
        filtros.fechaHasta = fechaHasta;
        

        try {
			resultados = await DisciplinasService.buscarDisciplinas(filtros);
            
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
    }

    async function baja() {
        if (disciplinaBaja === null) {
            errorGenerico = "No se pudo identificar a la disciplina a dar de baja";
            errorGenericoVisible = true;
            return;
        }

        try {
			await DisciplinasService.bajaDisciplina(disciplinaBaja);
            buscar();
            disciplinaBaja = null;
            exitoBaja = true;
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}

    }

</script>

<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-m flex gap-2 justify-start items-center">
            <span>Disciplinas</span>
            <Button icon="/icons/plus.svg" action={() => goto("/AdministrarDisciplinas/Nuevo")}></Button>
        </h1>

        {#if listo}
            <div class="flex w-full gap-2 items-center">
                <TextField label={null} placeholder="Buscar..." classes="w-full" bind:value={filtros.texto} action={buscar}></TextField>
                <Button icon="/icons/search.svg" action={buscar} classes="h-fit"></Button>
            </div>

            <DatePicker range label="Fechas desde - hasta: " bind:startDate={fechaDesde} bind:endDate={fechaHasta} {minDate} {maxDate} classes="!md:w-[70%]"/>

            <Table cols={["Nombre", "Descripción", "Alta", "Baja", "Acciones"]}>
                {#each resultados as d}
                    <tr>
                        <td>{d.nombre}</td>
                        <td>{d.descripcion}</td>
                        <td>{formatDate(d.fechaAlta, true)}</td>
                        <td>{#if d.fechaBaja}{formatDate(d.fechaBaja, true)}{/if}</td>
                        <td>
                            <div class="flex gap-2 justify-center items-center">
                                <Button icon="/icons/view.svg" action={() => {disciplinaDetalle = d; popupDetalle = true}}></Button>
                                <Button icon="/icons/edit.svg" action={() => goto(`/AdministrarDisciplinas/${d.id}`)}></Button>
                                <Button icon="/icons/trash.svg" action={() => {disciplinaBaja = d.id; popupBaja = true}}></Button>
                            </div>
                        </td>
                    </tr>
                {/each}
            </Table>
        {/if}

	</div>
    <div class="flex gap-2 h-fit p-2 justify-end items-center">
        <PageControl bind:page={page} lastPage={lastPage}/>
    </div>
</div>



<Popup bind:visible={popupDetalle} fitH fitW title="Vista previa de disciplina seleccionada">
    {#if disciplinaDetalle !== null}
    <div>
        <div>Nombre: {disciplinaDetalle.nombre}</div>
        <div>Descripción: {disciplinaDetalle.descripcion}</div>
        <div>Fecha Alta: {formatDate(disciplinaDetalle.fechaAlta, true)}</div>
        <div>Fecha Baja: {disciplinaDetalle.fechaBaja ? formatDate(disciplinaDetalle.fechaBaja, true) : "-"}</div>
    </div>
    <div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupDetalle = false}}>Atrás</Button>
	</div>
    {/if}
</Popup>

<Popup bind:visible={popupBaja} fitH fitW>
	¿Está seguro de que desea dar de baja a esta disciplina?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupBaja = false}}>Cancelar</Button>
		<Button action={baja}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={exitoBaja} fitH fitW>
	Disciplina dada de baja exitosamente
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {exitoBaja = false}}>Aceptar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para administrar disciplinas.
</PopupError>
