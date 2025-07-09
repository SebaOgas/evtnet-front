<script lang="ts">
	import TitleBar from '$lib/components/TitleBar.svelte';
import '../../app.css';
	let { children } = $props();
</script>

<TitleBar/>

<div id="content" class="p-2 text-xs flex flex-col gap-2">
	{@render children()}
</div>
