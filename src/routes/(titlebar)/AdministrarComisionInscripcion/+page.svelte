<script lang="ts">
	import PopupError from "$lib/components/PopupError.svelte";
	import { onMount } from "svelte";
    import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
    import { permisos, token } from "$lib/stores";
	import { get } from "svelte/store";
	import { formatDate } from "$lib/components/DatePicker.svelte";
	import Table from "$lib/components/Table.svelte";
	import PageControl from "$lib/components/PageControl.svelte";
	import type DTOComisionInscripcion from "$lib/dtos/comision/DTOComision";
	import Popup from "$lib/components/Popup.svelte";
	import { ComisionService } from "$lib/services/ComisionService";
	import { HttpError } from "$lib/request/request";
	import CheckBox from "$lib/components/CheckBox.svelte";


    $: errorPermiso = false;
    $: errorGenerico = "";
    $: errorGenericoVisible = false;
    let page = 0;
    let lastPage = 0;
    $: page, activas, noActivas, buscar();

    let listo = false;

    let resultados=[] as DTOComisionInscripcion[];

    let comisionInscripcionDetalle: DTOComisionInscripcion | null = null;
    let comisionInscripcionBaja: number | null = null;
    let activas: boolean = true;
    let noActivas: boolean = true;

    $: popupBaja = comisionInscripcionBaja !== null;
    let exitoBaja = false;
    let comisionInscripcionAlta: number | null = null;
    $: popupAlta = comisionInscripcionAlta !== null;
    let exitoAlta = false;

    onMount(() => {
        if (get(token) === "") {
			goto("/");
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("AdministracionParametros")) {
			errorPermiso = true;
			return;
		}

        buscar();
        listo = true;
    });

    async function buscar() {
        try {
			let response = await ComisionService.obtenerListaComisionesInscripcion(page, activas, noActivas);
            resultados = response.content as DTOComisionInscripcion[];
            lastPage = response.totalPages -1;
            
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
    }

    async function baja() {
        if (comisionInscripcionBaja === null) {
            errorGenerico = "No se pudo identificar a la comisionInscripcion a dar de baja";
            errorGenericoVisible = true;
            return;
        }

        try {
			await ComisionService.bajaComisionInscripcion(comisionInscripcionBaja);
            buscar();
            comisionInscripcionBaja = null;
            exitoBaja = true;
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}

    }

    async function alta() {
        if (comisionInscripcionAlta === null) {
            errorGenerico = "No se pudo identificar a la comisión por inscripción a dar de alta";
            errorGenericoVisible = true;
            return;
        }

        try {
			await ComisionService.restaurarComisionInscripcion(comisionInscripcionAlta);
            buscar();
            comisionInscripcionAlta = null;
            exitoAlta = true;
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
            <span>Comisión por Inscripción</span>
            <Button icon="/icons/plus.svg" action={() => goto("/AdministrarComisionInscripcion/Nuevo")}></Button>
            <Button classes="text-xs info_comisionInscripcion min-w-[30px] font-bold">i</Button> 
        </h1>

        {#if listo}
            <div class="flex flex-row gap-2 items-center">
                <CheckBox bind:checked={activas}>Activas</CheckBox>
                <CheckBox bind:checked={noActivas}>No activas</CheckBox>
            </div>
            <Table cols={["Monto Límite", "Porcentaje", "Desde", "Hasta", "Acciones"]}>
                {#each resultados as d}
                    <tr class="{d.fechaHasta && d.fechaHasta! < new Date() ? 'text-gray-400' : ''}">
                        <td>{d.montoLimite}</td>
                        <td>{d.porcentaje}%</td>
                        <td>{formatDate(d.fechaDesde, true)}</td>
                        <td>{formatDate(d.fechaHasta, true)}</td>
                        <td>
                            <div class="flex gap-2 justify-center items-center">
                                <Button icon="/icons/edit.svg" action={() => goto(`/AdministrarComisionInscripcion/${d.id}`)}></Button>
                                {#if !d.fechaHasta}<Button icon="/icons/trash.svg" action={() => {comisionInscripcionBaja = d.id; popupBaja = true}}></Button>{/if}
                                {#if d.fechaHasta && d.fechaHasta! < new Date()}<Button icon="/icons/check.png" action={() => {comisionInscripcionAlta = d.id; popupAlta = true}}></Button>{/if}
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


<Popup bind:visible={popupBaja} fitH fitW>
	¿Está seguro de que desea dar de baja a esta comisión por inscripción?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupBaja = false}}>Cancelar</Button>
		<Button action={baja}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={exitoBaja} fitH fitW>
	Comisión por inscripción dada de baja exitosamente
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {exitoBaja = false}}>Aceptar</Button>
	</div>
</Popup>

<Popup bind:visible={popupAlta} fitH fitW>
	¿Está seguro de que desea restaurar a esta comisión por inscripción?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupAlta = false}}>Cancelar</Button>
		<Button action={alta}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={exitoAlta} fitH fitW>
	Comisión por inscripción restaurada exitosamente
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {exitoAlta = false}}>Aceptar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para administrar comisiones por inscripción.
</PopupError>
