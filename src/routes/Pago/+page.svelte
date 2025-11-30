<script lang="ts">
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import type DTOPago from "$lib/dtos/usuarios/DTOPago";
    import type DTOPreferenciaPago from "$lib/dtos/usuarios/DTOPreferenciaPago";
    import { pagoCompleto, preferences } from "$lib/stores";
    import { goto } from "$app/navigation";
    import { get } from "svelte/store";
    import { HttpError, HttpRequestType, request } from "$lib/request/request";
    import PopupError from "$lib/components/PopupError.svelte";
	import type DTOPagoCompleto from "$lib/dtos/usuarios/DTOPagoCompleto";
	import Popup from "$lib/components/Popup.svelte";
	import Button from "$lib/components/Button.svelte";

    let errorGenericoVisible = false;
    let errorGenerico = "";
    let processing = false;

    onMount(async () => {        
        await procesarPago();
    });

    async function procesarPago() {
        if (processing) return;
        processing = true;
        

        try {
            const pc = get(pagoCompleto);
            if (!pc) {
                await goto("/");
                return;
            }

            let preferences_local = get(preferences);
            if (!Array.isArray(preferences_local)) {
                preferences_local = [preferences_local];
            }


            if (preferences_local.length === 0) {
                await realizarAccionFinal(pc);
                return;
            }

            const searchParams = $page.url.searchParams;
            
            const data: DTOPago = {
                paymentId: Number.parseInt(searchParams.get("payment_id") ?? "-1"),
                status: searchParams.get("status") ?? "",
                external_reference: searchParams.get("external_reference") ?? "",
                preference_id: searchParams.get("preference_id") ?? ""
            };

            console.log(data);
            

            // Si no hay parámetros de pago, redirigir
            if (data.paymentId === -1 && data.status === "" && data.external_reference === "") {
                await goto("/");
                return;
            }

            
            if (Number.isNaN(data.paymentId) || data.status === "null") {
                goto(pc.redir);
                return;
            }
            
            // Marcar el pago como completado
            let pagoEncontrado = false;
            preferences_local.forEach((p, ix, arr) => {
                if (p.preference_id === data.preference_id) {
                    if (p.completada) {
                        errorGenericoVisible = true;
                        errorGenerico = "Esta transacción ya había sido completada.";
                    } else {
                        arr[ix].completada = true;
                        pc.pagos.push(data);
                        pagoEncontrado = true;
                    }
                }
            });

            if (!pagoEncontrado) {
                errorGenericoVisible = true;
                errorGenerico = "No se pudo identificar el pago realizado.";
                return;
            }

            preferences.set(preferences_local);
            pagoCompleto.set(pc);

            // Verificar si todos los pagos están completos
            const pagosRestantes = preferences_local.filter(p => !p.completada);
            
            if (pagosRestantes.length === 0) {
                // Todos los pagos completados - realizar la acción final
                await realizarAccionFinal(pc);
            } else {
                // Aún hay pagos pendientes - volver a la página anterior
                await goto(pc.redir || "/");
            }
        } catch (error) {
            console.error(error);
            errorGenericoVisible = true;
            errorGenerico = "Ocurrió un error al procesar el pago.";
        } finally {
            processing = false;
        }
    }

    $: exito = false;
    $: redir = "";

    async function realizarAccionFinal(pc: DTOPagoCompleto) {
        try {
            // Realizar la petición al backend
            await request(HttpRequestType.POST, pc.endpoint, true, null, JSON.stringify({
                ...pc.data,
                pagos: pc.pagos
            }));

            // Limpiar el estado
            preferences.set([]);
            pagoCompleto.set(null);

            // Redirigir
            redir = pc.redir;
            exito = true;
        } catch (error) {
            if (error instanceof HttpError) {
                errorGenerico = error.message;
                errorGenericoVisible = true;
            }
        }
    }
</script>

<div class="flex min-h-screen items-center justify-center">
    <div class="text-center">
        <h1 class="text-2xl font-bold mb-4">Procesando pago...</h1>
    </div>
</div>

<PopupError bind:visible={errorGenericoVisible}>
    {errorGenerico}
</PopupError>

<Popup title="Éxito" bind:visible={exito} fitH={true} fitW={true}>
    <p>Pago realizado exitosamente</p>
    <div class="flex justify-center items-center w-full">
        <Button action={() => {exito = !exito; goto(redir);}}>Aceptar</Button>
    </div>
</Popup>