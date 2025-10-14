<script lang="ts">
    /*
        Built with assistance from Claude
    */
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import { DisciplinasService } from "$lib/services/DisciplinasService";
	import { HttpError } from "$lib/request/request";
	import { token, permisos } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";
	import { page } from "$app/state";
	import type DTOSuperEventoEditar from "$lib/dtos/eventos/DTOSuperEventoEditar";
	import { SupereventosService } from "$lib/services/SupereventosService";
	import { formatDate } from "$lib/components/DatePicker.svelte";
	import type DTOBusquedaEvento from "$lib/dtos/eventos/DTOBusquedaEvento";
	import PopupBusquedaEventos from "$lib/components/PopupBusquedaEventos.svelte";

	$: errorPermiso = false;
	$: id = Number(page.params.id);

    $: data = null as null | DTOSuperEventoEditar;

	onMount(async () => {     
		if (get(token) === "") {
			goto("/");
		}

		const userPermisos = get(permisos);
		if(!userPermisos.includes("AdministracionEventos")) {
			errorPermiso = true;
			return;
		}

		try {
			data = await SupereventosService.obtenerSuperEventoEditar(id);
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}            
		}
	});

	function validateNombre(val: string) {
		if (val.trim() === "") {
			return {
				valid: false,
				reason: "El nombre es obligatorio"
			}
		}

		return {
			valid: true,
			reason: undefined
		}
	}


	$: warningNombreVisible = false;

	$: errorGenerico = ""
	$: errorGenericoVisible = false

	$: popupConfirmDejarVisible = false;
	$: popupExitoVisible = false;

	async function guardar() {
        if (data === null) return;

		if (data.nombre.trim() === "") {
			warningNombreVisible = true;
            return;
		} else {
			warningNombreVisible = false;
		}

		try {
			await SupereventosService.editarSuperEvento(data);
			popupExitoVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}   
		}
	}

	function cancelar() {
		goto(`/SuperEvento/${id}`);
	}

	async function dejarDeSerAdministrador() {
		try {
			await SupereventosService.dejarDeAdministrar(id);
			goto(`/SuperEvento/${id}`);
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
		popupConfirmDejarVisible = false;
	}

    $: errorBaja = false;
    $: popupConfirmDarBajaVisible = false;

    function baja() {
        if (data === null) return;

        let eventosVinculados = false;
        data.eventos.forEach(e => {
            if (e.eliminar === false) eventosVinculados = true;
        });

        if (eventosVinculados) {
            errorBaja = true;
            return;
        }

        popupConfirmDarBajaVisible = true;
    }

    async function confirmarBaja() {
        try {
			await SupereventosService.baja(id);
			goto(`/MisSuperEventos`);
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
    }


	function eliminarEvento(evento: { id: number; nombre: string; fechaDesde: Date; fechaHasta: Date; nombreEspacio: string; crear: boolean; eliminar: boolean; }) {       
        if (data === null) return;
        if (evento.crear === false) {
            // Ya existía
            data.eventos.forEach((e, i, arr) => {                
                if (evento.id === e.id) {
                    arr[i].eliminar = true;
                }
            })
            data = {...data};
            
        } else {
            //No existía, y fue agregado ahora
            data.eventos = data.eventos.filter(e => e.id !== evento.id);
            data = {...data};
        }
	}

    $: popupBusquedaEventosVisible = false;
    $: eventoSelec = null as null | DTOBusquedaEvento;
    async function buscarEventosNoVinculados(valor: string) {
		return await SupereventosService.buscarEventosNoVinculados(id, valor);
	}

    $: (() => {
        if (eventoSelec === null) return;
        if (data === null) return;
        
        let ix = data.eventos.findIndex(e => eventoSelec !== null && e.id === eventoSelec.id);
        if (ix === -1) {
            //No lo encontró, entonces se agrega
            data.eventos.push({
				id: eventoSelec.id,
				nombre: eventoSelec.nombre,
				fechaDesde: eventoSelec.fechaDesde,
				fechaHasta: eventoSelec.fechaHasta,
				nombreEspacio: eventoSelec.nombreEspacio,
				crear: true,
				eliminar: false
			})
        } else {
            //Ya está, se asegura de que no sea eliminado
            data.eventos[ix].eliminar = false;
        }
        data = {...data};
        eventoSelec = null;
    })()
</script>


<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-m text-center">
			Administrar superevento
		</h1>

        {#if data !== null}
            <TextField label="Nombre del superevento" bind:value={data.nombre} validate={validateNombre} forceValidate={warningNombreVisible} min={1} max={50}/>

            <TextField label="Descripción del superevento" multiline bind:value={data.descripcion} rows={6} max={500}/>
        

            <div class="flex w-full justify-between items-center mb-4">
                <div>Eventos</div>
                <Button icon="/icons/plus.svg" action={() => popupBusquedaEventosVisible = true}></Button>
            </div>
            <div class="flex flex-col w-full gap-2 md:flex-row md:flex-wrap justify-between">
                {#each data.eventos as e}
                    {#if !e.eliminar}
                        <div class="flex flex-col gap-2 pb-4 w-full md:w-[30%]">
                            <div class="flex justify-between items-center">
                                <span class="text-s">{e.nombre}</span>
                                <Button icon="/icons/cross.svg" action={() => {eliminarEvento(e)}} classes="shrink-0"></Button>
                            </div>
                            <span class="text-xs ml-4">{formatDate(new Date(e.fechaDesde), true)} - {formatDate(new Date(e.fechaHasta), true)}</span>
                            <span class="text-xs ml-4">{e.nombreEspacio}</span>
                        </div>
                    {/if}
                {/each}
            </div>
        {/if}
	</div>

	<div class="flex flex-row flex-wrap gap-2 h-fit p-2 justify-center items-center">
		<Button action={cancelar}>Cancelar</Button>
		<Button action={guardar}>Guardar</Button>

        {#if data !== null && data.esOrganizador}
            <Button action={() => {goto(`/SuperEvento/${id}/GestionarAdministradores`)}}>Gestionar administradores</Button>
		    <Button action={baja}>Dar de baja</Button>
        {/if}

        {#if data !== null && !data.esOrganizador}
            <Button action={() => {popupConfirmDejarVisible = true}}>Dejar de ser administrador</Button>
        {/if}
    </div>
</div>

<!-- Success popup -->
<Popup bind:visible={popupExitoVisible} fitH fitW>
	Superevento modificado exitosamente
	<div class="flex justify-center items-center w-full">
		<Button action={() => {goto(`/SuperEvento/${id}`)}}>Aceptar</Button>
	</div>
</Popup>

<!-- Confirmation popup for leaving admin -->
<Popup bind:visible={popupConfirmDejarVisible} fitH fitW>
	¿Está seguro de que quiere dejar de ser administrador del superevento?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupConfirmDejarVisible = false}}>Cancelar</Button>
		<Button action={dejarDeSerAdministrador}>Confirmar</Button>
	</div>
</Popup>

<!-- Confirmation popup for baja -->
<Popup bind:visible={popupConfirmDarBajaVisible} fitH fitW>
	¿Está seguro de que quiere dar de baja este superevento?
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupConfirmDarBajaVisible = false}}>Cancelar</Button>
		<Button action={confirmarBaja}>Confirmar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorBaja}>
	No se puede dar de baja el superevento porque el mismo tiene eventos vinculados. Primero debe desvincular todos los eventos.
</PopupError>

<PopupError bind:visible={errorPermiso}>
	No tiene permiso para administrar espacios.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
	{errorGenerico}
</PopupError>

<PopupBusquedaEventos searchFunction={buscarEventosNoVinculados} bind:selected={eventoSelec} bind:visible={popupBusquedaEventosVisible}/>