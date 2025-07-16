<script lang="ts">
	import { TestService } from "$lib/services/TestService";
	import { onMount } from "svelte";

    let resp;
    let estado = "";

    onMount(async () => {
        resp = await TestService.endpoint();
        console.log(resp);
        estado = "Respuesta recibida: " + JSON.stringify(resp);
    })
</script>

<h2>Solicitud de ejemplo</h2>

<p>{estado}</p>



