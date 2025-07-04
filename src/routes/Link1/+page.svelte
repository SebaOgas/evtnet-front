<script lang="ts">
	import L from 'leaflet';
	import { onMount } from 'svelte';

	let map;

	onMount(() => {
		map = L.map('map').setView([-32.89713443095706, -68.85353962902123], 17);

		L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);
	});
</script>

<div id="map" class="h-full w-full"></div>
