<script lang="ts">
	import Popup from "./Popup.svelte";
	import Button from "./Button.svelte";
	import MapDisplay from "./MapDisplay.svelte";
	import Slider from "./Slider.svelte";

    export let title : string | undefined = "Seleccionar ubicación";
    export let visible : boolean = false;
    export let classes : string = ""
    export let ubicacion : {x: number, y: number} | undefined = undefined;
    export let radius : number = 500;
    export let min : number = 100;
    export let max : number = 2000;

    let steps = (max - min) / 10;
    
    // Convert radius to slider position (0-1)
    function radiusToPosition(r: number): number {
        const logMin = Math.log(min);
        const logMax = Math.log(max);
        const logR = Math.log(r);
        return (logR - logMin) / (logMax - logMin);
    }
    
    // Convert slider position to radius
    function positionToRadius(pos: number): number {
        const logMin = Math.log(min);
        const logMax = Math.log(max);
        const logR = logMin + pos * (logMax - logMin);
        return Math.exp(logR);
    }

    // Initialize slider value based on current radius
    let value = radiusToPosition(radius) * steps; // Scale to 0-100 for slider
    
    // Update radius when slider changes
    $: radius = positionToRadius(value / steps); // Scale back to 0-1
    $: roundedRadius = Math.round(radius * 10) / 10;
    $: radiusDisplay = radius >= 1000 ? `${(roundedRadius / 1000).toFixed(2)} km` : `${roundedRadius.toFixed(2)} m`;

    function closePopup() {
        visible = false;
    }

    function accept() {
        closePopup();
    }
</script>

<Popup bind:visible bind:title {classes}>
    <div class="grow overflow-y-auto">
        <MapDisplay latitude={-32.89084} longitude={-68.82717} bind:marked={ubicacion} bind:radius={radius} zoom={14} height="100%"/>
    </div>
    <div class="flex flex-col mt-2">
        <div class="flex justify-between">
            <span>Radio:</span>
            <span>{radiusDisplay}</span>
        </div>
        <Slider bind:value={value} min={0} max={steps}/>
    </div>
    <div class="flex gap-2 h-fit p-2 justify-center items-center">
        <Button action={closePopup}>Cancelar</Button>
        <Button action={accept}>Aceptar</Button>
    </div>
</Popup>