<script lang="ts">
    import Slider from 'svelte-range-slider-pips';

    export let value : number = 0;

    export let min : number = 0;
    export let max : number = 100;
</script>


<div class="*:not-first:mt-4">
	<Slider bind:value={value} {min} {max}/>
</div>