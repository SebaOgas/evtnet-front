<script lang="ts" context="module">
    export const exportarCSV = (raw: string[][], name: string) => {
        const csvContent = raw
			.map(row => 
			row.map(cell => 
				// Escape quotes and wrap in quotes if cell contains comma, quote, or newline
				cell.includes(',') || cell.includes('"') || cell.includes('\n')
				? `"${cell.replace(/"/g, '""')}"`
				: cell
			).join(',')
			)
			.join('\n');

		// Create blob and download
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		
		if (link.download !== undefined) {
			const url = URL.createObjectURL(blob);
			link.setAttribute('href', url);
			link.setAttribute('download', `${name}.csv`);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
    };
</script>

<script lang="ts">
	import { onMount } from "svelte";

	export let cols: string[] = [];
	let body: HTMLTableSectionElement;

	export let classes: string = "";

	export let raw : string[][] = [];

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

	function makeRaw() {
		if (!body) return;
		raw = [];
		raw.push(cols);
		let trs = body.querySelectorAll("tr");
		
		trs.forEach(tr => {
			let tds = tr.querySelectorAll("th, td");

			let row = Array.from(tds.values()).map(td => td.innerHTML);
			raw.push(row);
		})
		
	}

	onMount(() => {
		makeRaw();
		applyLabels();

		// watch slot changes
		const observer = new MutationObserver(() => {makeRaw(); applyLabels()});
		observer.observe(body, { childList: true, subtree: true });

		return () => observer.disconnect();
	});
</script>


<!-- Desktop table -->
<div class="{classes} hidden md:block overflow-x-auto">
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
<div class="{classes} md:hidden space-y-2">
  <table class="block">
	<tbody bind:this={body} 
		class="flex flex-col gap-8 
			[&>tr]:flex [&>tr]:flex-col [&>tr]:gap-2
			[&>tr>td]:flex [&>tr>td]:flex-row [&>tr>td]:justify-between [&>tr>td]:items-center  [&>tr>td]:flex-wrap">
		<slot/>
	</tbody>
  </table>
</div>