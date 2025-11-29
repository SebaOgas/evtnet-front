<script lang="ts">
	import Popup from "./Popup.svelte";
	import Button from "./Button.svelte";
	import { goto } from "$app/navigation";
	import TextField from "./TextField.svelte";
	import type DTOChatResponse from "$lib/dtos/chat/DTOChatResponse";
	import { ChatsService } from "$lib/services/ChatsService";
	import { onMount } from "svelte";
	import { HttpError } from "$lib/request/request";
	import PopupError from "./PopupError.svelte";

    export let visible : boolean;

    export let url : string = "";
    export let mensaje : string = "";

    export let mensajeExito : string = "Compartición exitosa";

    onMount(() => {
        if (url === "") url = window.location.href;
    })

    function copy() {
        navigator.clipboard.writeText(getMensaje());
    }

    $: error = "";
    $: errorVisible = false;

    $: exito = false;

    async function compartir() {
        let msg = getMensaje();
        
        try {
            chatsSeleccionados.forEach(c => {
                ChatsService.enviarMensaje(c.id, msg);
            });
            visible = false;
            exito = true;
        } catch (e) {
            if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
        }
    }

    $: chats = [] as DTOChatResponse[];
    $: textoBuscado = "";
    async function buscar() {
        try {
            chats = await ChatsService.buscarChats(textoBuscado);
        } catch (e) {
            if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
        }
    }

    $: chatsSeleccionados = [] as DTOChatResponse[];



    function formatChatName(chat: DTOChatResponse) {
        switch(chat.tipo) {
            case "GRUPAL": return `Chat: ${chat.nombreGrupo}`;
            case "DIRECTO": return `Chat con ${chat.usuarioNombre} ${chat.usuarioApellido}`;
            case "ESPACIO": return `Chat: ${chat.nombreEspacio}`;
            case "EVENTO": return `Chat: ${chat.nombreEvento}`;
            case "SUPEREVENTO": return `Chat: ${chat.nombreSuperEvento}`;
        }
    }

    function toggleChat(chat: DTOChatResponse) {
        let ix = chatsSeleccionados.map(ch => ch.id).indexOf(chat.id);
        if (ix === -1) {
            chatsSeleccionados.push(chat);
        } else {
            chatsSeleccionados.splice(ix, 1);
        }
        chatsSeleccionados = [...chatsSeleccionados];
        
    }

    function getMensaje() {
        return url + "\n\n" + mensaje;
    }

</script>

<Popup title={"Compartir"} bind:visible={visible} fitH={true} fitW={true}>
    <div class="flex flex-col gap-2">
        <div>{url}</div>
        <TextField label={null} bind:value={mensaje} multiline max={100} rows={4}/>
        
        <div class="flex justify-center">
            <Button action={copy} classes="text-xs">Copiar</Button>
        </div>

        <div class="flex w-full gap-2 items-center">
            <TextField 
                label={null} 
                placeholder="Buscar chats..." 
                classes="w-full" 
                bind:value={textoBuscado} 
                action={buscar}
                change={buscar}
                ></TextField>
            <Button icon="/icons/search.svg" action={buscar} classes="h-fit"></Button>
        </div>

        <div class="flex flex-col gap-1">
            {#each chats as c}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div class="flex items-center gap-2 cursor-pointer" on:click={() => toggleChat(c)}>
                    <div>{formatChatName(c)}</div>
                    {#if chatsSeleccionados.map(ch => ch.id).includes(c.id)}
                        <span class="checkContainer">
                            <img src={"/icons/check.png"} alt="Ícono" class="object-contain">
                        </span>
                    {/if}
                </div>
            {/each}
        </div>

        <div>Otros chats:</div>

        <div class="flex flex-col gap-1">
            {#each chatsSeleccionados as c}
                {#if !chats.map(ch => ch.id).includes(c.id)}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div class="flex items-center gap-2 cursor-pointer" on:click={() => toggleChat(c)}>
                        <div>{formatChatName(c)}</div>
                        <span class="checkContainer">
                            <img src={"/icons/check.png"} alt="Ícono" class="object-contain">
                        </span>
                    </div>
                {/if}
            {/each}
        </div>

    </div>
    
    <div class="flex justify-center items-center gap-2 w-full">
        <Button action={() => {visible = !visible;}}>Cerrar</Button>
        <Button action={compartir}>Aceptar</Button>
    </div>
</Popup>

<Popup bind:visible={exito} fitH fitW>
	{mensajeExito}
	<div class="flex justify-center items-center w-full">
		<Button action={() => {exito = false;}}>Aceptar</Button>
	</div>
</Popup>

<PopupError bind:visible={errorVisible}>
	{error}
</PopupError>

<style>
    .checkContainer {
        height: 23px;
        width: 23px;
        position: relative;
        overflow: hidden;
    }

    .checkContainer img {
        filter: drop-shadow(-100vw 0 0 var(--color-light));
        transform: translateX(100vw);
        user-select: none;
    }
</style>