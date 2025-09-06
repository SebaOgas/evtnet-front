<script lang="ts">
	import Popup from "./Popup.svelte";
	import Button from "./Button.svelte";
	import { onMount } from "svelte";
	import type DTOComprobante from "$lib/dtos/comprobantes/DTOComprobante";
	import { ComprobantesService } from "$lib/services/ComprobantesService";
	import { HttpError } from "$lib/request/request";
	import PopupError from "./PopupError.svelte";
	import { formatDate } from "./DatePicker.svelte";

    export let numero : number | null = null;

    let comprobante : DTOComprobante | null = null;

    $: (async () => {
        if (numero === null) return;
        try {
            comprobante = await ComprobantesService.obtener(numero);
        } catch (e) {
            if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
        }
    })()

    $: error = ""
    $: errorVisible = false;

    async function descargar() {
        if (numero === null) return;
        try {
            let url : string = await ComprobantesService.obtenerArchivo(numero);
            const link = document.createElement("a");
            link.href = url;
            link.download = "Comprobante_evtnet_" + numero;
            link.click();
        } catch (e) {
            if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
        }
    }

</script>

{#if comprobante !== null}
<Popup title="Comprobante" visible={comprobante !== null} fitH={true} fitW={true}>
    <div class="flex flex-col w-full gap-2">
        <div class="flex justify-between items-center">
            <span>Número:</span>
            <span>{comprobante.numero}</span>
        </div>
        <div class="flex flex-col justify-start items-start">
            <span>Concepto:</span>
            <span>{comprobante.concepto}</span>
        </div>
        <div class="flex justify-between items-center">
            <span>Emitido:</span>
            <span>{formatDate(comprobante.fechaHoraEmision, true)}</span>
        </div>
        <div class="flex flex-col justify-start items-start">
            <span>Forma de pago:</span>
            <span class="self-end">{comprobante.formaDePago}</span>
        </div>
        <div class="flex justify-between items-center">
            <span>Pagó: {comprobante.pago.apellido}, {comprobante.pago.nombre} (DNI N.°: {comprobante.pago.dni}, CBU: {comprobante.pago.cbu})</span>
        </div>
        <div class="flex justify-between items-center">
            <span>Cobró: {comprobante.cobro.apellido}, {comprobante.cobro.nombre} (DNI N.°: {comprobante.cobro.dni}, CBU: {comprobante.cobro.cbu})</span>
        </div>
        <div class="flex justify-between items-center">
            <span>Total bruto:</span>
            <span>${comprobante.montoTotalBruto.toFixed(2).replaceAll(".", ",")}</span>
        </div>
        <div class="flex justify-between items-center">
            <span>Comisión*:</span>
            <span>${comprobante.comision.toFixed(2).replaceAll(".", ",")}</span>
        </div>
        <div class="flex justify-between items-center">
            <span>Total neto:</span>
            <span>${(comprobante.montoTotalBruto + comprobante.comision).toFixed(2).replaceAll(".", ",")}</span>
        </div>
        <div class="flex justify-between items-center">
            <span>(*) La comisión fue pagada {comprobante.evtnetPagaComision ? "por" : "a"} evtnet</span>
        </div>
    </div>
    <div class="flex justify-center items-center w-full gap-2">
        <Button action={() => {comprobante = null}}>Atrás</Button>
        <Button action={descargar}>Descargar</Button>
    </div>
</Popup>
{/if}

<PopupError bind:visible={errorVisible}>
	{error}
</PopupError>