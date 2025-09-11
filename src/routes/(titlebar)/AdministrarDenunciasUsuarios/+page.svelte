<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import { formatDate } from "$lib/components/DatePicker.svelte";
	import PageControl from "$lib/components/PageControl.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupAdminUsuario from "$lib/components/PopupAdminUsuario.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import Table from "$lib/components/Table.svelte";
	import type DTODenunciaUsuario from "$lib/dtos/usuarios/DTODenunciaUsuario";
	import type DTORol from "$lib/dtos/usuarios/DTORol";
	import { HttpError } from "$lib/request/request";
	import { UsuariosService } from "$lib/services/UsuariosService";
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

    let resultados : DTODenunciaUsuario[] = [];

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


    async function buscar() {
        try {
			let tmp = await UsuariosService.obtenerDenunciasUsuario(page);
            
            lastPage = tmp.totalPages - 1;
            resultados = tmp.content;
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}             
		}
    }


    let denunciaDetalle : DTODenunciaUsuario | null = null;
    $: popupDetalle = denunciaDetalle === null ? false : true;


    let usuarioAbierto : string | null = null;
</script>



<div id="content">
    <div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
        <h1 class="text-m flex gap-2 justify-start items-center">
            <span>Denuncias a usuarios</span>
        </h1>

        {#if listo}
            <Table cols={["Nombre Denunciado", "Nombre Denunciado", "Fecha", "Acciones"]}>
                {#each resultados as d}
                    <tr>
                        <td>{d.denunciado.nombre} {d.denunciado.apellido}</td>
                        <td>{d.denunciante.nombre} {d.denunciante.apellido}</td>
                        <td>{formatDate(d.fecha)}</td>
                        <td>
                            <div class="flex gap-2 justify-center items-center">
                                <Button icon="/icons/view.svg" action={() => denunciaDetalle = d}></Button>
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

<Popup bind:visible={popupDetalle} fitH fitW title="Detalle de Denuncia a Usuario">
    {#if denunciaDetalle !== null}
    <div class="flex flex-col gap-2">
        <div>Fecha de la denuncia: {formatDate(denunciaDetalle.fecha)}</div>
        <div>Descripción: {denunciaDetalle.descripcion}</div>
        <div class="flex justify-between gap-2 items-center">
            <span>Denunciante: {denunciaDetalle.denunciante.nombre} {denunciaDetalle.denunciante.apellido} @{denunciaDetalle.denunciante.username} ({denunciaDetalle.denunciante.mail})</span>
            <Button action={() => usuarioAbierto = denunciaDetalle !== null ? denunciaDetalle.denunciante.username : null}>Ver usuario</Button>
        </div>
        <div class="flex justify-between gap-2 items-center">
            <span>Denunciado: {denunciaDetalle.denunciado.nombre} {denunciaDetalle.denunciado.apellido} @{denunciaDetalle.denunciado.username} ({denunciaDetalle.denunciado.mail})</span>
            <Button action={() => usuarioAbierto = denunciaDetalle !== null ? denunciaDetalle.denunciado.username : null}>Ver usuario</Button>
        </div>
    </div>
    <div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupDetalle = false}}>Atrás</Button>
	</div>
    {/if}
</Popup>


<PopupAdminUsuario bind:username={usuarioAbierto}/>

<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para editar usuarios.
</PopupError>