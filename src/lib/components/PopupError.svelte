<script lang="ts">
	import Popup from "./Popup.svelte";
	import Button from "./Button.svelte";
	import { goto } from "$app/navigation";

    export let visible : boolean;
    export let title : string = "Error";

    export let redir : string | null = null;

</script>

<Popup bind:title={title} bind:visible={visible} fitH={true} fitW={true}>
    <slot/>
    <div class="flex justify-center items-center w-full">
        <Button action={() => {visible = !visible; if (redir !== null) goto(redir);}}>Cerrar</Button>
    </div>
</Popup>