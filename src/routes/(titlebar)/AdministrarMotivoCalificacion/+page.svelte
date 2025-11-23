<script lang="ts">
	import PopupError from "$lib/components/PopupError.svelte";
	import { onMount } from "svelte";
    import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
    import { permisos, token } from "$lib/stores";
	import { get } from "svelte/store";
	import Table from "$lib/components/Table.svelte";
	import PageControl from "$lib/components/PageControl.svelte";
	import type DTOMotivoCalificacion from "$lib/dtos/motivoCalificacion/DTOMotivoCalificacion";
	import Popup from "$lib/components/Popup.svelte";
	import { CalificacionService } from "$lib/services/CalificacionService";
	import { HttpError } from "$lib/request/request";


    $: errorPermiso = false;
    $: errorGenerico = "";
    $: errorGenericoVisible = false;

    let page = 0;
    let lastPage = 0;
    

    let listo = false;

    let resultados=[] as DTOMotivoCalificacion[];

    let parametroBaja: number | null = null;

    $: popupBaja = parametroBaja !== null;
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
			resultados = await CalificacionService.obtenerListaMotivosCalificacion();

		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
    }

    async function baja() {
        if (parametroBaja === null) {
            errorGenerico = "No se pudo identificar a la parametro a dar de baja";
            errorGenericoVisible = true;
            return;
        }

        try {
			await CalificacionService.bajaMotivoCalificacion(parametroBaja);
            buscar();
            parametroBaja = null;
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
            <span>Motivos de Calificación</span>
            <Button icon="/icons/plus.svg" action={() => goto("/AdministrarMotivoCalificacion/Nuevo")}></Button>
        </h1>

        {#if listo}
            <Table cols={["Nombre", "Tipo", "Acciones"]}>
                {#each resultados as d}
                    <tr>
                        <td>{d.nombre}</td>
                        <td>{d.nombreTipoCalificacion}</td>
                        <td>
                            <div class="flex gap-2 justify-center items-center">
                                <Button icon="/icons/edit.svg" action={() => goto(`/AdministrarMotivoCalificacion/${d.id}`)}></Button>
                                <Button icon="/icons/trash.svg" action={() => {parametroBaja = d.id; popupBaja = true}}></Button>
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
	¿Está seguro de que desea dar de baja a este Motivo Calificación?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupBaja = false}}>Cancelar</Button>
		<Button action={baja}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={exitoBaja} fitH fitW>
	Motivo Calificación dado de baja exitosamente
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {exitoBaja = false}}>Aceptar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para administrar Parámetros.
</PopupError>
