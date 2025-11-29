<script lang="ts">
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import type DTOMensajeResponse from "$lib/dtos/chat/DTOMensajeResponse";
	import { CompatClient, Stomp } from "@stomp/stompjs";
	import SockJS from "sockjs-client";
	import { onMount, onDestroy } from "svelte";
	import { token, username } from "$lib/stores";
	import { get } from "svelte/store";
	import Button from "$lib/components/Button.svelte";
	import { formatDate } from "$lib/components/DatePicker.svelte";
	import { ChatsService } from "$lib/services/ChatsService";
	import type DTOChatResponse from "$lib/dtos/chat/DTOChatResponse";
	import TextField from "$lib/components/TextField.svelte";
	import { UsuariosService } from "$lib/services/UsuariosService";
	import PopupError from "$lib/components/PopupError.svelte";
	import { HttpError } from "$lib/request/request";

	const id: number = parseInt(page.params.id === undefined ? "0" : page.params.id);

	let stompClient: CompatClient | null = null;
	let mensajes: DTOMensajeResponse[] = [];
	let nuevoMensaje = "";
	let messagesContainer: HTMLDivElement;
	let nombreEvento = "Nombre del Evento"; // TODO: Fetch event name

	$: chat = null as DTOChatResponse | null;
	
	const jwtToken = get(token);

	function connect() {
		const socket = new SockJS("http://localhost:8080/ws");
		stompClient = Stomp.over(socket);

		stompClient.connect({Authorization: `Bearer ${jwtToken}`}, function (frame: string) {
			if (stompClient === null) return;

			stompClient.subscribe("/topic/chat/" + id, function (msg) {
				const body: DTOMensajeResponse = JSON.parse(msg.body);
				mensajes = [...mensajes, body];
				scrollToBottom();
			});
		});
	}

	function disconnect() {
		if (stompClient !== null) {
			stompClient.disconnect();
		}
	}

	function sendMessage() {        
		if (!nuevoMensaje.trim() || stompClient === null) return;

		stompClient.send(
			"/app/chat.send",
			{Authorization: `Bearer ${jwtToken}`},
			JSON.stringify({
				chatId: id,
				texto: nuevoMensaje
			})
		);

		nuevoMensaje = "";
	}

	function scrollToBottom() {
		setTimeout(() => {
			if (messagesContainer) {
				messagesContainer.scrollTop = messagesContainer.scrollHeight;
			}
		}, 100);
	}

	function isOwnMessage(msgUsername: string) {
		return msgUsername === get(username);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	$: errorVisible = false;
	$: error = "";

	onMount(async () => {
		if (get(token) === "") {
			goto("/");
			return;
		}
		try {
			chat = await ChatsService.obtenerDetalle(id);
			mensajes = await ChatsService.obtenerMensajesDeChat(id);
			connect();
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
	});

	onDestroy(() => {
		disconnect();
	});


	function escapeHtml(text:string) {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}
	
	function formatMessage(text: string) {
		const urlRegex = /(https?:\/\/[^\s<]+)/g;
		return escapeHtml(text)
			.replace(urlRegex, '<a href="$1" rel="noopener noreferrer" class="!text-white">$1</a>')
			.replaceAll("\n", "<br/>");
	}
</script>

{#if chat !== null}
<div id="content">
	<div class="text-xs flex flex-col overflow-y-auto grow">
		<h1 class="text-s bg-light text-white p-2 font-bold">
			{#if chat.tipo === "GRUPAL"}
				Chat: {chat.nombreGrupo}
			{:else if chat.tipo === "DIRECTO"}
				Chat con {chat.usuarioNombre} {chat.usuarioApellido}
			{:else if chat.tipo ==="ESPACIO"}
				Chat: {chat.nombreEspacio}
			{:else if chat.tipo === "EVENTO"}
				Chat: {chat.nombreEvento}
			{:else if chat.tipo === "SUPEREVENTO"}
				Chat: {chat.nombreSuperEvento}
			{/if}
		</h1>

		<div 
			bind:this={messagesContainer}
			class="flex flex-col gap-3 overflow-y-auto grow  bg-[#00b2cabb] p-2"
		>
			{#each mensajes as mensaje}
				{#if isOwnMessage(mensaje.username)}
					<!-- Own messages (right) -->
					<div class="flex justify-end">
						<div class="bg-dark text-white rounded-lg p-2 max-w-[70%] rounded-tr-none">
							<p class="break-words text-xs">{@html formatMessage(mensaje.texto)}</p>
							<p class="text-[10px] text-white text-right">
								{formatDate(mensaje.fechaHora, true)}
							</p>
						</div>
						<div class="bg-dark h-4 grow-0 aspect-square rounded-br-full"></div>
					</div>
				{:else}
					<!-- Other users' messages (left) -->
					<div class="flex w-full">
						<div class="bg-dark h-4 grow-0 aspect-square rounded-bl-full"></div>
						<div class="flex gap-2 bg-dark rounded-lg rounded-tl-none">
							{#if chat.tipo !== "DIRECTO"}
							<div class="flex-shrink-0">
								<div class="rounded-full flex items-center justify-center">
									{#await UsuariosService.obtenerFotoDePerfil(mensaje.username)}
										<!-- svelte-ignore a11y_click_events_have_key_events -->
										<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
										<img src="/icons/placeholder.png" alt="Foto de perfil" class="h-[40px] w-[40px] rounded-full object-cover cursor-pointer" on:click={() => {goto(`/Perfil/${mensaje.username}`)}}>
									{:then url}
										<!-- svelte-ignore a11y_click_events_have_key_events -->
										<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
										<img src={url} alt="Foto de perfil" class="h-[40px] w-[40px] rounded-full object-cover cursor-pointer" on:click={() => {goto(`/Perfil/${mensaje.username}`)}}>
									{/await}
								</div>
							</div>
							{/if}
							<div>
								<div class="text-white 2 max-w-full p-1">
									{#if chat.tipo !== "DIRECTO"}
									<p class="text-orange font-semibold text-xs">
										{mensaje.usuarioNombre} {mensaje.usuarioApellido}
									</p>
									{/if}
									<p class="break-words text-xs">{@html formatMessage(mensaje.texto)}</p>
									<p class="text-[10px] text-white text-right">
										{formatDate(mensaje.fechaHora, true)}
									</p>
								</div>
							</div>
						</div>
					</div>
					
				{/if}
			{/each}
		</div>
	</div>

	<div class="flex gap-2 h-fit p-2 justify-center items-end md:justify-start bg-light">
		<TextField
			bind:value={nuevoMensaje}
			label={null}
			placeholder="Escriba un mensaje..."
			classes="grow [&>textarea]:bg-white [&>textarea]:border-0 text-s !m-0"
			action={sendMessage}
			wrap
			rows={4}
			max={1000}
		/>
		<Button 
			icon="/icons/arrow-right.svg" 
			action={sendMessage} 
			classes="aspect-square box-border h-[30px] border-2 border-white disabled:bg-dark disabled:[&_img]:!filter-none"
			disabled={nuevoMensaje.trim() === ""}>
		</Button>
	</div>
</div>
{/if}

<PopupError bind:visible={errorVisible}>
	{error}
</PopupError>