<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import type DTOChatResponse from "$lib/dtos/chat/DTOChatResponse";
	import { ChatsService } from "$lib/services/ChatsService";
	import { onMount } from "svelte";

    $: chats = [] as DTOChatResponse[];

    onMount(async () => {
        chats = await ChatsService.obtenerChatsDirectos();
    })
</script>

<div id="content">
    <div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
        <h1 class="text-m text-center">
            Chats Directos
        </h1>

        <div class="flex flex-col gap-2 w-full">
            {#each chats as c}
                <div class="flex flex-row justify-between items-center gap-2 md:max-w-[45vw] lg:max-w-[30vw]">
                        <div>{c.usuarioNombre} {c.usuarioApellido} (@{c.usuarioUsername})</div>
                        <div class="flex justify-center items-center gap-2">
                            <Button icon="/icons/view.svg" classes="h-fit" action={() => {goto(`/Perfil/${c.usuarioUsername}`)}}></Button>
                            <Button icon="/icons/chat.svg" classes="h-fit" action={() => {goto(`/Chat/${c.id}`)}}></Button>
                        </div>
                    </div>
            {/each}
        </div>
    </div>
    <div class="flex flex-row flex-wrap gap-2 h-fit p-2 justify-center items-center">
        <Button classes="text-m" action={() => goto(`/Perfil`)}>Atrás</Button>
    </div>
</div>

