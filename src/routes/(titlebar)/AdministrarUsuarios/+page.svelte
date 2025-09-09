<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import CheckBox from "$lib/components/CheckBox.svelte";
	import ComboBox from "$lib/components/ComboBox.svelte";
	import DatePicker, { formatDate } from "$lib/components/DatePicker.svelte";
	import PageControl from "$lib/components/PageControl.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import Table from "$lib/components/Table.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import type DTODenunciaEventoCompleta from "$lib/dtos/eventos/DTODenunciaEventoCompleta";
	import type DTODenunciaEventoSimple from "$lib/dtos/eventos/DTODenunciaEventoSimple";
	import type DTOFiltrosBusquedaUsuarios from "$lib/dtos/usuarios/DTOFiltrosBusquedaUsuarios";
	import type DTOResultadoBusquedaUsuario from "$lib/dtos/usuarios/DTOResultadoBusquedaUsuario";
	import { HttpError } from "$lib/request/request";
	import { EventosService } from "$lib/services/EventosService";
	import { UsuariosService } from "$lib/services/UsuariosService";
	import { permisos, token } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

    $: errorPermiso = false;

	$: errorGenerico = "";
	$: errorGenericoVisible = false;

    let filtros : DTOFiltrosBusquedaUsuarios = {
        texto: "",
        roles: []
    }
    
    let page = 0;
    let lastPage = 0;
    $: page, buscar();

    let listo = false;

    let resultados : DTOResultadoBusquedaUsuario[] = [];

    let roles = [] as {id: number, nombre: string, checked: boolean}[]

    onMount(async () => {
        if (get(token) === "") {
			goto("/");
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("AdministracionDenunciasEventos")) {
			errorPermiso = true;
			return;
		}

        try {
			roles = await UsuariosService.obtenerRoles();
            roles.forEach((r, i, arr) => {
                arr[i].checked = true;
            })

            listo = true;
            buscar();
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
    })


    async function buscar(resetPage : boolean = false) {
        if (resetPage) {
            page = 0;
            return;
        }
        filtros.roles = [];

        roles.forEach(e => {
            if (e.checked) {
                filtros.roles.push(e.id);
            }
        })

        try {
			let tmp = await UsuariosService.adminBuscarUsuarios(filtros, page);
            lastPage = tmp.totalPages - 1;
            resultados = tmp.content;
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
            <span>Usuarios</span>
            <Button icon="/icons/plus.svg"></Button>
        </h1>

        {#if listo}
            <div class="flex w-full gap-2 items-center">
                <TextField label={null} placeholder="Buscar..." classes="w-full max-w-md" bind:value={filtros.texto} action={() => {buscar(true)}}></TextField>
                <Button icon="/icons/search.svg" action={() => {buscar(true)}} classes="h-fit"></Button>
            </div>
            
            <div class="flex w-full flex-wrap gap-2">
                {#each roles as e}
                    <div class="flex justify-start items-center gap-2">
                        <CheckBox bind:checked={e.checked}><span class="whitespace-nowrap">{e.nombre}</span></CheckBox>
                    </div>
                {/each}
            </div>

            <Table cols={["Nombre", "Apellido", "Correo electrónico", "Nombre de usuario", "Alta", "Baja", "Acciones"]}>
                {#each resultados as d}
                    <tr>
                        <td>{d.nombre}</td>
                        <td>{d.apellido}</td>
                        <td>{d.mail}</td>
                        <td>@{d.username}</td>
                        <td>{formatDate(d.fechaAlta)}</td>
                        <td>{d.fechaBaja !== null ? formatDate(d.fechaBaja) : "-"}</td>
                        <td>
                            <div class="flex gap-2 justify-center items-center">
                                <Button icon="/icons/view.svg"></Button>
                                <Button icon="/icons/edit.svg" action={() => goto(`/AdministrarUsuarios/Editar/${d.username}`)}></Button>
                                <Button icon="/icons/trash.svg"></Button>
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