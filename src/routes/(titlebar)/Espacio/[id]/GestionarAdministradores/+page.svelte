<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import { token, permisos, user } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";
	import { EspaciosService } from "$lib/services/EspaciosService";
	import { HttpError } from "$lib/request/request";
	import PopupBusquedaUsuarios from "$lib/components/PopupBusquedaUsuarios.svelte";
    import type DTOBusquedaUsuario from "$lib/dtos/usuarios/DTOBusquedaUsuario";
	import { page } from "$app/state";
	import type DTOAdministradoresEspacio from "$lib/dtos/espacios/DTOAdministradoresEspacio";
	import { formatDate } from "$lib/components/DatePicker.svelte";
	import { base } from "$app/paths";
	import Popup from "$lib/components/Popup.svelte";
	import type { DTOAdministrador } from "$lib/dtos/espacios/DTOAdministradoresEspacio";
	import type { DTOEncargadoSubespacio } from "$lib/dtos/espacios/DTOEncargadoSubespacio";
    
    let previousPage: string = base;

    $: errorPermiso = false;

	$: errorGenerico = "";
	$: errorGenericoVisible = false;

    $:id = Number(page.params.id);
    $: nombreEspacio = "";
    $: idSubespacio = 0;

    $: usuario = null as null | DTOBusquedaUsuario;
	$: popupBusquedaUsuariosVisible = false;
	async function buscarUsuarios(valor: string) {
		return await EspaciosService.buscarUsuariosNoAdministradores(id, valor);
	}

    $: popupExitoNuevoVisible = false;
    $: popupExitoEliminacionVisible = false;
    $: popupExitoPropiestarioVisible = false;
    $: popupConfirmEliminarAdministradorVisible = false;
    $: popupAdministradorConfirmacionVisible = false;
    $: popupOrganizadorConfirmacionVisible = false;
    $: popupEncargadoConfirmacionVisible = false;
    $: administrador = {} as DTOAdministrador;
    $: encargado={} as DTOEncargadoSubespacio;

    $: data = {} as DTOAdministradoresEspacio;
    $: resultados = [] as DTOAdministrador[];
    $: resultadosAnteriores = [] as DTOAdministrador[];

    $: dataSubespacio=[] as DTOEncargadoSubespacio[];

	onMount(async () => {
		if (get(token) === "") {
			goto("/");
		}

		const userPermisos = get(permisos);
		if (!userPermisos.includes("AdministracionEspaciosPrivados")) {
			errorPermiso = true;
			return;
		}

        try {
            nombreEspacio = await EspaciosService.obtenerNombreEspacio(id);
            filtrarAdministradores();            
            obtenerEncargadosSubespacios();

		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
		}
	});

    async function filtrarAdministradores(){
        try{            
            data = await EspaciosService.obtenerAdministradoresEspacio(id);
            if (!data.esPropietario) {
                errorPermiso = true;
                return;
            }
            resultadosAnteriores = data.dtoAdministradores.filter(r => !r.fechasAdministracion.some(f => f.fechaHasta == null));
            resultados = data.dtoAdministradores.filter(r => r.fechasAdministracion.some(f => f.fechaHasta == null));
            resultados.sort((a,b) => b.fechasAdministracion[0].fechaDesde.getTime() - a.fechasAdministracion[0].fechaDesde.getTime());
            resultados = [...resultados];
            resultadosAnteriores = [...resultadosAnteriores];
        }catch(e){
            if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
        }
    }

    async function obtenerEncargadosSubespacios(){
        try{
            dataSubespacio = await EspaciosService.obtenerEncargadosSubespacios(id);
        } catch (e) {
            if (e instanceof HttpError) {
                errorGenerico = e.message;
                errorGenericoVisible = true;
            }
        }
    }

    async function agregarAdministrador(){
        try{
            await EspaciosService.agregarAdministradorEspacio(id, usuario ? usuario.username: administrador.username);
            popupExitoNuevoVisible = true;
            await filtrarAdministradores();
            usuario = null;
        } catch (e) {
            if (e instanceof HttpError) {
                errorGenerico = e.message;
                errorGenericoVisible = true;
            }
        }
        popupAdministradorConfirmacionVisible = false;
    }

    async function agregarEncargado(){
        try{
            await EspaciosService.agregarEncargadoSubespacio(idSubespacio, usuario ? usuario.username: encargado.username);
            popupExitoNuevoVisible = true;
            await obtenerEncargadosSubespacios();
            usuario = null;
        } catch (e) {
            if (e instanceof HttpError) {
                errorGenerico = e.message;
                errorGenericoVisible = true;
            }
        }
        popupAdministradorConfirmacionVisible = false;
    }

    async function eliminarAdministrador() {
        try {
            await EspaciosService.eliminarAdministradorEspacio(id, administrador.username);
            popupExitoEliminacionVisible = true;
            await filtrarAdministradores();
        } catch (e) {
            if (e instanceof HttpError) {
                errorGenerico = e.message;
                errorGenericoVisible = true;
            }
        }
        popupConfirmEliminarAdministradorVisible = false;
    }

    async function confirmarEntregarPropietarioAdmin() {
        if (administrador === null) return;
		try {
			await EspaciosService.entregarPropietario(id, administrador.username);
            popupExitoPropiestarioVisible = true;
            //filtrarAdministradores();
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
                errorGenericoVisible = true;
			}
		}
		popupOrganizadorConfirmacionVisible = false;
	}

    $: (() => {
        if (usuario === null) return;
        popupAdministradorConfirmacionVisible = true;
    })()

    
</script>


<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
        <h1 class="flex justify-center items-center gap-2">
            <span class="text-m">Espacio</span>
            <span class="text-m">{nombreEspacio}</span>
        </h1>
		<h1 class="flex justify-center items-center gap-2">
            <span class="text-m">Gestionar Administradores</span>
            <Button icon="/icons/plus.svg" action={() => {popupBusquedaUsuariosVisible = true}}/>
        </h1>
        
        <div class="flex flex-col w-full gap-2 md:flex-row md:flex-wrap justify-between">
            {#each resultados as r}
                <div class="flex flex-col gap-2 pb-4 w-full md:w-[30%]">
                    <div class="flex flex-row items-center justify-between w-full gap-2">
                        <div class="flex flex-row items-center gap-2">
                            <img src={r.urlFotoPerfil} alt="Foto de perfil" on:click={() => goto('/Perfil/' + r.username)} class="w-12 h-12 rounded-full"/>
                            <span class="text-s">{r.nombreApellido}</span>
                        </div>
                        <div class="flex flex-row gap-2">
                            {#if !r.esPropietario}
                                <Button icon="/icons/upgrade.svg" action={() => {administrador = {...r}; popupOrganizadorConfirmacionVisible = true}} classes="shrink-0"></Button>
                                <Button icon="/icons/cross.svg" action={() => {popupConfirmEliminarAdministradorVisible = true; administrador = {...r}}} classes="shrink-0"></Button>
                            {/if}
                        </div>
                    </div>
                    <div class="flex flex-col items-center w-full">
                        <span class="text-s">Administrador entre:</span>
                    </div>
                    {#each r.fechasAdministracion as f}
                        <div class="flex flex-col items-center w-full">
                            <span class="text-s">{formatDate(f.fechaDesde, false)} - {#if f.fechaHasta == null}Actualidad {:else} {formatDate(f.fechaHasta ?? null, false)}{/if}</span>
                        </div>
                    {/each}
                </div>
            {/each}
        </div>

        <h1 class="flex justify-center items-center gap-2">
            <span class="text-m">Administradores anteriores</span>
        </h1>
        <div class="flex flex-col w-full gap-2 md:flex-row md:flex-wrap justify-between">
            {#each resultadosAnteriores as r}
                <div class="flex flex-col gap-2 pb-4 w-full md:w-[30%]">
                    <div class="flex flex-row items-center justify-between w-full gap-2">
                        <div class="flex flex-row items-center gap-2">
                            <img src={r.urlFotoPerfil} alt="Foto de perfil" on:click={() => goto('/Perfil/' + r.username)} class="w-12 h-12 rounded-full"/>
                            <span class="text-s">{r.nombreApellido}</span>
                        </div>
                        <div class="flex gap-2 shrink-0">
                            <Button icon="/icons/check.png" action={() => {administrador = {...r}; popupAdministradorConfirmacionVisible = true}} classes="shrink-0"></Button>
                        </div>
                    </div>
                    <div class="flex flex-col items-center w-full">
                        <span class="text-s">Administrador entre:</span>                        
                    </div>
                    {#each r.fechasAdministracion as f}
                        <div class="flex flex-col items-center w-full">
                            <span class="text-s">{formatDate(f.fechaDesde, false)} - {#if f.fechaHasta == null}Actualidad {:else} {formatDate(f.fechaHasta ?? null, false)}{/if}</span>
                        </div>
                    {/each}

                </div>
            {/each}
        </div>
        <h2 class="text-m text-center">
            SubEspacios
        </h2>
        <div class="mb-2 mt-2">
            <div class="flex flex-col gap-2">
				{#each dataSubespacio as se}
					<div>
						<div class ="flex flex-row flex-wrap gap-2 h-fit p-2 items-center">{se.nombreSubespacio}
                            {#if se.nombreApellidoEncargado!=null}
                                <Button action={() => {popupBusquedaUsuariosVisible = true; idSubespacio = se.idSubespacio}}>Cambiar encargado</Button>
                            {:else}
                                <Button action={() => {popupBusquedaUsuariosVisible = true; idSubespacio = se.idSubespacio}}>Agregar encargado</Button>
                            {/if}
                            </div>
                            <div class="flex flex-row items-center justify-between w-full gap-2">
                                {#if se.nombreApellidoEncargado!=null}
                                    <div class="flex flex-row items-center gap-2">
                                        <img src={se.urlFotoPerfil} alt="Foto de perfil" on:click={() => goto('/Perfil/' + se.username)} class="w-12 h-12 rounded-full"/>
                                        <span class="text-s">{se.nombreApellidoEncargado}</span>
                                    </div>
                                {:else}
                                    <div class="flex flex-row items-center gap-2">
                                        Sin encargado
                                    </div>
                                {/if}
                            </div>
					</div>
				{/each}
            </div>           
        </div>
	</div>
    <div class="flex flex-row flex-wrap gap-2 h-fit p-2 justify-center items-center">
        <Button action={()=>{goto(`/Espacio/${id}/Administrar`)}}>Atrás</Button>
    </div>
</div>

<PopupBusquedaUsuarios searchFunction={buscarUsuarios} bind:selected={usuario} bind:visible={popupBusquedaUsuariosVisible}/>

<Popup title="Confirmar" bind:visible={popupConfirmEliminarAdministradorVisible} fitH fitW>
	<div class="grow overflow-y-auto">
		<p>¿Está seguro que desea eliminar el administrador?</p>
	</div>
	<div class="flex gap-2 h-fit p-2 justify-center items-center">
		<Button action={() => {popupConfirmEliminarAdministradorVisible = false}}>Cancelar</Button>
		<Button action={eliminarAdministrador}>Confirmar</Button>
	</div>
</Popup>

<Popup title="Confirmar" bind:visible={popupAdministradorConfirmacionVisible} fitW fitH>
	<div class="grow overflow-y-auto">
		<p>¿Está seguro de designar a este usuario como administrador?</p>
        {#if usuario}<p>{usuario?.nombre}, {usuario?.apellido} ({usuario?.username})</p>{/if}
	</div>
	<div class="flex gap-2 h-fit p-2 justify-center items-center">
		<Button action={() => {popupAdministradorConfirmacionVisible = false}}>Cancelar</Button>
		<Button action={() => agregarAdministrador()}>Confirmar</Button>
	</div>
</Popup>

<Popup title="Confirmar" bind:visible={popupEncargadoConfirmacionVisible} fitW fitH>
	<div class="grow overflow-y-auto">
		<p>¿Está seguro de designar a este usuario como encargado?</p>
        {#if usuario}<p>{usuario?.nombre}, {usuario?.apellido} ({usuario?.username})</p>{/if}
	</div>
	<div class="flex gap-2 h-fit p-2 justify-center items-center">
		<Button action={() => {popupEncargadoConfirmacionVisible = false}}>Cancelar</Button>
		<Button action={() => agregarEncargado()}>Confirmar</Button>
	</div>
</Popup>

<Popup title="Confirmar" bind:visible={popupOrganizadorConfirmacionVisible} fitW fitH>
	<div class="grow overflow-y-auto">
		<p>¿Está seguro de designar a este usuario como propietario?</p>
        <p>{administrador?.nombreApellido}</p>
        <p>Usted ya no será propietario, sino que pasará a ser solo administrador del espacio.</p>
	</div>
	<div class="flex gap-2 h-fit p-2 justify-center items-center">
		<Button action={() => {popupOrganizadorConfirmacionVisible = false}}>Cancelar</Button>
		<Button action={() => confirmarEntregarPropietarioAdmin()}>Confirmar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorPermiso}>
	No tiene permiso para ver administradores del espacio.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
	{errorGenerico}
</PopupError>

<Popup bind:visible={popupExitoNuevoVisible} fitH fitW>
    Administrador creado exitosamente
    <div class="flex justify-center items-center w-full">
        <Button action={() => {popupExitoNuevoVisible = false}}>Aceptar</Button>
    </div>
</Popup>

<Popup bind:visible={popupExitoEliminacionVisible} fitH fitW>
    Administrador eliminado exitosamente
    <div class="flex justify-center items-center w-full">
        <Button action={() => {popupExitoEliminacionVisible = false}}>Aceptar</Button>
    </div>
</Popup>

<Popup bind:visible={popupExitoPropiestarioVisible} fitH fitW>
    Cambio de propietario realizado exitosamente
    <div class="flex justify-center items-center w-full">
        <Button action={() => {goto(`/Espacio/${id}/Administrar`)}}>Aceptar</Button>
    </div>
</Popup>