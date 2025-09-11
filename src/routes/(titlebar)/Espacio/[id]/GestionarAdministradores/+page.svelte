<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import { token, permisos } from "$lib/stores";
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
    
    let previousPage: string = base;

    $: errorPermiso = false;

	$: errorGenerico = "";
	$: errorGenericoVisible = false;

    $:id = Number(page.params.id);
    $: nombreEspacio = "";

    $: usuario = null as null | DTOBusquedaUsuario;
	$: popupBusquedaUsuariosVisible = false;
	async function buscarUsuarios(valor: string) {
		return await EspaciosService.buscarUsuariosNoAdministradores(id, valor);
	}

    $: popupConfirmEliminarAdministradorVisible = false;
    $: popupAdministradorConfirmacionVisible = false;
    $: popupOrganizadorConfirmacionVisible = false;
    $: administrador = {} as DTOAdministrador;

    $: data = {} as DTOAdministradoresEspacio;
    $: resultados = [] as DTOAdministrador[];
    $: resultadosAnteriores = [] as DTOAdministrador[];

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
            await filtrarAdministradores();            
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
            resultadosAnteriores = data.administradores.filter(r => !r.fechasAdministracion.some(f => f.fechaHasta == null));
            resultados = data.administradores.filter(r => r.fechasAdministracion.some(f => f.fechaHasta == null));
            resultados = [...resultados];
            resultadosAnteriores = [...resultadosAnteriores];
        }catch(e){
            if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}
        }
    }

    async function agregarAdministrador(){
        try{
            await EspaciosService.agregarAdministradorEspacio(id, usuario ? usuario.username: administrador.username);
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

    async function eliminarAdministrador() {
        try {
            await EspaciosService.eliminarAdministradorEspacio(id, administrador.id);
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
			await EspaciosService.entregarPropietario(id, administrador.id);
            filtrarAdministradores();
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
                        <Button icon="/icons/upgrade.svg" action={() => {administrador.id=r.id; popupOrganizadorConfirmacionVisible=true}} classes="shrink-0"></Button>
                            <Button icon="/icons/cross.svg" action={() => {popupConfirmEliminarAdministradorVisible = true; administrador.id=r.id}} classes="shrink-0"></Button>
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
                            <Button icon="/icons/check.png" action={() => {administrador=r;popupAdministradorConfirmacionVisible=true}} classes="shrink-0"></Button>
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
	</div>
    <div class="flex flex-row flex-wrap gap-2 h-fit p-2 justify-center items-center">
        <Button action={()=>{goto(previousPage)}}>Atrás</Button>
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