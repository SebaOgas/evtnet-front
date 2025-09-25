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


    $: errorPermiso = false;
    $: errorGenerico = "";
    $: errorGenericoVisible = false;
    let page = 0;
    let lastPage = 0;
    

    let listo = false;

    let resultados=[] as DTOComisionInscripcion[];

    let comisionInscripcionDetalle: DTOComisionInscripcion | null = null;
    let comisionInscripcionBaja: number | null = null;

    $: popupBaja = comisionInscripcionBaja !== null;
    let exitoBaja = false;

    onMount(() => {
        if (get(token) === "") {
			goto("/");
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("AdministracionComisionInscripcion")) {
			errorPermiso = true;
			return;
		}

        buscar();
        listo = true;
    });

    async function buscar() {
        try {
			resultados = await ComisionService.obtenerListaComisionesInscripcion();
            
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

</script>

<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-m flex gap-2 justify-start items-center">
            <span>Comisión por Inscripción</span>
            <Button icon="/icons/plus.svg" action={() => goto("/AdministrarComisionInscripcion/Nuevo")}></Button>
        </h1>

        {#if listo}
            <Table cols={["Monto Límite", "Porcentaje", "Alta", "Baja", "Acciones"]}>
                {#each resultados as d}
                    <tr>
                        <td>{d.montoLimite}</td>
                        <td>{d.porcentaje}%</td>
                        <td>{formatDate(d.fechaDesde, true)}</td>
                        <td>{formatDate(d.fechaHasta, true)}</td>
                        <td>
                            <div class="flex gap-2 justify-center items-center">
                                <Button icon="/icons/edit.svg" action={() => goto(`/AdministrarComisionInscripcion/${d.id}`)}></Button>
                                <Button icon="/icons/trash.svg" action={() => {comisionInscripcionBaja = d.id; popupBaja = true}}></Button>
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

<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para administrar comisiones por inscripción.
</PopupError>
