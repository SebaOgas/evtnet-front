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
	import type DTOComision from "$lib/dtos/comision/DTOComision";
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

    let resultados=[] as DTOComision[];

    let comisionOrganizacionBaja: number | null = null;

    $: popupBaja = comisionOrganizacionBaja !== null;
    let exitoBaja = false;
    let activas: boolean = true;
    let noActivas: boolean = true;
    let comisionOrganizacionAlta: number | null = null;
    $: popupAlta = comisionOrganizacionAlta !== null;
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
			let response = await ComisionService.obtenerListaComisionesOrganizacion(page, activas, noActivas);
            resultados = response.content as DTOComision[];
            lastPage = response.totalPages -1;
            
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
    }

    async function baja() {
        if (comisionOrganizacionBaja === null) {
            errorGenerico = "No se pudo identificar a la comisionOrganizacion a dar de baja";
            errorGenericoVisible = true;
            return;
        }

        try {
			await ComisionService.bajaComisionOrganizacion(comisionOrganizacionBaja);
            buscar();
            comisionOrganizacionBaja = null;
            exitoBaja = true;
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}

    }

    async function alta() {
        if (comisionOrganizacionAlta === null) {
            errorGenerico = "No se pudo identificar a la comisión por organización a dar de alta";
            errorGenericoVisible = true;
            return;
        }

        try {
			await ComisionService.restaurarComisionOrganizacion(comisionOrganizacionAlta);
            buscar();
            comisionOrganizacionAlta = null;
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
            <span>Comisión por Organización</span>
            <Button icon="/icons/plus.svg" action={() => goto("/AdministrarComisionOrganizacion/Nuevo")}></Button>
            <Button classes="text-xs info_comisionOrganizacion min-w-[30px] font-bold">i</Button> 
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
                                <Button icon="/icons/edit.svg" action={() => goto(`/AdministrarComisionOrganizacion/${d.id}`)}></Button>
                                {#if !d.fechaHasta}<Button icon="/icons/trash.svg" action={() => {comisionOrganizacionBaja = d.id; popupBaja = true}}></Button>{/if}
                                {#if d.fechaHasta && d.fechaHasta! < new Date()}<Button icon="/icons/check.png" action={() => {comisionOrganizacionAlta = d.id; popupAlta = true}}></Button>{/if}
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
	¿Está seguro de que desea dar de baja a esta comisión por organización?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupBaja = false}}>Cancelar</Button>
		<Button action={baja}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={exitoBaja} fitH fitW>
	Comisión por organización dada de baja exitosamente
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {exitoBaja = false}}>Aceptar</Button>
	</div>
</Popup>

<Popup bind:visible={popupAlta} fitH fitW>
	¿Está seguro de que desea restaurar a esta comisión por organización?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupAlta = false}}>Cancelar</Button>
		<Button action={alta}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={exitoAlta} fitH fitW>
	Comisión por organización restaurada exitosamente
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {exitoAlta = false}}>Aceptar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para administrar comisiones por organización.
</PopupError>
