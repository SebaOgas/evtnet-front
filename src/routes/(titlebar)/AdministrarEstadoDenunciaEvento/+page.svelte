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
	import type DTOEstadoDenuncia from "$lib/dtos/estadosdenuncia/DTOEstadoDenuncia";
	import Popup from "$lib/components/Popup.svelte";
	import { EstadoDenunciaEventoService } from "$lib/services/EstadoDenunciaEventoService";
	import { HttpError } from "$lib/request/request";


    $: errorPermiso = false;
    $: errorGenerico = "";
    $: errorGenericoVisible = false;
    $: popupDetalle = false;

    let page = 0;
    let lastPage = 0;
    

    let listo = false;

    let resultados=[] as DTOEstadoDenuncia[];

    let estadoDenunciaDetalle: DTOEstadoDenuncia | null = null;
    let estadoDenunciaBaja: number | null = null;

    $: popupBaja = estadoDenunciaBaja !== null;
    let exitoBaja = false;

    onMount(() => {
        if (get(token) === "") {
			goto("/");
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("AdministracionEstadosDenuncia")) {
			errorPermiso = true;
			return;
		}

        buscar();
        listo = true;
    });

    async function buscar() {
        try {
			resultados = await EstadoDenunciaEventoService.obtenerListaEstadosDenuncia();
            
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
    }

    async function baja() {
        if (estadoDenunciaBaja === null) {
            errorGenerico = "No se pudo identificar a la estadoDenuncia a dar de baja";
            errorGenericoVisible = true;
            return;
        }

        try {
			await EstadoDenunciaEventoService.bajaEstadoDenuncia(estadoDenunciaBaja);
            buscar();
            estadoDenunciaBaja = null;
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
            <span>Estados de Denuncia</span>
            <Button icon="/icons/plus.svg" action={() => goto("/AdministrarEstadoDenunciaEvento/Nuevo")}></Button>
        </h1>

        {#if listo}
            <Table cols={["Nombre", "Descripción", "Alta", "Baja", "Acciones"]}>
                {#each resultados as d}
                    <tr>
                        <td>{d.nombre}</td>
                        <td>{d.descripcion}</td>
                        <td>{formatDate(d.fechaAlta, true)}</td>
                        <td>{#if d.fechaBaja}{formatDate(d.fechaBaja, true)}{/if}</td>
                        <td>
                            <div class="flex gap-2 justify-center items-center">
                                <Button icon="/icons/view.svg" action={() => {estadoDenunciaDetalle = d; popupDetalle = true}}></Button>
                                <Button icon="/icons/edit.svg" action={() => goto(`/AdministrarEstadoDenunciaEvento/${d.id}`)}></Button>
                                {#if !d.fechaBaja}
                                    <Button icon="/icons/trash.svg" action={() => {estadoDenunciaBaja = d.id; popupBaja = true}}></Button>
                                {/if}
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



<Popup bind:visible={popupDetalle} fitH fitW title="Vista previa de estadoDenuncia seleccionada">
    {#if estadoDenunciaDetalle !== null}
    <div>
        <div>Nombre: {estadoDenunciaDetalle.nombre}</div>
        <div>Descripción: {estadoDenunciaDetalle.descripcion}</div>
        <div>Fecha Alta: {formatDate(estadoDenunciaDetalle.fechaAlta, true)}</div>
        <div>Fecha Baja: {estadoDenunciaDetalle.fechaBaja ? formatDate(estadoDenunciaDetalle.fechaBaja, true) : "-"}</div>
    </div>
    <div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupDetalle = false}}>Atrás</Button>
	</div>
    {/if}
</Popup>

<Popup bind:visible={popupBaja} fitH fitW>
	¿Está seguro de que desea dar de baja a este estado de denuncia?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupBaja = false}}>Cancelar</Button>
		<Button action={baja}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={exitoBaja} fitH fitW>
	Estado Denuncia dada de baja exitosamente
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {exitoBaja = false}}>Aceptar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para administrar estados de denuncia.
</PopupError>
