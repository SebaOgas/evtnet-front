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
	import type DTOEstadoSolicitud from "$lib/dtos/estadossolicitudEP/DTOEstadoSolicitud";
	import Popup from "$lib/components/Popup.svelte";
	import { EstadoSolicitudEspacioPublicoService } from "$lib/services/EstadoSolicitudEspacioPublicoService";
	import { HttpError } from "$lib/request/request";


    $: errorPermiso = false;
    $: errorGenerico = "";
    $: errorGenericoVisible = false;
    $: popupDetalle = false;

    let page = 0;
    let lastPage = 0;
    

    let listo = false;

    let resultados=[] as DTOEstadoSolicitud[];

    let estadoSolicitudDetalle: DTOEstadoSolicitud | null = null;
    let estadoSolicitudBaja: number | null = null;

    $: popupBaja = estadoSolicitudBaja !== null;
    let exitoBaja = false;

    onMount(() => {
        if (get(token) === "") {
			goto("/");
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("AdministracionEstadosSEP")) {
			errorPermiso = true;
			return;
		}

        buscar();
        listo = true;
    });

    async function buscar() {
        try {
			resultados = await EstadoSolicitudEspacioPublicoService.obtenerListaEstadosSolicitud();

		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
    }

    async function baja() {
        if (estadoSolicitudBaja === null) {
            errorGenerico = "No se pudo identificar a la estadoSolicitud a dar de baja";
            errorGenericoVisible = true;
            return;
        }

        try {
			await EstadoSolicitudEspacioPublicoService.bajaEstadoSolicitud(estadoSolicitudBaja);
            buscar();
            estadoSolicitudBaja = null;
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
            <span>Estado Solicitud</span>
            <Button icon="/icons/plus.svg" action={() => goto("/AdministrarEstadoSolicitudEspacioPublico/Nuevo")}></Button>
        </h1>

        {#if listo}
            <Table cols={["Nombre", "Descripción", "Acciones"]}>
                {#each resultados as d}
                    <tr>
                        <td>{d.nombre}</td>
                        <td>{d.descripcion}</td>
                        <td>
                            <div class="flex gap-2 justify-center items-center">
                                <Button icon="/icons/view.svg" action={() => {estadoSolicitudDetalle = d; popupDetalle = true}}></Button>
                                <Button icon="/icons/edit.svg" action={() => goto(`/AdministrarEstadoSolicitudEspacioPublico/${d.id}`)}></Button>
                                <Button icon="/icons/trash.svg" action={() => {estadoSolicitudBaja = d.id; popupBaja = true}}></Button>
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



<Popup bind:visible={popupDetalle} fitH fitW title="Vista previa de Estado Solicitud seleccionado">
    {#if estadoSolicitudDetalle !== null}
    <div>
        <div>Nombre: {estadoSolicitudDetalle.nombre}</div>
        <div>Descripción: {estadoSolicitudDetalle.descripcion}</div>
    </div>
    <div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupDetalle = false}}>Atrás</Button>
	</div>
    {/if}
</Popup>

<Popup bind:visible={popupBaja} fitH fitW>
	¿Está seguro de que desea dar de baja a este Estado Solicitud?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupBaja = false}}>Cancelar</Button>
		<Button action={baja}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={exitoBaja} fitH fitW>
	Estado Solicitud dado de baja exitosamente
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {exitoBaja = false}}>Aceptar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para administrar Estados Solicitud.
</PopupError>
