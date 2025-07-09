<script lang="ts">

let menu : HTMLElement;
let toggleMenu = () => {
    let display = menu.style.display;

    if (display === "flex") {
        menu.style.display = "none";
        return;
    }
    menu.style.display = "flex";
}

    
    
</script>


<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div id="titlebar" class="flex items-center justify-between p-none bg-light">
    <div class="flex items-baseline h-full p-1">
        <img src="logo.png" alt="Logo" class="object-contain"/>
        <a href="/" class="text-xl font-bold text-white">evtnet</a>
    </div>

    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <img on:click={toggleMenu} id="burger" src="icons/menu.png" alt="Logo" class="icon-white object-contain cursor-pointer"/>
	<menu bind:this={menu} class="bg-light flex items-end lg:gap-2 cursor-pointer text-s text-white font-bold p-s flex-col w-full lg:flex-row lg:justify-end lg:w-fit">
		<li><a href="./IniciarSesion">Iniciar Sesión</a></li>
		<li>
            <span>Eventos</span>
            <menu>
                <li><a href="./Eventos">Eventos</a></li>
                <li><a href="./MisEventos">Mis Eventos</a></li>
                <li><a href="./MisSuperEventos">Mis Supereventos</a></li>
            </menu>
        </li>
		<li>
            <span>Espacios</span>
            <menu>
                <li><a href="./Espacios">Espacios</a></li>
                <li><a href="./MisEspacios">Mis Espacios</a></li>
                <li><a href="./SolicitarEspacioPublico">Solicitar Espacio Público</a></li>
            </menu>
        </li>
		<li><a href="./Administracion">Administración</a></li>
		<li><a href="./Reportes">Reportes</a></li>
		<li><a href="./Registros">Registros</a></li>
		<li><a href="./MiPerfil">Mi Perfil</a></li>
	</menu>
</div>

<style>
#titlebar {
	width: 100vw;
	height: 60px;
    position: relative;
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