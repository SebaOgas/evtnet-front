<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import { formatDate } from "$lib/components/DatePicker.svelte";
	import PopupComprobante from "$lib/components/PopupComprobante.svelte";
	import PopupError from "$lib/components/PopupError.svelte";
	import type DTOComprobanteSimple from "$lib/dtos/comprobantes/DTOComprobanteSimple";
	import { HttpError } from "$lib/request/request";
	import { ComprobantesService } from "$lib/services/ComprobantesService";
	import { onMount } from "svelte";

    $: errorPermiso = false;

	$: error = "";
	$: errorVisible = false;

    $: comprobantes = [] as DTOComprobanteSimple[];

    onMount(async () => {
        try {
			comprobantes = await ComprobantesService.obtenerMisComprobantes();
		} catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
    })

    let comprobanteAbierto : number | null = null;
</script>


<div id="content">
	<div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
		<h1 class="text-m text-center">
			Comprobantes
		</h1>

        <div class="flex flex-col gap-4 md:flex-row md:flex-wrap md:justify-center">
            {#each comprobantes as c}
                <div class="flex flex-col w-full md:max-w-[45vw] lg:max-w-[30vw] gap-2 items-start">
                    <div class="flex flex-row justify-between w-full">
                        <div>{c.concepto}</div>
                        <Button icon="/icons/view.svg" classes="h-fit" action={() => {comprobanteAbierto = c.numero}}></Button>
                    </div>
                    <div class="flex flex-row justify-between items-baseline gap-2 w-full pl-4">
                        <span>Fecha</span>
                        <span>{formatDate(c.fechaHoraEmision)}</span>
                    </div>
                    <div class="flex flex-row justify-between items-baseline gap-2 w-full pl-4">
                        <span>Total</span>
                        <span>${c.numero.toFixed(2).replaceAll(".", ",")}</span>
                    </div>
                </div>
            {/each}
        </div>
	</div>

	<div class="flex flex-wrap gap-2 h-fit p-2 justify-center items-center">
		<Button action={() => goto(`/Perfil`)}>Atrás</Button>
	</div>
</div>

<PopupComprobante bind:numero={comprobanteAbierto}/>

<PopupError bind:visible={errorVisible}>
    {error}
</PopupError>

<PopupError bind:visible={errorPermiso}>
    No tiene permiso para modificar su perfil.
</PopupError>
