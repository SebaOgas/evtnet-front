<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import { formatDate } from "$lib/components/DatePicker.svelte";
	import PageControl from "$lib/components/PageControl.svelte";
	import Table from "$lib/components/Table.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import type DTOGrupoSimple from "$lib/dtos/grupos/DTOGrupoSimple";
	import { HttpError } from "$lib/request/request";
	import { GruposService } from "$lib/services/GruposService";
	import { permisos, token } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

    $: errorPermiso = false;

	$: errorGenerico = "";
	$: errorGenericoVisible = false;
    
    let page = 0;
    let lastPage = 0;
    $: page, buscar();

    let listo = false;

    let resultados : DTOGrupoSimple[] = [];

    onMount(async () => {
        if (get(token) === "") {
			goto("/");
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("AdministracionUsuarios")) {
			errorPermiso = true;
			return;
		}

        await buscar();
        listo = true;
    })

    let texto : string = "";

    async function buscar(resetPage : boolean = false) {
        if (resetPage) {
            page = 0;
            return;
        }

        try {
			let tmp = await GruposService.obtenerGrupos(texto, page);
            
            lastPage = tmp.totalPages - 1;
            resultados = tmp.content;
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}             
		}
    }

    let grupoDetalle : DTOGrupoSimple | null = null;
</script>



<div id="content">
    <div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
        <h1 class="text-m flex gap-2 justify-start items-center">
            <span>Grupos</span>
        </h1>

        {#if listo}
            <div class="flex w-full gap-2 items-center">
                <TextField label={null} placeholder="Buscar..." classes="w-full max-w-md" bind:value={texto} action={() => {buscar(true)}}></TextField>
                <Button icon="/icons/search.svg" action={() => {buscar(true)}} classes="h-fit"></Button>
            </div>

            <Table cols={["Nombre del grupo", "Descripción", "Creador", "Alta", "Baja", "Acciones"]}>
                {#each resultados as d}
                    <tr>
                        <td>{d.nombre}</td>
                        <td>{d.descripcion}</td>
                        <td>{d.creador.nombre} {d.creador.apellido}</td>
                        <td>{formatDate(d.fechaAlta)}</td>
                        <td>{d.fechaBaja !== null ? formatDate(d.fechaBaja) : "-"}</td>
                        <td>
                            <div class="flex gap-2 justify-center items-center">
                                <Button icon="/icons/view.svg" action={() => grupoDetalle = d}></Button>
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