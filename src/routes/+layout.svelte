<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<div id="titlebar" class="flex items-center justify-between p-2">
	<h1 class="text-2xl font-bold text-blue-500"><a href="/">App</a></h1>
	<menu class="flex gap-2 italic [&_a:hover]:underline">
		<li><a href="./Link1">Link 1</a></li>
		<li><a href="./Link2">Link 2</a></li>
		<li><a href="./Link3">Link 3</a></li>
	</menu>
</div>
<div id="content" class="p-2 text-black">
	{@render children()}
</div>
