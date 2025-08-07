<script lang="ts">
		import type { Map, LayerGroup, Layer, CircleMarker, Circle } from 'leaflet';
import { onMount } from 'svelte';

    export let height : string = "30vh"

    export let latitude : number = -32.89713443095706;
    export let longitude : number = -68.85353962902123;
    export let zoom : number = 17; //0 = todo el mundo

    export let marked: {x: number, y: number} | undefined = undefined;
    export let radius: number = 0; //En metros


    export let disablePanning : boolean = false;
    export let disableZooming : boolean = false;
    export let disableMarking : boolean = false;
    export let disableScale : boolean = false;

    let map: Map | LayerGroup<any>;
    let marker: CircleMarker<any>;
    let markerRadius: Circle<any>;

	onMount(() => {
		map = L.map('map', {
            dragging: !disablePanning,
            zoomControl: !disableZooming,
            scrollWheelZoom: !disableZooming,
            touchZoom: !disableZooming,
            doubleClickZoom: !disableZooming,
            boxZoom: !disableZooming,
            keyboard: !disableZooming
        }).setView([latitude, longitude], zoom);

		L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
		}).addTo(map);
        
        if (marked !== undefined) {
            marker = L.circleMarker([marked.x, marked.y], {
                color: "#00b2ca",
                fillColor: "#00b2ca",
                fillOpacity: 1,
                radius: 10
            })
            marker.addTo(map)
            markerRadius = L.circle([marked.x, marked.y], {
                color: "#00b2ca",
                fillColor: "#00b2ca",
                fillOpacity: 0.4,
                stroke: true,
                radius: radius
            })
            markerRadius.addTo(map)
        }
        if (!disableMarking) {
            map.on("click", (e) => {
                if (marked === undefined) {
                    marker = L.circleMarker([e.latlng.lat, e.latlng.lng], {
                        color: "#00b2ca",
                        fillColor: "#00b2ca",
                        fillOpacity: 1,
                        radius: 10
                    })
                    marker.addTo(map)
                    markerRadius = L.circle([e.latlng.lat, e.latlng.lng], {
                        color: "#00b2ca",
                        fillColor: "#00b2ca",
                        fillOpacity: 0.4,
                        stroke: true,
                        radius: radius
                    })
                    markerRadius.addTo(map)
                } else {
                    marker.setLatLng([e.latlng.lat, e.latlng.lng]);
                    markerRadius.setLatLng([e.latlng.lat, e.latlng.lng]);
                }
                /*map.removeLayer(marker);
                map.removeLayer(markerRadius);
                marker = L.circleMarker([e.latlng.lat, e.latlng.lng], {
                    color: "#00b2ca",
                    fillColor: "#00b2ca",
                    fillOpacity: 1,
                    radius: 10
                })
                marker.addTo(map)*/
                marked = {x: e.latlng.lat, y: e.latlng.lng};
            })
        }

        if (!disableScale) {
            L.control.scale({
                imperial: false
            }).addTo(map);
        }
        
	});

    $: (() => {
        if (markerRadius !== undefined)
            markerRadius.setRadius(radius);
    })()
</script>

<div id="map" class="z-0 w-full border border-black rounded rounded-lg" style="min-height: {height}; max-height: {height}"></div>
