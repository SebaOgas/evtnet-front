<script lang="ts">
	import TitleBar from '$lib/components/TitleBar.svelte';
import '../../app.css';
	let { children } = $props();
</script>

<TitleBar/>


{@render children()}
