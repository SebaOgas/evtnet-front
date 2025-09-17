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
	import type DTOIconoCaracteristica from "$lib/dtos/iconoscaracteristicas/DTOIconoCaracteristica";
	import { IconosCaracteristicasService } from "$lib/services/IconosCaracteristicasService";
	import { formatDate } from "$lib/components/DatePicker.svelte";


    $: errorPermiso = false;
    $: errorGenerico = "";
    $: errorGenericoVisible = false;

    let page = 0;
    let lastPage = 0;
    

    let listo = false;

    let resultados=[] as DTOIconoCaracteristica[];

    let iconoCaracteristicaBaja: number | null = null;

    $: popupBaja = iconoCaracteristicaBaja !== null;
    let exitoBaja = false;

    onMount(() => {
        if (get(token) === "") {
			goto("/");
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("AdministracionIconosCaracteristicas")) {
			errorPermiso = true;
			return;
		}

        buscar();
        listo = true;
    });

    async function buscar() {
        
        try {
			resultados = await IconosCaracteristicasService.obtenerIconosCaracteristicas();
            
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
    }

    async function baja() {
        if (iconoCaracteristicaBaja === null) {
            errorGenerico = "No se pudo identificar al icono a dar de baja";
            errorGenericoVisible = true;
            return;
        }

        try {
			await IconosCaracteristicasService.bajaIconoCaracteristica(iconoCaracteristicaBaja);
            buscar();
            iconoCaracteristicaBaja = null;
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
            <span>Ícono Característica</span>
            <Button icon="/icons/plus.svg" action={() => goto("/AdministrarIconoCaracteristica/Nuevo")}></Button>
        </h1>

        {#if listo}
            <Table cols={["Ícono", "Alta", "Baja", "Acciones"]}>
                {#each resultados as d}
                    <tr>
                        <td><img src="{d.url}" alt=""></td>
                        <td>{formatDate(d.fechaAlta, true)}</td>
                        <td>{#if d.fechaBaja}{formatDate(d.fechaBaja, true)}{/if}</td>
                        <td>
                            <div class="flex gap-2 justify-center items-center">
                                <Button icon="/icons/edit.svg" action={() => goto(`/AdministrarIconoCaracteristica/${d.id}`)}></Button>
                                <Button icon="/icons/trash.svg" action={() => {iconoCaracteristicaBaja = d.id; popupBaja = true}}></Button>
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
	¿Está seguro de que desea dar de baja a este ícono?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupBaja = false}}>Cancelar</Button>
		<Button action={baja}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={exitoBaja} fitH fitW>
	Ícono dado de baja exitosamente
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {exitoBaja = false}}>Aceptar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para administrar íconos.
</PopupError>
