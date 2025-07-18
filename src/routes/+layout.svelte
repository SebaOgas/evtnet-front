<script lang="ts">
	import '../app.css';
	import {Shadow} from 'svelte-loading-spinners'
	import {loading} from "$lib/stores"
	import { onMount } from 'svelte';

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

	

</script>

<slot/>

{#if $loading}
	<div class="spinner-bg flex justify-center items-center h-screen w-screen fixed top-0 left-0">	
		<Shadow color="#f79256" unit="vw" size="20" duration="2s"/>
	</div>
{/if}

<style>
	.spinner-bg {
		background-color: #1D4E89b0;
        z-index: 20;
	}
</style>