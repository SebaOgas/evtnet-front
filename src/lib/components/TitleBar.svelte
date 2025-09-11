<script lang="ts">
	import { afterNavigate, goto } from "$app/navigation";
	import { permisos, token, username } from "$lib/stores";
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
    }

    function cerrarSesion() {
        token.set("");
        permisos.set([]);
        username.set("");
        goto("/");
    }

    afterNavigate(() => {
        menu.style.display = "none";
    })

    $: permisosList = [] as string[];

    onMount(() => {
        permisosList = get(permisos);
    })
</script>


<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div id="titlebar" class="flex items-center justify-between p-none bg-light">
    <div class="flex items-baseline h-full p-1">
        <img src="/logo.png" alt="Logo" class="object-contain"/>
        <a href="/" class="text-xl font-bold text-white">evtnet</a>
    </div>

    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <img on:click={toggleMenu} id="burger" src="/icons/menu.png" alt="Logo" class="icon-white object-contain cursor-pointer"/>
	<menu bind:this={menu} class="bg-light flex items-end lg:gap-2 cursor-pointer text-s text-white font-bold p-s flex-col w-full lg:flex-row lg:justify-end lg:w-fit">		
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
            </menu>
        </li>
        {/if}

        {#if permisosList.includes("AdministracionParametros") || 
            permisosList.includes("AdministracionMascota") || 
            permisosList.includes("AdministracionRoles") || 
            permisosList.includes("AdministracionRolesReservados") ||
            permisosList.includes("AdministracionUsuarios") || 
            permisosList.includes("AdministracionUsuariosAdministradores") ||
            permisosList.includes("RealizacionBackup")
        }
		<li>
            <span>Administración</span>
            <menu>
                {#if permisosList.includes("AdministracionParametros") || 
                    permisosList.includes("AdministracionMascota") || 
                    permisosList.includes("AdministracionRoles") || 
                    permisosList.includes("AdministracionRolesReservados")
                }
                    <li><a href="/">Parámetros</a></li>
                {/if}
                {#if permisosList.includes("AdministracionUsuarios") || 
                    permisosList.includes("AdministracionUsuariosAdministradores")
                }
                    <li><a href="/AdministrarUsuarios">Usuarios</a></li>
                    <li><a href="/AdministrarGrupos">Grupos</a></li>
                    <li><a href="/AdministrarDenunciasUsuarios">Denuncias a usuarios</a></li>
                {/if}
                {#if permisosList.includes("RealizacionBackup")}
                    <li><a href="/">Copias de seguridad</a></li>
                {/if}
            </menu>
        </li>
        {/if}

        {#if permisosList.includes("VisionReportes") || permisosList.includes("VisionReportesGenerales")}
		    <li><a href="/Reportes">Reportes</a></li>
        {/if}

        {#if permisosList.includes("VisionLogUsuariosGrupos") || 
            permisosList.includes("VisionLogEventos") || 
            permisosList.includes("VisionLogEspacios") || 
            permisosList.includes("VisionLogPagos") || 
            permisosList.includes("VisionLogParametros")
        }
		    <li><a href="/Registros">Registros</a></li>
        {/if}

        {#if permisosList.includes("VisionPerfilPropio")}
		    <li><a href="/Perfil">Mi Perfil</a></li>
        {/if}

        <!-- svelte-ignore a11y_invalid_attribute -->
        <li><a href="#" on:click={cerrarSesion}>Cerrar Sesión</a></li>
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

#titlebar img {
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

    #titlebar>menu {
        position: static;
        display: flex !important;
        z-index: 0;
    }

    #titlebar>menu>li {
        position: relative;
    }

    #titlebar>menu>li>span {
        display: inline;
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