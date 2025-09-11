<script lang="ts">
	import Popup from "./Popup.svelte";
	import Button from "./Button.svelte";
	import { goto } from "$app/navigation";
	import { HttpError } from "$lib/request/request";
	import { Capacitor } from "@capacitor/core";
    
	import PopupAdminUsuario from "$lib/components/PopupAdminUsuario.svelte";
	import type DTOAdminGrupo from "$lib/dtos/grupos/DTOAdminSimple";
	import { GruposService } from "$lib/services/GruposService";
	import PopupError from "./PopupError.svelte";

    export let id : number | null = null;

    $: error = "";
	$: errorVisible = false;

    let grupo : DTOAdminGrupo | null = null;

    $: (async () => {
        if (id === null) return;
        try {
            grupo = await GruposService.adminObtenerGrupo(id);
        } catch (e) {
            if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
        }
    })()

    let subUsername : string | null = null;

</script>

{#if grupo !== null}
<Popup title={"Detalle de Grupo"} visible={id !== null} fitH={true} fitW={true}>
    <div class="flex flex-col gap-2">
        <div>Nombre: {grupo.nombre}</div>
        <div>Descripción: {grupo.descripcion}</div>
        <div class="flex justify-between gap-2 items-center">
            <span>Creador: {grupo.creador.nombre} {grupo.creador.apellido} @{grupo.creador.username} ({grupo.creador.mail})</span>
            <Button action={() => subUsername = grupo !== null ? grupo.creador.username : null}>Ver usuario</Button>
        </div>
        
        <div>Miembros:</div>
        {#each grupo.miembros as miembro}
            <div class="flex justify-between gap-2 items-center">
                <span>
                    {miembro.nombre} {miembro.apellido} @{miembro.username} ({miembro.mail}) ({miembro.tipo})</span>
                <Button action={() => subUsername = grupo !== null ? miembro.username : null}>Ver usuario</Button>
            </div>
        {/each}
        
    </div>
    <div class="flex justify-center items-center gap-2 w-full">
		<Button action={() => {id = null}}>Atrás</Button>
	</div>
</Popup>

<PopupAdminUsuario bind:username={subUsername}/>

{/if}


<PopupError bind:visible={errorVisible}>
    {error}
</PopupError>