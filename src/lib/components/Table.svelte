<script lang="ts">
	import { onMount } from "svelte";

	export let cols: string[] = [];
	let body: HTMLTableSectionElement;

	function applyLabels() {
		if (!body) return;
		cols.forEach((c, ix) => {
			let tds = body.querySelectorAll(`tr>td:nth-child(${ix+1})`);
			tds.forEach(td => {
				if (!td.querySelector("strong")) {
					let label = document.createElement("strong");
					label.innerHTML = c;
					td.prepend(label);
				}
			});
		});
	}

	onMount(() => {
		applyLabels();

		// watch slot changes
		const observer = new MutationObserver(applyLabels);
		observer.observe(body, { childList: true, subtree: true });

		return () => observer.disconnect();
	});
</script>


<!-- Desktop table -->
<div class="hidden md:block overflow-x-auto">
  	<table class="w-full">
		<thead>
			<tr>
				{#each cols as col}
					<th>{col}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			<slot />
		</tbody>
	</table>
</div>

<!-- Mobile list -->
<div class="md:hidden space-y-2">
  <table class="block">
	<tbody bind:this={body} 
		class="flex flex-col gap-8 
			[&>tr]:flex [&>tr]:flex-col [&>tr]:gap-2
			[&>tr>td]:flex [&>tr>td]:flex-row [&>tr>td]:justify-between [&>tr>td]:items-center">
		<slot/>
	</tbody>
  </table>
</div>