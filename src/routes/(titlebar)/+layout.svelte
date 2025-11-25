<script lang="ts">
	import PopupPago from '$lib/components/PopupPago.svelte';
	import TitleBar from '$lib/components/TitleBar.svelte';
	import '../../app.css';
</script>

<PopupPago/>

<div class="hidden print:block">
	<TitleBar/>
</div>

<slot/>

<div class="print:hidden">
	<TitleBar/>
</div>
