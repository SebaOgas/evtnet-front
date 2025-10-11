<script lang="ts" context="module">
    export const startPopupPago = (action: (data: DTOPago[]) => void, preferencias: DTOPreferenciaPago[]) => {        
        if (get(actionPago) !== null || get(preferences).length > 0) {
            throw new Error("Ya hay otro pago en curso.");
        }

        preferences.set(preferencias);
        actionPago.set(action);
    };
</script>


<script lang="ts">
	import Popup from "./Popup.svelte";
	import Button from "./Button.svelte";
	import type DTOPago from "$lib/dtos/usuarios/DTOPago";
	import { page } from "$app/state";
	import { onMount } from "svelte";
	import type DTOPreferenciaPago from "$lib/dtos/usuarios/DTOPreferenciaPago";
	import PopupError from "./PopupError.svelte";
	import { actionPago, preferences } from "$lib/stores";
	import { afterNavigate, goto, invalidateAll } from "$app/navigation";
	import { get } from "svelte/store";

    let preferences_local : DTOPreferenciaPago[] = [];

    $: errorGenericoVisible = false;
    $: errorGenerico = "";

    let pagos : DTOPago[] = [];

    $: preferences_local = $preferences;

    onMount(load);

    afterNavigate(load);

    function load () {
        let action = get(actionPago);
        if (action === null) return;


        let searchParams = page.url.searchParams;
        
        let data : DTOPago = {
			paymentId: Number.parseInt(searchParams.get("payment_id") ?? "-1"),
			status: searchParams.get("status") ?? "",
			external_reference: searchParams.get("external_reference") ?? "",
			preference_id: searchParams.get("preference_id") ?? ""
		}

        if (data.paymentId === -1 && data.status === "" && data.external_reference === "") {
            //No se ha hecho un pago
        } else {
            preferences_local.forEach((p, ix, arr) => {
                if (p.preference_id === data.preference_id) {
                    if (p.completada) {
                        errorGenericoVisible = true;
                        errorGenerico = "Esta transacción ya había sido completada."
                    } else {
                        arr[ix].completada = true;
                        pagos.push(data);
                    }
                }
            })

            preferences.set(preferences_local);

            if (preferences_local.filter(p => p.completada === false).length === 0) {
                action(pagos);
                preferences_local = [];
                preferences.set(preferences_local);
            }
        }
    }

    $: (async () => {
        try {
            for (const p of preferences_local) {
                
                if (p.completada) continue;

                let button = document.getElementById("boton_pago_" + p.preference_id);
                                
                if (button !== null && button.childNodes.length >= 1) continue;
            
                const mp = new MercadoPago(p.public_key, {
                    locale: 'es-AR'
                });

                const bricksBuilder = mp.bricks();

                const renderWalletBrick = async (bricksBuilder) => {
                    await bricksBuilder.create("wallet", "boton_pago_" + p.preference_id, {
                        initialization: {
                            preferenceId: p.preference_id,
                        }
                    });
                };

                renderWalletBrick(bricksBuilder);
            }
        } catch (e) {
            errorGenericoVisible = true;
            errorGenerico = "No se pudo generar un botón de pago. Cancele el pago e inténtelo nuevamente. Si se hubiera realizado algún pago, este le será devuelto."
        }
    })()


    async function simularPago(p: DTOPreferenciaPago) {
        let data : DTOPago = {
			paymentId: -1,
			status: "approved",
			external_reference: "",
			preference_id: p.preference_id
		}

        await goto(`?payment_id=${data.paymentId}&status=${data.status}&external_reference=${data.external_reference}&preference_id=${data.preference_id}`)

        invalidateAll();
    }

    async function cancel() {
        preferences_local = [];
        /*TO-DO: Endpoint que cancele todas las transferencias en curso*/
        preferences.set(preferences_local);
        await goto("?");
    }
    

</script>

<Popup title={'Realizar pago'} visible={preferences_local.length > 0} fitH fitW>
	<div class="flex flex-col gap-4 md:flex-row md:flex-wrap">
		{#each preferences_local as p}
			<div>
				<div>
					<p>Concepto:</p>
					<p>{p.concepto}</p>
				</div>
				<div class="flex w-full items-baseline justify-between">
					<span>Monto bruto:</span>
					<span>{p.montoBruto.toFixed(2).replace('.', ',')}</span>
				</div>
				<div class="flex w-full items-baseline justify-between">
					<span>Comisión:</span>
					<span>${(p.montoBruto * p.comision).toFixed(2).replace('.', ',')}</span>
				</div>
				<div class="flex w-full items-baseline justify-between">
					<span>Monto neto:</span>
					<span>${(p.montoBruto * (1 + p.comision)).toFixed(2).replace('.', ',')}</span>
				</div>
				{#if !p.completada}
                    <div class="flex justify-center">
                        <div class="w-full md:max-w-[300px]">
                            <div id="boton_pago_{p.preference_id}"></div>
                        </div>
                    </div>
                    
                    <div class="flex w-full justify-center">
                        <Button classes="text-xs" action={() => simularPago(p)}>Simular Pago</Button>
                    </div>
				{:else}
					<div class="text-center text-s">Pago realizado</div>
				{/if}
			</div>
		{/each}
	</div>

	<div class="mt-2 flex w-full flex-col items-center justify-center gap-2">
		<Button
			action={cancel}>Cancelar</Button
		>
	</div>
</Popup>

<PopupError bind:visible={errorGenericoVisible}>
	{errorGenerico}
</PopupError>
