<script lang="ts">
	import Popup from "./Popup.svelte";
	import Button from "./Button.svelte";
	import { goto } from "$app/navigation";
	import type DTOUsuarioCompleto from "$lib/dtos/usuarios/DTOUsuarioCompleto";
	import { UsuariosService } from "$lib/services/UsuariosService";
	import { HttpError } from "$lib/request/request";
	import { formatDate } from "./DatePicker.svelte";
	import { Capacitor } from "@capacitor/core";

	import type DTOEventosUsuario from "$lib/dtos/usuarios/DTOEventosUsuario";
	import type DTOEspaciosUsuario from "$lib/dtos/usuarios/DTOEspaciosUsuario";
	import type DTOSupereventosUsuario from "$lib/dtos/usuarios/DTOSupereventosUsuario";
	import type DTOGruposUsuario from "$lib/dtos/usuarios/DTOGruposUsuario";
	import type DTOInteraccionesUsuario from "$lib/dtos/usuarios/DTOInteraccionesUsuario";
    
	import PopupAdminUsuario from "$lib/components/PopupAdminUsuario.svelte";
	import PopupError from "./PopupError.svelte";
	import PopupAdminGrupo from "./PopupAdminGrupo.svelte";

    function redir(url: string) {
        if (Capacitor.getPlatform() === "web") {
            window.open(url)
        } else {
            goto(url)
        }
    }

    export let username : string | null = null;

    $: error = "";
	$: errorVisible = false;


    let eventosVisibles : boolean = false;
    let espaciosVisibles : boolean = false;
    let supereventosVisibles : boolean = false;
    let gruposVisibles : boolean = false;
    let interaccionesVisibles : boolean = false;

    let usuario : DTOUsuarioCompleto | null = null;
    $: urlFotoDePerfil = "/icons/placeholder.png"

    $: (async () => {
        if (username === null) return;
        try {
            usuario = await UsuariosService.adminObtenerUsuarioCompleto(username);
            urlFotoDePerfil = await UsuariosService.obtenerFotoDePerfil(username);
        } catch (e) {
            if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
        }
    })()

    let eventos : DTOEventosUsuario | null = null;
    $: (async () => {
        if (username === null || eventosVisibles === false) return;
        try {
            eventos = await UsuariosService.adminObtenerEventosUsuario(username);
        } catch (e) {
            if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
        }
    })()

    let espacios : DTOEspaciosUsuario | null = null;
    $: (async () => {
        if (username === null || espaciosVisibles === false) return;
        try {
            espacios = await UsuariosService.adminObtenerEspaciosUsuario(username);
        } catch (e) {
            if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
        }
    })()

    let supereventos : DTOSupereventosUsuario | null = null;
    $: (async () => {
        if (username === null || supereventosVisibles === false) return;
        try {
            supereventos = await UsuariosService.adminObtenerSupereventosUsuario(username);
        } catch (e) {
            if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
        }
    })()

    let grupos : DTOGruposUsuario | null = null;
    $: (async () => {
        if (username === null || gruposVisibles === false) return;
        try {
            grupos = await UsuariosService.adminObtenerGruposUsuario(username);
        } catch (e) {
            if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
        }
    })()

    let interacciones : DTOInteraccionesUsuario | null = null;
    $: (async () => {
        if (username === null || interaccionesVisibles === false) return;
        try {
            interacciones = await UsuariosService.adminObtenerInteraccionesUsuario(username);
        } catch (e) {
            if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
        }
    })()


    let subUsername : string | null = null;
    let subGrupo : number | null = null;

</script>

{#if usuario !== null}
<Popup title={"Detalle de usuario"} visible={username !== null} fitH={true} fitW={true}>
    <div class="flex flex-col md:flex-row justify-start items-start w-full gap-12">
        <div class="flex justify-center items-center w-full md:w-fit">
            <img src={urlFotoDePerfil} alt="Foto de perfil" class="h-[200px] min-h-[200px] w-[200px] min-w-[200px]">
        </div>
        <div class="flex flex-col gap-2 w-full">
            <span>Apellido y nombre: {usuario.apellido}, {usuario.nombre}</span>
            <span>Correo electrónico: {usuario.mail}</span>
            <span>Nombre de usuario: {usuario.username}</span>
            <span>DNI: {usuario.dni}</span>
            <span>Fecha de nacimiento: {formatDate(usuario.fechaNacimiento)}</span>
            <span>Alta: {formatDate(usuario.alta)}</span>
            <span>Baja: {formatDate(usuario.baja)}</span>
            <span>Roles:
                <span class="commaList">
                    {#each usuario.roles as r}
                        <span>{r}</span>
                    {/each}
                </span>
            </span>
        </div>
    </div>
    <div class="flex justify-center items-center w-full gap-2 mb-2 mt-2 flex-wrap">
        <Button action={() => eventosVisibles = true}>Eventos</Button>
        <Button action={() => espaciosVisibles = true}>Espacios</Button>
        <Button action={() => supereventosVisibles = true}>Supereventos</Button>
        <Button action={() => gruposVisibles = true}>Grupos</Button>
        <Button action={() => interaccionesVisibles = true}>Interacciones</Button>
    </div>
    <div class="flex justify-center items-center w-full gap-2">
        <Button action={() => {username = null}}>Cerrar</Button>
        <Button action={() => {redir(`/Perfil/${username}`)}}>Visitar perfil</Button>
    </div>
</Popup>


    {#if eventos !== null}
    <Popup title={`Eventos de ${usuario.apellido}, ${usuario.nombre} (@${usuario.username})`} bind:visible={eventosVisibles} fitH={true} fitW={true}>
        <div class="flex flex-col md:flex-row justify-start items-start w-full gap-12">
            <div class="flex flex-col gap-2 w-full">
                <strong>Organizador</strong>
                {#each eventos.organizador as ev}
                    <div class="flex flex-col gap-0 w-full">
                        <div class="flex justify-between items-center w-full">
                            <span>{ev.nombre}</span>
                            <Button icon="/icons/arrow-right.svg" action={()=>redir(`/Evento/${ev.id}`)}></Button>
                        </div>
                        <span class="ml-4">({formatDate(ev.fechaDesde, true)} - {formatDate(ev.fechaHasta, true)})</span>
                    </div>
                {/each}
            </div>
            <div class="flex flex-col gap-2 w-full">
                <strong>Administrador</strong>
                {#each eventos.administrador as ev}
                    <div class="flex flex-col gap-0 w-full">
                        <div class="flex justify-between items-center w-full">
                            <span>{ev.nombre}</span>
                            <Button icon="/icons/arrow-right.svg" action={()=>redir(`/Evento/${ev.id}`)}></Button>
                        </div>
                        <span class="ml-4">({formatDate(ev.fechaDesde, true)} - {formatDate(ev.fechaHasta, true)})</span>
                        {#each ev.periodos as periodo}
                            <span class="ml-4">Entre {formatDate(periodo.desde, true)} y {formatDate(periodo.hasta, true)}</span>
                        {/each}
                    </div>
                {/each}
            </div>
            <div class="flex flex-col gap-2 w-full">
                <strong>Participante</strong>
                {#each eventos.participante as ev}
                    <div class="flex flex-col gap-0 w-full">
                        <div class="flex justify-between items-center w-full">
                            <span>{ev.nombre}</span>
                            <Button icon="/icons/arrow-right.svg" action={()=>redir(`/Evento/${ev.id}`)}></Button>
                        </div>
                        <span class="ml-4">({formatDate(ev.fechaDesde, true)} - {formatDate(ev.fechaHasta, true)})</span>
                    </div>
                {/each}
            </div>
        </div>
        <div class="flex justify-center items-center w-full gap-2">
            <Button action={() => {eventosVisibles = false}}>Atrás</Button>
        </div>
    </Popup>
    {/if}



    {#if espacios !== null}
    <Popup title={`Espacios de ${usuario.apellido}, ${usuario.nombre} (@${usuario.username})`} bind:visible={espaciosVisibles} fitH={true} fitW={true}>
        <div class="flex flex-col md:flex-row justify-start items-start w-full gap-12">
            <div class="flex flex-col gap-2 w-full">
                <strong>Propietario</strong>
                {#each espacios.propietario as ev}
                    <div class="flex flex-col gap-0 w-full">
                        <div class="flex justify-between items-center w-full">
                            <span>{ev.nombre}</span>
                            <Button icon="/icons/arrow-right.svg" action={()=>redir(`/Espacio/${ev.id}`)}></Button>
                        </div>
                        <span class="ml-4">({formatDate(ev.fechaDesde, true)} - {formatDate(ev.fechaHasta, true)})</span>
                    </div>
                {/each}
            </div>
            <div class="flex flex-col gap-2 w-full">
                <strong>Administrador</strong>
                {#each espacios.administrador as ev}
                    <div class="flex flex-col gap-0 w-full">
                        <div class="flex justify-between items-center w-full">
                            <span>{ev.nombre}</span>
                            <Button icon="/icons/arrow-right.svg" action={()=>redir(`/Espacio/${ev.id}`)}></Button>
                        </div>
                        <span class="ml-4">({formatDate(ev.fechaDesde, true)} - {formatDate(ev.fechaHasta, true)})</span>
                        {#each ev.periodos as periodo}
                            <span class="ml-4">Entre {formatDate(periodo.desde, true)} y {formatDate(periodo.hasta, true)}</span>
                        {/each}
                    </div>
                {/each}
            </div>
        </div>
        <div class="flex justify-center items-center w-full gap-2">
            <Button action={() => {espaciosVisibles = false}}>Atrás</Button>
        </div>
    </Popup>
    {/if}



    {#if supereventos !== null}
    <Popup title={`Supereventos de ${usuario.apellido}, ${usuario.nombre} (@${usuario.username})`} bind:visible={supereventosVisibles} fitH={true} fitW={true}>
        <div class="flex flex-col md:flex-row justify-start items-start w-full gap-12">
            <div class="flex flex-col gap-2 w-full">
                <strong>Organizador</strong>
                {#each supereventos.organizador as ev}
                    <div class="flex flex-col gap-0 w-full">
                        <div class="flex justify-between items-center w-full">
                            <span>{ev.nombre}</span>
                            <Button icon="/icons/arrow-right.svg" action={()=>{redir(`/SuperEvento/${ev.id}`)}}></Button>
                        </div>
                        <span class="ml-4">({formatDate(ev.fechaDesde, true)} - {formatDate(ev.fechaHasta, true)})</span>
                    </div>
                {/each}
            </div>
            <div class="flex flex-col gap-2 w-full">
                <strong>Administrador</strong>
                {#each supereventos.administrador as ev}
                    <div class="flex flex-col gap-0 w-full">
                        <div class="flex justify-between items-center w-full">
                            <span>{ev.nombre}</span>
                            <Button icon="/icons/arrow-right.svg" action={()=>{redir(`/SuperEvento/${ev.id}`)}}></Button>
                        </div>
                        <span class="ml-4">({formatDate(ev.fechaDesde, true)} - {formatDate(ev.fechaHasta, true)})</span>
                        {#each ev.periodos as periodo}
                            <span class="ml-4">Entre {formatDate(periodo.desde, true)} y {formatDate(periodo.hasta, true)}</span>
                        {/each}
                    </div>
                {/each}
            </div>
        </div>
        <div class="flex justify-center items-center w-full gap-2">
            <Button action={() => {supereventosVisibles = false}}>Atrás</Button>
        </div>
    </Popup>
    {/if}



    {#if grupos !== null}
    <Popup title={`Grupos de ${usuario.apellido}, ${usuario.nombre} (@${usuario.username})`} bind:visible={gruposVisibles} fitH={true} fitW={true}>
        <div class="flex flex-col md:flex-row justify-start items-start w-full gap-12">
            <div class="flex flex-col gap-2 w-full">
                {#each grupos.grupos as ev}
                    <div class="flex flex-col gap-0 w-full">
                        <div class="flex justify-between items-center w-full">
                            <span>{ev.nombre}</span>
                            <Button icon="/icons/arrow-right.svg" action={()=>{subGrupo = ev.id}}></Button>
                        </div>
                        {#each ev.roles as rol}
                            <span class="ml-4">{rol.nombre}: {formatDate(rol.fechaDesde, true)} - {formatDate(rol.fechaHasta, true)}</span>
                        {/each}
                    </div>
                {/each}
            </div>
        </div>
        <div class="flex justify-center items-center w-full gap-2">
            <Button action={() => {gruposVisibles = false}}>Atrás</Button>
        </div>
    </Popup>
    {/if}



    {#if interacciones !== null}
    <Popup title={`Grupos de ${usuario.apellido}, ${usuario.nombre} (@${usuario.username})`} bind:visible={interaccionesVisibles} fitH={true} fitW={true}>
        <div class="flex flex-col md:flex-row justify-start items-start w-full gap-12">
            <div class="flex flex-col gap-2 w-full">
                {#each interacciones.interacciones as ev}
                    <div class="flex flex-col gap-0 w-full">
                        <div class="flex justify-between items-center w-full">
                            <span>{ev.nombre} ({ev.tipo})</span>
                            <Button icon="/icons/arrow-right.svg" 
                                action={()=>{
                                    switch(ev.tipo) {
                                        case "Evento":
                                            redir(`/Evento/${ev.id}`)
                                            return;
                                        case "Espacio":
                                            redir(`/Espacio/${ev.id}`)
                                            return;
                                        case "SuperEvento":
                                            redir(`/SuperEvento/${ev.id}`)
                                            return;
                                        case "Grupo":
                                            subGrupo = ev.id;
                                            return;
                                        case "Directo":
                                            if (ev.username === undefined) {
                                                error = "Se desconoce el usuario; no se pudo lograr la redirección.";
                                                errorVisible = true;
                                                return;
                                            }
                                            subUsername = ev.username;
                                            return;
                                        default:
                                            error = "Tipo de chat no válido";
                                            errorVisible = true;
                                    }
                                }}></Button>
                        </div>
                        <span class="ml-4">({formatDate(ev.fechaDesde, true)} - {formatDate(ev.fechaHasta, true)})</span>
                    </div>
                {/each}
            </div>
        </div>
        <div class="flex justify-center items-center w-full gap-2">
            <Button action={() => {interaccionesVisibles = false}}>Atrás</Button>
        </div>
    </Popup>
    {/if}

    <PopupAdminUsuario bind:username={subUsername}/>
    <PopupAdminGrupo bind:id={subGrupo}/>

{/if}

<PopupError bind:visible={errorVisible}>
    {error}
</PopupError>