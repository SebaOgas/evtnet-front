<script lang="ts">
	import '../app.css';
	import {Shadow} from 'svelte-loading-spinners'
	import {loading} from "$lib/stores"
</script>

<slot/>

{#if $loading}
	<div class="spinner-bg flex justify-center items-center h-screen w-screen fixed top-0 left-0">	
		<Shadow color="#f79256" unit="vw" size="20" duration="2s"/>
	</div>
{/if}

<style>
	.spinner-bg {
		background-color: #1D4E89b0;
        z-index: 20;
	}
</style>