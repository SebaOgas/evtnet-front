<script lang="ts">
	import { goto } from "$app/navigation";

	import { permisos, token, username } from "$lib/stores";
	import { get } from "svelte/store";
	import { onMount } from "svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import { page } from "$app/state";
	import { UsuariosService } from "$lib/services/UsuariosService";
	import { HttpError } from "$lib/request/request";

    $: error = false
    $: errorMP = false

    onMount(async () => {
        if (get(token) === "") {
            goto("/");
        }

        if(get(permisos).includes("VisionPerfilPropio")) {
            let searchParams = page.url.searchParams;
            
            let code = searchParams.get("code") ?? "";
            let state = searchParams.get("state") ?? "";
            if (code !== "") {
                try {
                    await UsuariosService.obtenerCredencialesMP(code, state);
                    goto(`/Perfil/${$username}`);
                } catch (e) {
                    if (e instanceof HttpError) {
                        errorMP = true;
                    }     
                }
                
            } else {
                goto(`/Perfil/${$username}`);
            }
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

<PopupError bind:visible={errorMP} redir="/Perfil/{$username}">
    No se pudo vincular su cuenta de Mercado Pago.
    <br/>
    Inténtelo nuevamente más tarde.
</PopupError>

