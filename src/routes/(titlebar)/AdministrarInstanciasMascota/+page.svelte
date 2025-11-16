<script lang="ts">
	import PopupError from "$lib/components/PopupError.svelte";
	import { onMount } from "svelte";
    import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import TextField from "$lib/components/TextField.svelte";
    import { permisos, token } from "$lib/stores";
	import { get } from "svelte/store";
	import Table from "$lib/components/Table.svelte";
	import PageControl from "$lib/components/PageControl.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import { HttpError } from "$lib/request/request";
	import type DTOInstanciaMascota from "$lib/dtos/mascota/DTOInstanciaMascota";
	import { InstanciasMascotaService } from "$lib/services/InstanciasMascotaService";
	import { formatDate } from "$lib/components/DatePicker.svelte";

    $: errorPermiso = false;
    $: errorGenerico = "";
    $: errorGenericoVisible = false;

    let page = 0;
    let lastPage = 0;
    $: page, buscar();

    let listo = false;

    let resultados = [] as DTOInstanciaMascota[];

    let textoBuscado = "";

    let instanciaMascotaBaja: DTOInstanciaMascota | null = null;
    $: popupBaja = instanciaMascotaBaja !== null;
    let exitoBaja = false;

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
			let tmp = await InstanciasMascotaService.obtenerInstanciasMascota(page, textoBuscado);
            lastPage = tmp.totalPages - 1;
            resultados = tmp.content;
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
    }

    async function baja() {
        if (instanciaMascotaBaja === null) {
            errorGenerico = "No se pudo identificar la instancia a dar de baja";
            errorGenericoVisible = true;
            return;
        }

        try {
			await InstanciasMascotaService.bajaInstanciaMascota(instanciaMascotaBaja.id);
            buscar();
            instanciaMascotaBaja = null;
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
            <span>Instancias de Mascota</span>
            <Button icon="/icons/plus.svg" action={() => goto("/AdministrarInstanciasMascota/Nuevo")}></Button>
        </h1>

        <div class="flex w-full gap-2 items-center">
            <TextField label={null} placeholder="Buscar..." classes="w-full" bind:value={textoBuscado} action={buscar}></TextField>
            <Button icon="/icons/search.svg" action={buscar} classes="h-fit"></Button>
        </div>

        {#if listo}
            <Table cols={["Nombre", "Longitud", "Alta", "Baja", "Acciones"]}>
                {#each resultados as d}
                    <tr>
                        <td>{d.nombre}</td>
                        <td>{d.longitud}</td>
                        <td>{formatDate(d.fechaAlta, true)}</td>
                        <td>{#if d.fechaBaja}{formatDate(d.fechaBaja, true)}{/if}</td>
                        <td>
                            <div class="flex gap-2 justify-center items-center">
                                <Button icon="/icons/view.svg" action={() => {}}></Button>
                                <Button icon="/icons/edit.svg" action={() => goto(`/AdministrarInstanciasMascota/${d.id}`)}></Button>
                                {#if !d.fechaBaja}<Button icon="/icons/trash.svg" action={() => {instanciaMascotaBaja = d; popupBaja = true}}></Button>{/if}
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

<Popup bind:visible={popupBaja} fitH fitW title="Eliminar Instancia de Mascota">
	<p>¿Está seguro de que desea eliminar la siguiente instancia de mascota?</p>
    <p>Nombre: {instanciaMascotaBaja?.nombre}</p>
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupBaja = false}}>Cancelar</Button>
		<Button action={baja}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={exitoBaja} fitH fitW>
	Instancia dada de baja exitosamente
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {exitoBaja = false}}>Aceptar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para administrar instancias de mascota.
</PopupError>