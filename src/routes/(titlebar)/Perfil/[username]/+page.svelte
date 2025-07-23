<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import { token, permisos, username } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";
    import { page } from "$app/state"
	import type DTOPerfil from "$lib/dtos/usuarios/DTOPerfil";
	import { UsuariosService } from "$lib/services/UsuariosService";
	import { HttpError } from "$lib/request/request";
	import { formatDate } from "$lib/components/DatePicker.svelte";

    $: errorPermiso = false;

    $: requestedUsername = page.params.username;

    $: perfil = {
		username: "",
		nombre: "",
		apellido: "",
		mail: null,
		dni: null,
		fechaNacimiento: null,
		calificaciones: null
    } as DTOPerfil;

    $: errorGenerico = ""
    $: errorGenericoVisible = false

    $: urlFotoDePerfil = "/icons/placeholder.png"

    $: calificaciones = [] as {nombre: string, porcentaje: number, imgUrl: string}[]

    $: permisosList = [] as string[]
    $: isLoggedInUser = false;

    onMount(async () => {     
        if (get(token) === "") {
            goto("/");
        }

        if (get(username) === requestedUsername) {
            isLoggedInUser = true;
            if(!get(permisos).includes("VisionPerfilPropio")) {
                errorPermiso = true;
                return;
            }
        } else {
            if(!get(permisos).includes("VisionPerfilTercero")) {
                errorPermiso = true;
                return;
            }
        }

        permisosList = get(permisos);

        try {
            perfil = await UsuariosService.obtenerPerfil(requestedUsername);
            urlFotoDePerfil = await UsuariosService.obtenerFotoDePerfil(requestedUsername);
            
            perfil.calificaciones?.forEach(async cal => {
                let img = await UsuariosService.obtenerImagenDeCalificacion(cal.nombre);
                
                calificaciones.push({
					nombre: cal.nombre,
					porcentaje: cal.porcentaje,
					imgUrl: img
				})
                calificaciones = [...calificaciones]
            });

            
        } catch (e) {
            if (e instanceof HttpError) {
                errorGenerico = e.message;
                errorGenericoVisible = true;
            }
            console.log(e);
            
        }
    });
</script>

<div id="content">
    <div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
        <h1 class="text-m text-center">
        {#if isLoggedInUser}
            Mi Perfil
        {:else}
            Perfil
        {/if}
        </h1>
        <div class="flex justify-center items-center">
            <img src={urlFotoDePerfil} alt="Foto de perfil" class="h-[200px] w-[200px]">
        </div>
        <div class="text-center flex flex-col">
            <span>{perfil.nombre} {perfil.apellido}</span>
            <span>{perfil.username}</span>
            {#if isLoggedInUser}
                <span>{perfil.mail}</span>
            {/if}
        </div>
        {#if isLoggedInUser}
            {#if perfil.dni !== null}
                <div class="w-full md:w-[50vw] mx-auto">
                    DNI N.°: {perfil.dni}
                </div>
            {/if}
            {#if perfil.fechaNacimiento !== null}
                <div class="w-full md:w-[50vw] mx-auto">
                    Fecha de nacimiento: {formatDate(new Date(perfil.fechaNacimiento))}
                </div>
            {/if}
            {#if perfil.calificaciones !== null && calificaciones.length === perfil.calificaciones.length}
                <div>
                    <div class="w-full md:w-[50vw] mx-auto mb-4">
                        Calificación:
                    </div>
                    <div class="w-full flex flex-wrap gap-2 justify-center">
                        {#each calificaciones as cal}
                        <div class="w-[25vw] sm:w-[70px] h-fit flex flex-col justify-start items-center">
                            <img src={cal.imgUrl} alt={cal.nombre} class="object-contain">
                            <span class="mt-2">{cal.porcentaje}%</span>
                        </div>
                        {/each}
                    </div>
                </div>
            {/if}
        {/if}
        
    </div>
    <div class="flex flex-row flex-wrap gap-2 h-fit p-2 justify-center items-center">
        {#if isLoggedInUser}
            {#if permisosList.includes("ParticipacionGrupos")}
                <Button action={() => {goto("/MisGrupos")}}>Ver Mis Grupos</Button>
            {/if}

            <Button action={() => {goto("/MisComprobantes")}}>Ver Mis Comprobantes</Button>
            
            {#if permisosList.includes("ModificacionPerfilPropio")}
                <Button action={() => {goto("/EditarPerfil")}}>Editar Perfil</Button>
            {/if}

            <Button action={() => {goto("/RestablecerContrasena")}}>Cambiar Contraseña</Button>
        {/if}
    </div>
</div>  

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para acceder a este perfil de usuario.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>