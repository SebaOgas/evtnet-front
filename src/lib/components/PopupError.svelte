<script lang="ts">
	import Popup from "./Popup.svelte";
	import Button from "./Button.svelte";

    export let visible : boolean;
    export let title : string = "Error";

</script>

<Popup bind:title={title} bind:visible={visible} fitH={true} fitW={true}>
    <slot/>
    <div class="flex justify-center items-center w-full">
        <Button action={() => {visible = !visible}}>Cerrar</Button>
    </div>
</Popup>