<script lang="ts">
	import { afterNavigate, goto } from "$app/navigation";
	import { UsuariosService } from "$lib/services/UsuariosService";
	import { permisos, token, username, user } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";


    let menu : HTMLElement;
    let toggleMenu = () => {
        let display = menu.style.display;

        if (display === "flex") {
            menu.style.display = "none";
            return;
        }
        menu.style.display = "flex";
        userMenu.style.display = "none";
    }

    let userMenu : HTMLElement;
    let toggleUserMenu = () => {
        let display = userMenu.style.display;

        if (display === "flex") {
            userMenu.style.display = "none";
            return;
        }
        userMenu.style.display = "flex";
        menu.style.display = "none";
    }

    function cerrarSesion() {
        token.set("");
        permisos.set([]);
        username.set("");
        goto("/");
    }

    afterNavigate(() => {
        menu.style.display = "none";
        userMenu.style.display = "none";
    })

    $: permisosList = [] as string[];
    $: urlFotoDePerfil = "/icons/placeholder.png"

    onMount(async () => {
        permisosList = get(permisos);
        urlFotoDePerfil = await UsuariosService.obtenerFotoDePerfil(get(username));
    })
</script>


<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div id="titlebar" class="flex items-center justify-between p-none bg-light print:bg-transparent">
    <div class="flex items-baseline h-full p-1">
        <img src="/logo.png" alt="Logo" class="object-contain"/>
        <a href="/" class="text-xl font-bold text-white print:!text-light">evtnet</a>
    </div>

    <div class="flex items-center print:hidden">
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <img src={urlFotoDePerfil} alt="" class="userpic lg:hidden h-[38px] w-[38px] rounded-full cursor-pointer" on:click={toggleUserMenu}>

        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <img on:click={toggleMenu} id="burger" src="/icons/menu.png" alt="Logo" class="icon-white object-contain cursor-pointer"/>
    </div>

    
    <menu bind:this={menu} class="bg-light flex items-end lg:items-center lg:gap-2 text-s text-white font-bold p-s flex-col w-full lg:flex-row lg:justify-end lg:w-fit print:hidden">		
        
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="hidden xl:flex flex-col bold whitespace-nowrap text-end gap-0 leading-none cursor-pointer z-20" on:click={() => {if (permisosList.includes("VisionPerfilPropio")) goto("/Perfil")}}>
            <div>{get(user)?.nombre} {get(user)?.apellido}</div>
            <div class="commaList">
                {#each get(user)?.roles as r}
                    <span>{r}</span>
                {/each}
            </div>
        </div>

        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <img src={urlFotoDePerfil} alt="" class="userpic hidden lg:block xl:hidden h-[38px] w-[38px] rounded-full cursor-pointer z-20" on:click={toggleUserMenu}>

        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <img src={urlFotoDePerfil} alt="" class="hidden xl:block userpic h-[38px] w-[38px] rounded-full cursor-pointer z-20" on:click={() => {if (permisosList.includes("VisionPerfilPropio")) goto("/Perfil")}}>

        <div class="sep hidden lg:block w-[2px] min-w-[2px] h-[28px] bg-white"></div>
        
        {#if permisosList.includes("VisionEventos") || permisosList.includes("AdministracionDenunciasEventos")}
        <li>
            <span>Eventos</span>
            <menu>
                {#if permisosList.includes("VisionEventos")}
                    <li><a href="/Eventos">Eventos</a></li>
                    <li><a href="/MisEventos">Mis Eventos</a></li>
                    <li><a href="/MisSuperEventos">Mis Supereventos</a></li>
                {/if}
                {#if permisosList.includes("AdministracionDenunciasEventos")}
                    <li><a href="/AdministrarDenunciasEventos">Denuncias</a></li>
                {/if}
            </menu>
        </li>
        {/if}

        {#if permisosList.includes("VisionEspacios") || permisosList.includes("SolicitudEspaciosPublicos") || permisosList.includes("AdministracionEspaciosPublicos")}
		<li>
            <span>Espacios</span>
            <menu>
                {#if permisosList.includes("VisionEspacios")}
                    <li><a href="/Espacios">Espacios</a></li>
                    <li><a href="/MisEspacios">Mis Espacios</a></li>
                {/if}
                {#if permisosList.includes("SolicitudEspaciosPublicos")}
                    <li><a href="/SolicitarEspacioPublico">Solicitar Espacio Público</a></li>
                {/if}
                {#if permisosList.includes("AdministracionEspaciosPublicos")}
                    <li><a href="/SolicitudesEspaciosPublicos">Solicitudes de Espacio Público</a></li>
                {/if}
                {#if permisosList.includes("AdministracionEspaciosPrivados")}
                    <li><a href="/SolicitudesEspaciosPrivados">Solicitudes de Espacio Privado</a></li>
                {/if}
            </menu>
        </li>
        {/if}

        {#if permisosList.includes("AdministracionParametros") || 
            permisosList.includes("AdministracionMascota") || 
            permisosList.includes("AdministracionRoles") || 
            permisosList.includes("AdministracionRolesReservados") ||
            permisosList.includes("AdministracionUsuarios") || 
            permisosList.includes("AdministracionUsuariosAdministradores") ||
            permisosList.includes("RealizacionBackup") ||
            permisosList.includes("VisionLogUsuariosGrupos") || 
            permisosList.includes("VisionLogEventos") || 
            permisosList.includes("VisionLogEspacios") || 
            permisosList.includes("VisionLogPagos") || 
            permisosList.includes("VisionLogParametros")
        }
		<li>
            <span>Administración</span>
            <menu>
                {#if permisosList.includes("AdministracionParametros") || 
                    permisosList.includes("AdministracionMascota") || 
                    permisosList.includes("AdministracionRoles") || 
                    permisosList.includes("AdministracionRolesReservados")
                }
                    <li><a href="/AdministrarParametros">Parámetros</a></li>
                {/if}
                {#if permisosList.includes("AdministracionUsuarios") || 
                    permisosList.includes("AdministracionUsuariosAdministradores")
                }
                    <li><a href="/AdministrarUsuarios">Usuarios</a></li>
                    <li><a href="/AdministrarGrupos">Grupos</a></li>
                    <li><a href="/AdministrarDenunciasUsuarios">Denuncias a usuarios</a></li>
                {/if}
                {#if permisosList.includes("RealizacionBackup")}
                    <li><a href="/Backups">Copias de seguridad</a></li>
                {/if}
                {#if permisosList.includes("VisionLogUsuariosGrupos") || 
                    permisosList.includes("VisionLogEventos") || 
                    permisosList.includes("VisionLogEspacios") || 
                    permisosList.includes("VisionLogPagos") || 
                    permisosList.includes("VisionLogParametros")
                }
                    <li><a href="/Registros">Registros</a></li>
                {/if}
            </menu>
        </li>
        {/if}

        {#if permisosList.includes("VisionReportes") || permisosList.includes("VisionReportesGenerales")}
		    <li><a href="/Reportes">Reportes</a></li>
        {/if}

        <div class="sep hidden lg:block w-[2px] min-w-[2px] h-[28px] bg-white"></div>

        <!-- svelte-ignore a11y_invalid_attribute -->
        <li class="hidden lg:block"><a href="#" on:click={cerrarSesion}>Cerrar Sesión</a></li>
	</menu>

    
    
    <menu bind:this={userMenu} class="userMenu hidden bg-light items-end gap-2 text-s text-white font-bold p-s flex-col w-full print:hidden">
        <div class="flex flex-col gap-0 items-end leading-none">
            <span>{get(user)?.nombre} {get(user)?.apellido}</span>
            <span class="text-xs">@{get(username)}</span>
            <span class="commaList text-xs text-end">
                {#each get(user)?.roles as r}
                    <span>{r}</span>
                {/each}
            </span>
        </div>

        {#if permisosList.includes("VisionPerfilPropio")}
            <li>
                <a href="/Perfil">Ver mi perfil</a>
            </li>
        {/if}

        <!-- svelte-ignore a11y_invalid_attribute -->
        <li><a href="#" class="lg:hidden" on:click={cerrarSesion}>Cerrar Sesión</a></li>
    </menu>
</div>

<style>
#titlebar {
	width: 100vw;
	height: 60px;
    position: relative;
}

a {
    color: var(--color-white);
    text-decoration: none;
}

#titlebar img:not(.userpic) {
    height: 52px;
}

#titlebar>menu>li {
    white-space: nowrap;
}

#titlebar>menu {
    display: none;
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 10;
}

menu>li:hover>a {
    text-decoration: underline;
}

#titlebar>menu>li>span {
    display: none;
}

#titlebar>menu>li>span+menu {
    display: flex;
    flex-direction: column;
    align-items: end;
}

@media screen and (width >= 64rem) {

    #burger {
        display: none;
    }

    #titlebar>menu:not(.userMenu) {
        position: static;
        display: flex !important;
        z-index: 0;
    }

    #titlebar>menu>li {
        position: relative;
    }

    #titlebar>menu>li>span {
        display: inline;
        cursor: pointer;
    }

    #titlebar>menu>li>span+menu {
        display: none;
    }

    

    #titlebar>menu>li menu {
        display: none;
        position: absolute;
        top: 100%;
        right: -12px;
        z-index: 10;
        background-color: var(--color-light);
    }

    #titlebar>menu>li:hover menu {
        display: flex;
        padding: 12px;
    }
}

</style>