<script lang="ts">
	import '../app.css';
	import {Shadow} from 'svelte-loading-spinners'
	import {loading} from "$lib/stores"
	import { onMount } from 'svelte';
	import PopupPago from '$lib/components/PopupPago.svelte';
	import { afterNavigate } from '$app/navigation';
	import type DTOInstanciaMascotaPagina from '$lib/dtos/mascota/DTOInstanciaMascotaPagina';
	import { InstanciasMascotaService } from '$lib/services/InstanciasMascotaService';
	import { page } from '$app/state';
	import { get } from 'svelte/store';

	onMount(async () => {
		try {
			const { StatusBar, Style } = await import('@capacitor/status-bar');
			const {SafeArea} = await import('@capacitor-community/safe-area');
			

			await StatusBar.setOverlaysWebView({overlay: false})
			await StatusBar.setBackgroundColor({color: "#00b2ca"})
			await StatusBar.setStyle({ style: Style.Light });


			await SafeArea.enable({
				config: {
					customColorsForSystemBars: true,
					statusBarColor: '#00b2ca',
					statusBarContent: 'dark',
					navigationBarColor: '#ffffff',
					navigationBarContent: 'dark',
					offset: 0
				},
			});
		} catch (error) {
			//console.log('StatusBar not available');
		}
	})

	afterNavigate(async () => {
		let url = window.location.pathname;
		
		let instancias : DTOInstanciaMascotaPagina[] = await InstanciasMascotaService.obtenerInstanciasParaPagina(url);

		instancias.forEach(i => {
			let elems : NodeListOf<Element> = document.querySelectorAll(i.selector);
			
			i.eventos.forEach(ev => {
				if (ev === "load") {
					if (!i.visualizado)
						instanciarMascota(i);
				} else {
					elems.forEach(el => {
						el.addEventListener(ev, () => {
							instanciarMascota(i);
						});
					});
				}
				
			});
			
		});
	});

	$: instanciaMascota = null as DTOInstanciaMascotaPagina | null;
	$: instanciaMascotaPaso = 0;

	async function instanciarMascota(instancia: DTOInstanciaMascotaPagina) {
		instanciaMascotaPaso = 0;
		instanciaMascota = instancia;
		await InstanciasMascotaService.registrarVisualizacion(instancia.id);
	}

	function nextSecuenciaMascota() {
		if (instanciaMascota === null) return;
		if (instanciaMascota.secuencia.length <= instanciaMascotaPaso + 1) {
			instanciaMascota = null;
			instanciaMascotaPaso = 0;
			return;
		}
		instanciaMascotaPaso += 1;
	}

</script>

<slot/>

{#if $loading}
	<div class="spinner-bg flex justify-center items-center h-screen w-screen fixed top-0 left-0">	
		<Shadow color="#f79256" unit="vw" size="20" duration="2s"/>
	</div>
{/if}

<PopupPago/>

{#if instanciaMascota !== null}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="mascota bg-[#1d438999] w-[100vw] h-[100vh] fixed top-0 left-0" on:click={nextSecuenciaMascota}>
		<div class="h-[50vh] fixed bottom-0 right-0">
			<img src={instanciaMascota.secuencia[instanciaMascotaPaso].url} alt="Mascota" class="h-full">
		</div>
		<div class="bg-[#1d4389bb] text-white h-fit w-full fixed bottom-0 left-0 text-s p-8">
			{instanciaMascota.secuencia[instanciaMascotaPaso].texto}
		</div>
	</div>
{/if}

<style>
	.spinner-bg {
		background-color: #1D4E89b0;
        z-index: 20;
	}

	.mascota {
		user-select: none;
	}
</style>