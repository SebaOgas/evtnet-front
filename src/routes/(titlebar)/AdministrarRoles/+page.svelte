<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import { formatDate } from "$lib/components/DatePicker.svelte";
	import PageControl from "$lib/components/PageControl.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import Table from "$lib/components/Table.svelte";
	import type DTORol from "$lib/dtos/usuarios/DTORol";
	import { HttpError } from "$lib/request/request";
	import { UsuariosService } from "$lib/services/UsuariosService";
	import { permisos, token } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

    let adminReservados = false;

    $: errorPermiso = false;

	$: errorGenerico = "";
	$: errorGenericoVisible = false;
    
    let page = 0;
    let lastPage = 0;
    $: page, buscar();

    let listo = false;

    let resultados : DTORol[] = [];

    onMount(async () => {
        if (get(token) === "") {
			goto("/");
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("AdministracionRoles") && !userPermisos.includes("AdministracionRolesReservados")) {
			errorPermiso = true;
			return;
		}

        adminReservados = userPermisos.includes("AdministracionRolesReservados");

        await buscar();
        listo = true;
    })


    async function buscar() {
        try {
			let tmp = await UsuariosService.obtenerRolesCompletos(page);
            
            lastPage = tmp.totalPages - 1;
            resultados = tmp.content;
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}             
		}
    }


    let rolDetalle : DTORol | null = null;
    $: popupDetalle = rolDetalle === null ? false : true;

    let popupBaja = false;
    let rolBaja : number | null = null;
    $: popupBaja = rolBaja === null ? false : true;
    let exitoBaja = false;
    async function baja() {
        if (rolBaja === null) {
            errorGenerico = "No se pudo identificar al rol a dar de baja";
            errorGenericoVisible = true;
            return;
        }

        try {
			await UsuariosService.bajaRol(rolBaja);
            buscar();
            rolBaja = null;
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
            <span>Roles</span>
            <Button icon="/icons/plus.svg" action={() => goto("/AdministrarRoles/Nuevo")}></Button>
        </h1>

        {#if listo}
            <Table cols={["Nombre", "Alta", "Baja", "Reservado", "Acciones"]}>
                {#each resultados as d}
                    <tr>
                        <td>{d.nombre}</td>
                        <td>{formatDate(d.fechaAlta, true)}</td>
                        <td>{d.fechaBaja !== null ? formatDate(d.fechaBaja, true) : "-"}</td>
                        <td>{d.reservado ? "Sí" : "No"}</td>
                        <td>
                            <div class="flex gap-2 justify-center items-center">
                                <Button icon="/icons/view.svg" action={() => rolDetalle = d}></Button>
                                {#if !d.reservado || adminReservados}
                                    <Button icon="/icons/edit.svg" action={() => goto(`/AdministrarRoles/${d.id}`)}></Button>
                                    <Button icon="/icons/trash.svg" action={() => rolBaja = d.id}></Button>
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

<Popup bind:visible={popupDetalle} fitH fitW title="Detalle del rol">
    {#if rolDetalle !== null}
    <div>
        <div>Nombre: {rolDetalle.nombre}</div>
        <div>Descripción: {rolDetalle.descripcion}</div>
        <div>Permisos:</div>
        <div class="ml-4">
            {#each rolDetalle.permisos as p}
                <div>{p.nombre}</div>
                <div class="ml-4">
                    {#each p.periodos as p2}
                        <div>{formatDate(p2.desde, true)} - {p2.hasta === null ? "actualidad" : formatDate(p2.hasta, true)}</div>
                    {/each}
                </div>
            {/each}
        </div>
    </div>
    <div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupDetalle = false}}>Aceptar</Button>
	</div>
    {/if}
</Popup>

<Popup bind:visible={popupBaja} fitH fitW>
	¿Está seguro de que desea dar de baja a este rol?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupBaja = false}}>Cancelar</Button>
		<Button action={baja}>Confirmar</Button>
	</div>
</Popup>

<Popup bind:visible={exitoBaja} fitH fitW>
	Rol dado de baja exitosamente
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {exitoBaja = false}}>Aceptar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para editar usuarios.
</PopupError>