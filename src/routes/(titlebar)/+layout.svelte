<script lang="ts">
	import TitleBar from '$lib/components/TitleBar.svelte';
	import '../../app.css';
</script>


<div class="hidden print:block">
	<TitleBar/>
</div>

<slot/>

<div class="print:hidden">
	<TitleBar/>
</div>
