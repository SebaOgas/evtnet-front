<script lang="ts">
	import { goto } from "$app/navigation";

	import { permisos, token, username } from "$lib/stores";
	import { get } from "svelte/store";
	import { onMount } from "svelte";
	import PopupError from "$lib/components/PopupError.svelte";

    $: error = false

    onMount(() => {
        if (get(token) === "") {
            goto("/");
        }

        if(get(permisos).includes("VisionPerfilPropio")) {
            goto(`/Perfil/${$username}`);
        } else {
            error = true;
        }
    })
</script>

<PopupError bind:visible={error}>
    No tiene permiso para acceder a su perfil de usuario.
    <br/>
    Si considera que esto es un error, póngase en contacto con el administrador del sistema.
</PopupError>

