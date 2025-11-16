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
	import type DTOImagenMascota from "$lib/dtos/mascota/DTOImagenMascota";
	import { ImagenesMascotaService } from "$lib/services/ImagenesMascotaService";
	import { formatDate } from "$lib/components/DatePicker.svelte";


    $: errorPermiso = false;
    $: errorGenerico = "";
    $: errorGenericoVisible = false;

    let page = 0;
    let lastPage = 0;
    $: page, buscar();

    let listo = false;

    let resultados=[] as DTOImagenMascota[];

    let imagenMascotaDetalle: DTOImagenMascota | null = null;

    $: popupDetalle = imagenMascotaDetalle !== null;

    let imagenMascotaBaja: DTOImagenMascota | null = null;

    $: popupBaja = imagenMascotaBaja !== null;
    let exitoBaja = false;

    onMount(() => {
        if (get(token) === "") {
			goto("/");
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("AdministracionMascota")) {
			errorPermiso = true;
			return;
		}

        buscar();
        listo = true;
    });

    async function buscar() {
        
        try {
			let tmp = await ImagenesMascotaService.obtenerImagenesMascota(page);
            lastPage = tmp.totalPages - 1;
            resultados = tmp.content;
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
    }

    $: popupErrorInstancia = [] as {nombre: string, id: number}[];
    $: popupErrorInstanciaVisible = false;

    async function baja() {
        if (imagenMascotaBaja === null) {
            errorGenerico = "No se pudo identificar la imagen a dar de baja";
            errorGenericoVisible = true;
            return;
        }

        try {
			await ImagenesMascotaService.bajaImagenMascota(imagenMascotaBaja.id);
            buscar();
            imagenMascotaBaja = null;
            exitoBaja = true;
		} catch (e) {
			if (e instanceof HttpError) {
                if (e.code === 806) {
                    popupErrorInstancia = JSON.parse(e.message);
                    popupErrorInstanciaVisible = true;
                } else {
                    errorGenerico = e.message;
				    errorGenericoVisible = true;
                }
			}
		}

    }

</script>

<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-m flex gap-2 justify-start items-center">
            <span>Imágenes de Mascota</span>
            <Button icon="/icons/plus.svg" action={() => goto("/AdministrarImagenesMascota/Nuevo")}></Button>
        </h1>

        {#if listo}
            <Table cols={["Nombre", "Imagen", "Alta", "Baja", "Acciones"]}>
                {#each resultados as d}
                    <tr>
                        <td>{d.nombre}</td>
                        <td>
                            <div class="flex justify-center">
                                <img src="{d.url}" alt="Mascota" class="h-18" />
                            </div>
                        </td>
                        <td>{formatDate(d.fechaAlta, true)}</td>
                        <td>{#if d.fechaBaja}{formatDate(d.fechaBaja, true)}{/if}</td>
                        <td>
                            <div class="flex gap-2 justify-center items-center">
                                <Button icon="/icons/view.svg" action={() => {imagenMascotaDetalle = d; popupDetalle = true}}></Button>
                                <Button icon="/icons/edit.svg" action={() => goto(`/AdministrarImagenesMascota/${d.id}`)}></Button>
                                {#if !d.fechaBaja}<Button icon="/icons/trash.svg" action={() => {imagenMascotaBaja = d; popupBaja = true}}></Button>{/if}
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


<Popup bind:visible={popupDetalle} fitH fitW title="Detalle de Imagen de Mascota">
    <p>Nombre: {imagenMascotaDetalle?.nombre}</p>
    <div class="flex h-[50vh] w-full justify-center mb-2 mt-2">
        <img src="{imagenMascotaDetalle?.url}" alt="Mascota" class="h-full" />
    </div>
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupDetalle = false}}>Atrás</Button>
		<Button action={() => goto(`/AdministrarImagenesMascota/${imagenMascotaDetalle?.id}`)}>Modificar</Button>
        {#if !imagenMascotaDetalle?.fechaBaja}<Button action={() => {popupDetalle = false; imagenMascotaBaja = imagenMascotaDetalle; popupBaja = true}}>Eliminar</Button>{/if}
	</div>
</Popup>

<Popup bind:visible={popupBaja} fitH fitW title="Eliminar Imagen de Mascota">
	<p>¿Está seguro de que desea eliminar la siguiente imagen de mascota?</p>
    <p>Nombre: {imagenMascotaBaja?.nombre}</p>
    <div class="flex h-[50vh] w-full justify-center mb-2 mt-2">
        <img src="{imagenMascotaBaja?.url}" alt="Mascota" class="h-full" />
    </div>
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupBaja = false}}>Cancelar</Button>
		<Button action={baja}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={exitoBaja} fitH fitW>
	Imagen dada de baja exitosamente
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {exitoBaja = false}}>Aceptar</Button>
	</div>
</Popup>

<PopupError bind:visible={popupErrorInstanciaVisible} title="Error al eliminar">
    <p>No se puede dar de baja la imagen, pues la(s) siguiente(s) instancia(s) de la mascota la están usando:</p>
    <div class="flex flex-col gap-2">
        {#each popupErrorInstancia as instancia}
            <div class="flex gap-2 justify-start items-center">
                <span>{instancia.nombre}</span>
                <Button icon="/icons/arrow-right.svg" action={() => goto(`/AdministrarInstanciasMascota/${instancia.id}`)}></Button>
            </div>
        {/each}
    </div>
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para administrar imágenes de mascota.
</PopupError>