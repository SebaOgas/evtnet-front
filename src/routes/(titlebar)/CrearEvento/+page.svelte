<script lang="ts">
	import { goto } from "$app/navigation";
	import { permisos, token } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

    onMount(async () => {     
        if (get(token) === "") {
            goto("/");
        }

        if(!get(permisos).includes("OrganizacionEventos")) {
            goto("/Eventos")
        }

        goto("/CrearEvento/-1")
    });

</script>
