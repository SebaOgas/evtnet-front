<script lang="ts">
	import Popup from "./Popup.svelte";
	import Button from "./Button.svelte";
	import ComboBox from "./ComboBox.svelte";
	import type DTOPago from "$lib/dtos/usuarios/DTOPago";

    export let visible : boolean;

    // svelte-ignore export_let_unused
    export let monto : number;

    export let action : ((data: DTOPago) => void) | undefined = undefined;

    let cbOptions : Map<number, string> = new Map<number, string>();

    cbOptions.set(1, "Mercado Pago");

    let cbSelected : number | undefined = undefined;

    $: completado = false;

    async function realizarPago() {
        visible = false;
        if (cbSelected === undefined) return;
        let medio = cbOptions.get(cbSelected);
        if (medio === undefined) return;
        let data : DTOPago = {
			medio: medio,
			datos: {
				paymentId: undefined
			}
		};

        switch (medio) {
            case "Mercado Pago":
                // Realizar pago con mercado pago
                data.datos.paymentId = 0;
                break;
            default:

        }
        if (action !== undefined) {
            action(data);
        }
    }

</script>

<Popup title={"Realizar pago"} bind:visible={visible} fitH fitW>
    <div class="flex flex-col justify-start items-start">
        <span>
            Medio de Pago
        </span>
        <ComboBox options={cbOptions} bind:selected={cbSelected} placeholder="Seleccionar opción" maxHeight={4}/>
    </div>

    {#if cbSelected !== undefined}
        {#if cbOptions.get(cbSelected) === "Mercado Pago"}
            Formulario de Mercado Pago
            <Button action={() => {completado = true;}}>Simular que está completo</Button>
        {/if}
    {/if}
    
    <div class="flex justify-center items-center w-full gap-2 mt-2">
        <Button action={() => {visible = !visible}}>Cerrar</Button>
        <Button action={realizarPago} disabled={!completado}>Continuar</Button>
    </div>
</Popup>