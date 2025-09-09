<script lang="ts">
	import Popup from "./Popup.svelte";
	import Button from "./Button.svelte";
	import type DTOCalificacion from "$lib/dtos/usuarios/DTOCalificacion";
	import { onMount } from "svelte";
	import { UsuariosService } from "$lib/services/UsuariosService";
	import { HttpError } from "$lib/request/request";
	import PopupError from "./PopupError.svelte";

    export let visible : boolean;
    export let username : string | null;

    $: confirmarVisible = false;

    let data : DTOCalificacion = {
		calificacionTipo: null,
		usuarioCalificado: "",
		motivos: [],
		descripcion: ""
	}

    let calificacionTipos = [];

    $: error = ""
	$: errorVisible = false;

    onMount(async() => {
        try {
			calificacionTipos = await UsuariosService.obtenerCalificacionTipos()
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}    
		}
    })

    
    let title : string = "Calificar usuario";

    async function confirmar() {
        
    }


</script>

<Popup bind:title={title} bind:visible={visible} fitH={true} fitW={true}>
    
    <div class="flex justify-center items-center w-full gap-2">
        <Button action={() => {visible = !visible}}>Cancelar</Button>
        {#if confirmarVisible}
            <Button action={confirmar}>Confirmar</Button>
        {/if}
    </div>
</Popup>


<PopupError bind:visible={errorVisible}>
	{error}
</PopupError>