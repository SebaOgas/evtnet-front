<script lang="ts">
	import Button from "$lib/components/Button.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import MapDisplay from "$lib/components/MapDisplay.svelte";
	import { token, permisos, username } from "$lib/stores";
	import { onMount, tick } from "svelte";
	import { get } from "svelte/store";
	import { page } from "$app/state"
	import { goto, afterNavigate, invalidateAll } from '$app/navigation';
	import { base } from '$app/paths'
	import { HttpError } from "$lib/request/request";
	import { EventosService } from "$lib/services/EventosService";
	import { UsuariosService } from "$lib/services/UsuariosService";
	import { formatDate } from "$lib/components/DatePicker.svelte";
	import type DTOEvento from "$lib/dtos/eventos/DTOEvento";
	import Popup from "$lib/components/Popup.svelte";
	import PopupCalificarUsuario from "$lib/components/PopupCalificarUsuario.svelte";
	import TextField from "$lib/components/TextField.svelte";

	let previousPage: string = base;

	afterNavigate(({from}) => {
		previousPage = from?.url.pathname || previousPage
	});

	$: errorPermiso = false;

	$: id = Number(page.params.id);

	$: listo = false;

	$: data = {
		nombre: "",
		descripcion: "",
		fechaHoraInicio: new Date(),
		fechaHoraFin: new Date(),
		precioBase: 0,
		precioTotal: 0,
		disciplinas: [],
		espacio: {
			id: 0,
			nombre: "",
			direccion: "",
			latitud: 0,
			longitud: 0
		},
		subespacio: {
			id: 0,
			nombre: "",
			descripcion: ""
		},
		estado: "",
		motivoCancelacion: "",
		cupoLleno: false,
		superevento: undefined,
		inscripto: false,
		inscriptos: [],
		administrador: false,
    	organizador: false,
        idChat: null
	} as DTOEvento;

	$: errorGenerico = ""
	$: errorGenericoVisible = false

	$: inscriptosConFoto = [] as {username: string, nombre: string, apellido: string, fotoUrl: string}[]

	$: permisoCancelacionAdmin = false;

	let mount = async () => {
		cancelarInscripcionPopupVisible = false;
		desinscripcionExitosa = false;
		cancelacionExitosa = false;
		listo = false;
		inscriptosConFoto = [];
		
		if (get(token) === "") {
			goto("/");
		}

		if(!get(permisos).includes("VisionEventos")) {
			errorPermiso = true;
			return;
		}

		if (get(permisos).includes("CancelacionEventosAdmin")) {
			permisoCancelacionAdmin = true;
		}

		try {
			data = await EventosService.obtenerEvento(id);
            listo = true;
			
			// Load profile photos for inscriptos
			for (let inscripto of data.inscriptos) {
				try {
					let fotoUrl = await UsuariosService.obtenerFotoDePerfil(inscripto.username);
					inscriptosConFoto.push({
						...inscripto,
						fotoUrl: fotoUrl
					});
				} catch (e) {
					// Use placeholder if photo fails to load
					inscriptosConFoto.push({
						...inscripto,
						fotoUrl: "/icons/placeholder.png"
					});
				}
			}
			inscriptosConFoto = [...inscriptosConFoto];

		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}            
		}
	}

	onMount(mount);

	function formatDateTime(date: Date): string {
		return formatDate(date, true);
	}

	$: cancelarInscripcionPopupVisible = false;
	$: montoDevolucion = 0;

	async function showPopupCancelarInscripcion() {
		try {
			montoDevolucion = await EventosService.obtenerMontoDevolucionCancelacionInscripcion(id, get(username))
			cancelarInscripcionPopupVisible = true;
		} catch (e) {
			if (e instanceof HttpError) {
				errorGenerico = e.message;
				errorGenericoVisible = true;
			}    
		}
	}

	$: errorDesinscripcion = ""
	$: errorDesinscripcionVisible = false;
	$: desinscripcionExitosa = false;

	async function desincribirse() {
		try {
			await EventosService.desinscribirse(id)
			desinscripcionExitosa = true
		} catch (e) {
			if (e instanceof HttpError) {
				errorDesinscripcion = e.message;
				errorDesinscripcionVisible = true;
			}    
		}
	}

	$: popupCancelarEventoVisible = false;
	$: motivoCancelacionEvento = "";
	$: errorCancelacion = ""
	$: errorCancelacionVisible = false
	$: cancelacionExitosa = false;

	function validateMotivoCancelacion(val: string) {
		if (val.length > 500) {
			return { valid: false, reason: "El motivo de cancelación no puede tener más de 500 caracteres" };
		}
		return { valid: true, reason: undefined };
	}

	async function cancelarEvento() {
		try {
			await EventosService.cancelarEvento(id, motivoCancelacionEvento);
			cancelacionExitosa = true;
		} catch (e) {
			if (e instanceof HttpError) {
				errorCancelacion = e.message;
				errorCancelacionVisible = true;
			}
		}
		popupCancelarEventoVisible = false;
	}

	let popupCalificarVisible = false;
	let usernameCalificar : string | null = null;
</script>

<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-s text-center">
			Evento
		</h1>
        {#if listo}
            <h1 class="text-m text-center">
                {data.nombre}
            </h1>

			{#if data.estado === "Cancelado"}
				<div class="text-center text-orange">Cancelado</div>
			{/if}
            
            <p class="text-xs">
                {data.descripcion}
            </p>

            <div class="md:flex justify-start items-center">
                <span class="text-s">Horario:</span>
                <div class="ml-4 flex flex-col justify-start items-center md:flex-row md:justify-center md:gap-2">
                    <div>{formatDateTime(data.fechaHoraInicio)}</div>
                    <div>a</div>
                    <div>{formatDateTime(data.fechaHoraFin)}</div>
                </div>
            </div>

            <div>
                <span class="text-s">Precio de inscripción:</span>
                <span class="text-xs">${("" + data.precioTotal.toFixed(2)).replace(".", ",")}</span>
            </div>

            {#if data.disciplinas.length > 0}
                <div class="mb-2 mt-2 flex flex-col gap-2 md:flex-row md:items-baseline">
                    <span class="text-s">Disciplinas:</span>
                    <div class="commaList">
                        {#each data.disciplinas as disciplina}
                            <span>{disciplina}</span>
                        {/each}
                    </div>
                </div>
            {/if}

            {#if data.espacio}
                <div>
                    <div class="flex justify-start items-center gap-2">
                        <span class="text-s">Espacio</span>
                        <Button action={() => {goto(`/Espacio/${data.espacio?.id}`)}}>Ver Espacio</Button>
                    </div>
                    <div class="text-xs">{data.espacio.nombre}</div>
                </div>
            {/if}

            <div class="flex flex-col gap-2 md:flex-row md:items-baseline">
                <span class="text-s">Dirección:</span>
                <span class="text-xs">{data.espacio.direccion}</span>
            </div>

            {#if listo && data.espacio.latitud !== undefined && data.espacio.longitud !== undefined}
                <div class="mb-2 mt-2">
                    <span class="text-s">Ubicación:</span>
                    <MapDisplay 
                        latitude={data.espacio.latitud} 
                        longitude={data.espacio.longitud} 
                        marked={{x: data.espacio.latitud, y: data.espacio.longitud}} 
                        zoom={14} 
                        disableMarking
                    />
                </div>
            {/if}

            {#if data.superevento}
                <div>
                    <div class="flex justify-start items-center gap-2">
                        <span class="text-s">Superevento</span>
                        <Button action={() => {goto(`/SuperEvento/${data.superevento?.id}`)}}>Ver Superevento</Button>
                    </div>
                    <div class="text-xs">{data.superevento.nombre}</div>
                </div>
            {/if}

            {#if inscriptosConFoto.length > 0}
                <div class="mb-2 mt-2">
                    <span class="text-s">Inscriptos:</span>
                    <div class="flex flex-col gap-2 mt-2">
                        {#each inscriptosConFoto as inscripto}
                            <div class="flex items-center gap-2">
                                <!-- svelte-ignore a11y_click_events_have_key_events -->
                                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                                <img src={inscripto.fotoUrl} alt="Foto de perfil" class="h-[40px] w-[40px] rounded-full object-cover cursor-pointer" on:click={() => {goto(`/Perfil/${inscripto.username}`)}}>
                                <div class="flex flex-col">
                                    <span class="text-xs font-bold">{inscripto.nombre} {inscripto.apellido}</span>
                                    <span class="text-xs text-black">{inscripto.username}</span>
                                </div>
                                <Button icon="/icons/white_star.svg" action={() => {usernameCalificar = inscripto.username; popupCalificarVisible = true;}}/>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}

			{#if data.estado === "Cancelado"}
                <div>
                    <div class="flex justify-start items-center gap-2">
                        <span class="text-s">Motivo de cancelación</span>
                    </div>
                    <div class="text-xs">{data.motivoCancelacion}</div>
                </div>
            {/if}

			{#if !data.inscripto && data.cupoLleno}
				<div class="text-orange">No puede inscribirse, dado que se llenó el cupo de participantes</div>
			{/if}
        {/if}
	</div>

	<div class="flex flex-row flex-wrap gap-2 h-fit p-2 justify-center items-center">
		<Button action={() => {goto(previousPage)}}>Atrás</Button>
		
		{#if data.estado === "Aceptado"}
			{#if data.inscripto}
				<Button action={showPopupCancelarInscripcion}>Cancelar inscripción</Button>
			{:else}
				{#if !data.cupoLleno && new Date(data.fechaHoraInicio) >  new Date()}
					<Button action={() => {goto(`${page.url.pathname}/Inscribirme`)}}>Inscribirme</Button>
				{/if}
			{/if}
		{/if}
	
		{#if data.inscripto}
			<Button action={() => {goto(`${page.url.pathname}/Denunciar`)}}>Denunciar evento</Button>
		{/if}

		{#if data.estado === "Aceptado"}
			{#if data.administrador}
				<Button action={() => {goto(`${page.url.pathname}/Administrar`)}}>Administrar</Button>
			{/if}
		{/if}

        <Button icon="/icons/share.svg"></Button>

        {#if data.administrador || data.inscripto}
			<Button icon="/icons/chat.svg" action={() => {goto(`/Chat/${data.idChat}`)}}></Button>
		{/if}

		{#if (data.organizador || permisoCancelacionAdmin) && (data.estado === "En Revisión" || data.estado === "Aceptado")}
			<Button action={() => {popupCancelarEventoVisible = true}}>Cancelar evento</Button>
		{/if}
	</div>
</div>

<PopupError bind:visible={errorPermiso}>
	No tiene permiso para acceder a este evento.
</PopupError>

<PopupError bind:visible={errorGenericoVisible}>
	{errorGenerico}
</PopupError>

<Popup bind:visible={cancelarInscripcionPopupVisible} fitW fitH title={"Cancelar inscripción"}>
	<p>¿Está seguro de que desea cancelar su inscripción?</p>
	{#if montoDevolucion !== 0}
		<p>Se le devolverá ${montoDevolucion.toFixed(2).replaceAll(".", ",")}</p>
	{/if}
	<div class="flex flex-row justify-center gap-2">
		<Button action={() => {cancelarInscripcionPopupVisible = false;}}>Cancelar</Button>
		<Button action={desincribirse}>Confirmar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorDesinscripcionVisible}>
	No se pudo desinscribir correctamente por: {errorDesinscripcion}
</PopupError>

<Popup bind:visible={desinscripcionExitosa} title={"Éxito"} fitW fitH>
	<p>La desinscripción se realizó correctamente</p>
	<div class="flex flex-row justify-center gap-2">
		<Button action={mount}>Aceptar</Button>
	</div>
</Popup>

<Popup bind:visible={popupCancelarEventoVisible} fitH fitW title="Cancelar evento">
	<p>¿Está seguro de que desea cancelar el evento?</p>
	<p>Se devolverá el monto pagado a los inscriptos, pero no recuperará lo pagado al espacio. Esta acción es irreversible.</p>
	<TextField 
			label="Motivo" 
			multiline 
			bind:value={motivoCancelacionEvento} 
			validate={validateMotivoCancelacion}
			rows={6}
			max={500}
		/>
	<div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {popupCancelarEventoVisible = false}}>Cancelar</Button>
		<Button action={cancelarEvento}>Confirmar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorCancelacionVisible}>
	{errorCancelacion}
</PopupError>

<Popup bind:visible={cancelacionExitosa} title={"Éxito"} fitW fitH>
	<p>El evento fue cancelado exitosamente</p>
	<div class="flex flex-row justify-center gap-2">
		<Button action={mount}>Aceptar</Button>
	</div>
</Popup>

<PopupCalificarUsuario bind:visible={popupCalificarVisible} bind:username={usernameCalificar}/>