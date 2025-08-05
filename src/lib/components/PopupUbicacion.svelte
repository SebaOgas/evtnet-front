<script lang="ts">
	import Popup from "./Popup.svelte";
	import Button from "./Button.svelte";
	import { onMount } from "svelte";
	import MapDisplay from "./MapDisplay.svelte";


    export let title : string | undefined = "Seleccionar ubicación";

    export let visible : boolean = false;
    
    export let classes : string = ""

    export let ubicacion : {x: number, y: number} | undefined = undefined;

    export let radius : number = 500;




    function closePopup() {
        visible = false;
    }

    function accept() {
        closePopup();
    }


</script>



<Popup bind:visible bind:title {classes}>
    <div class="grow overflow-y-auto">
        <MapDisplay latitude={-32.89084} longitude={-68.82717} bind:marked={ubicacion} bind:radius={radius} zoom={12} height="100%"/>
    </div>
    <div class="flex gap-2 h-fit p-2 justify-center items-center">
        <Button action={closePopup}>Cancelar</Button>
        <Button action={accept}>Aceptar</Button>
    </div>
</Popup>

