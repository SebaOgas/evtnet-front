<script lang="ts">
	import PopupError from "$lib/components/PopupError.svelte";
	import { onMount } from "svelte";
    import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
    import { permisos, token } from "$lib/stores";
	import { get } from "svelte/store";
	import Table from "$lib/components/Table.svelte";
	import PageControl from "$lib/components/PageControl.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import { HttpError } from "$lib/request/request";
	import type DTOTipoCalificacion from "$lib/dtos/tipoCalificacion/DTOTipoCalificacion.ts";
	import { CalificacionService } from "$lib/services/CalificacionService";
	import { formatDate } from "$lib/components/DatePicker.svelte";
	import CheckBox from "$lib/components/CheckBox.svelte";


    $: errorPermiso = false;
    $: errorGenerico = "";
    $: errorGenericoVisible = false;
    $: vigentes = true;
    $: dadasDeBaja = true;

    let page = 0;
    let lastPage = 0;
    $: page, vigentes, dadasDeBaja,  buscar();
    

    let listo = false;

    let resultados=[] as DTOTipoCalificacion[];

    let TipoCalificacionBaja: number | null = null;

    $: popupBaja = TipoCalificacionBaja !== null;
    let exitoBaja = false;

    let TipoCalificacionAlta: number | null = null;

    $: popupAlta = TipoCalificacionAlta !== null;
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
			let response = await CalificacionService.obtenerListaTiposCalificacion(page, vigentes, dadasDeBaja);
            resultados = response.content as DTOTipoCalificacion[];
            lastPage = response.totalPages -1;
            
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
    }

    async function baja() {
        if (TipoCalificacionBaja === null) {
            errorGenerico = "No se pudo identificar al medio de pago a dar de baja";
            errorGenericoVisible = true;
            return;
        }

        try {
			await CalificacionService.bajaTipoCalificacion(TipoCalificacionBaja);
            buscar();
            TipoCalificacionBaja = null;
            exitoBaja = true;
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}

    }

    async function alta() {
        if (TipoCalificacionAlta === null) {
            errorGenerico = "No se pudo identificar al tipo de calificación a dar de alta";
            errorGenericoVisible = true;
            return;
        }

        try {
			await CalificacionService.restaurarTipoCalificacion(TipoCalificacionAlta);
            buscar();
            TipoCalificacionAlta = null;
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
            <span>Tipo de calificación</span>
            <Button icon="/icons/plus.svg" action={() => goto("/AdministrarTipoCalificacion/Nuevo")}></Button>
            <Button classes="text-xs info_tipoCalificacion min-w-[30px] font-bold">i</Button> 
        </h1>

        {#if listo}
            <div class="flex flex-row gap-2 items-center">
                <CheckBox bind:checked={vigentes}>Vigentes</CheckBox>
                <CheckBox bind:checked={dadasDeBaja}>Dados de baja</CheckBox>
            </div>
            <Table cols={["Nombre", "Imagen", "Alta", "Baja", "Acciones"]}>
                {#each resultados as d}
                    <tr class="{d.fechaBaja ? 'text-gray-400' : ''}">
                        <td>{d.nombre}</td>
                        <td>
                            <div class="flex justify-center">
                                <img src="{d.url}" alt="Ícono" class="w-12 h-12" />
                            </div>
                        </td>  
                        <td>{d.fechaAlta ? new Date(d.fechaAlta).toLocaleDateString() : ""}</td>
                        <td>{d.fechaBaja ? new Date(d.fechaBaja).toLocaleDateString() : ""}</td>
                        <td>
                            <div class="flex gap-2 justify-center items-center">
                                <Button icon="/icons/edit.svg" action={() => goto(`/AdministrarTipoCalificacion/${d.id}`)}></Button>
                                {#if !d.fechaBaja}<Button icon="/icons/trash.svg" action={() => {TipoCalificacionBaja = d.id; popupBaja = true}}></Button>{/if}
                                {#if d.fechaBaja}<Button icon="/icons/check.png" action={() => {TipoCalificacionAlta = d.id; popupAlta = true}}></Button>{/if}
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
	¿Está seguro de que desea dar de baja a este tipo de calificación?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupBaja = false}}>Cancelar</Button>
		<Button action={baja}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={exitoBaja} fitH fitW>
	Tipo de calificación dado de baja exitosamente
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {exitoBaja = false}}>Aceptar</Button>
	</div>
</Popup>

<Popup bind:visible={popupAlta} fitH fitW>
	¿Está seguro de que desea restaurar a este ícono?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupAlta = false}}>Cancelar</Button>
		<Button action={alta}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={exitoAlta} fitH fitW>
	Ícono restaurado exitosamente
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {exitoAlta = false}}>Aceptar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para administrar tipos de calificación.
</PopupError>
