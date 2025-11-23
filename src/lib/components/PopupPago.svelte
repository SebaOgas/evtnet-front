<script lang="ts" context="module">
    import { get } from "svelte/store";

    export const startPopupPago = (data: any, endpoint: string, redir: string, preferencias: DTOPreferenciaPago[]) => {        
        if (get(preferences).length > 0) {
            throw new Error("Ya hay otro pago en curso.");
        }

        preferences.set(preferencias);
        pagoCompleto.set({
            pagos: [],
            data: data,
            endpoint: endpoint,
            redir: redir
        });
    };
</script>

<script lang="ts">
    import Popup from "./Popup.svelte";
    import Button from "./Button.svelte";
    import type DTOPreferenciaPago from "$lib/dtos/usuarios/DTOPreferenciaPago";
    import PopupError from "./PopupError.svelte";
    import { pagoCompleto, preferences } from "$lib/stores";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    let preferences_local: DTOPreferenciaPago[] = [];
    let errorGenericoVisible = false;
    let errorGenerico = "";
    let buttonsRendered = false;

    $: preferences_local = $preferences;

    onMount(() => {
        const unsubscribe = preferences.subscribe(async (prefs) => {
            if (prefs.length > 0) {
                buttonsRendered = false;
                await renderButtons();
            }
        });

        return unsubscribe;
    });

    async function renderButtons() {
        if (buttonsRendered) return;
        
        // Small delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
            let prefs = preferences_local;
            if (!Array.isArray(prefs)) {
                prefs = [prefs];
            }
            
            for (const p of prefs) {                
                if (p.completada) continue;

                let button = document.getElementById("boton_pago_" + p.preference_id);
                if (button === null) continue;
                
                button.innerHTML = '';
            
                const mp = new MercadoPago(p.public_key, {
                    locale: 'es-AR'
                });

                const bricksBuilder = mp.bricks();

                await bricksBuilder.create("wallet", "boton_pago_" + p.preference_id, {
                    initialization: {
                        preferenceId: p.preference_id,
                        redirectMode: 'self'
                    }
                });
            }
            
            buttonsRendered = true;
        } catch (e) {
            console.log(e);
            errorGenericoVisible = true;
            errorGenerico = "No se pudo generar un botón de pago. Cancele el pago e inténtelo nuevamente. Si se hubiera realizado algún pago, este le será devuelto."
        }
    }

    async function simularPago(p: DTOPreferenciaPago) {
        await goto(`/Pago?payment_id=-1&status=approved&external_reference=&preference_id=${p.preference_id}`);
    }

    async function cancel() {
        preferences.set([]);
        pagoCompleto.set(null);
        buttonsRendered = false;
        await goto("?");
    }
</script>

<Popup title={'Realizar pago'} visible={preferences_local.length > 0} fitH fitW>
    <div class="flex flex-col gap-4 md:flex-row md:flex-wrap">
        {#each preferences_local as p (p.preference_id)}
            <div>
                <div>
                    <p>Concepto:</p>
                    <p>{p.concepto}</p>
                </div>
                <div class="flex w-full items-baseline justify-between">
                    <span>Monto bruto:</span>
                    <span>${p.montoBruto.toFixed(2).replace('.', ',')}</span>
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
        <Button action={cancel}>Cancelar</Button>
    </div>
</Popup>

<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>