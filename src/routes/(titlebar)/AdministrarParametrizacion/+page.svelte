<script lang="ts">
	import PopupError from "$lib/components/PopupError.svelte";
	import { onMount } from "svelte";
    import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
    import { permisos, token } from "$lib/stores";
	import { get } from "svelte/store";
	import Table from "$lib/components/Table.svelte";
	import PageControl from "$lib/components/PageControl.svelte";
	import type DTOParametro from "$lib/dtos/parametros/DTOParametro";
	import Popup from "$lib/components/Popup.svelte";
	import { ParametroService } from "$lib/services/ParametroService";
	import { HttpError } from "$lib/request/request";


    $: errorPermiso = false;
    $: errorGenerico = "";
    $: errorGenericoVisible = false;

    let page = 0;
    let lastPage = 0;
    $: page, buscar();
    

    let listo = false;

    let resultados=[] as DTOParametro[];

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
			let response = await ParametroService.obtenerListaParametros(page);
            resultados = response.content as DTOParametro[];
            lastPage = response.totalPages - 1;

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
			await ParametroService.bajaParametro(parametroBaja);
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
            <span>Parametrización</span>
            <Button classes="text-xs info_parametrizacion min-w-[30px] font-bold">i</Button> 
            <!-- <Button icon="/icons/plus.svg" action={() => goto("/AdministrarParametrizacion/Nuevo")}></Button> -->
        </h1>

        {#if listo}
            <Table cols={["ID", "Nombre", "Descripción", "Valor", "Acciones"]}>
                {#each resultados as d}
                    <tr>
                        <td class="w-[10%]">{d.identificador}</td>
                        <td class="w-[20%]">{d.nombre}</td>
                        <td class="w-[40%]">{d.descripcion}</td>
                        <td class="w-[20%]">{d.valor}</td>
                        <td class="w-[10%]">
                            <div class="flex gap-2 justify-center items-center">
                                <Button icon="/icons/edit.svg" action={() => goto(`/AdministrarParametrizacion/${d.id}`)}></Button>
                                <!-- <Button icon="/icons/trash.svg" action={() => {parametroBaja = d.id; popupBaja = true}}></Button> -->
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
	¿Está seguro de que desea dar de baja a este Parámetro?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupBaja = false}}>Cancelar</Button>
		<Button action={baja}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={exitoBaja} fitH fitW>
	Parámetro dado de baja exitosamente
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
