<script lang="ts">
	import Warning from "./Warning.svelte";

    export let label : string | null = "Label"
    export let min : number = 0
    export let max : number = 50
    export let placeholder : string = ""
    export let value : string = ""

    export let validate : (v: string) => {valid: boolean; reason: string | null | undefined} = (v: string) => {return {valid: true, reason: undefined}};

    export let classes : string = ""
    
    export let action : () => void = () => {}

    export let change : () => void = () => {}
    
    export let disabled : boolean = false

    export let disableLinearDisplay : boolean = false;

    export let forceValidate : boolean = false;

    //Para textarea
    export let multiline : boolean = false
    export let resize : boolean = false
    export let rows : number = 4

    //Para password
    export let isPassword : boolean = false;

    $: valido = true;
    $: razonInvalidez = "";

    function validar()  {
        let result = validate(value);
        valido = result.valid;
        if (result.reason === null || result.reason === undefined) {
            razonInvalidez = "";
        } else {
            razonInvalidez = result.reason;
        }
    }

    function onKeyDown(event: KeyboardEvent) {
        change();
        if (event.key === "Enter")
            action();
    }

    $: (() => {
        if (forceValidate) {
            validar();
        }
    })()

</script>


<label class="{classes} flex flex-col gap-2 {disableLinearDisplay ? "" : "md:flex-row"} mt-2 mb-2">
    {#if label !== null}
        <span>{label}</span>
    {/if}
    {#if !multiline}
        <input {disabled} type="{!isPassword ? "text" : "password"}" on:focusout={validar} on:keydown={onKeyDown} placeholder={placeholder} bind:value minlength={min} maxlength={max} class="border border-solid rounded-lg" >
    {:else}
        <textarea {disabled} on:focusout={validar} on:keydown={onKeyDown} placeholder={placeholder} bind:value minlength={min} maxlength={max} rows={rows} class="border border-solid rounded-lg w-full" style="resize:{resize?"vertical":"none"}"></textarea>
    {/if}
    <Warning visible={!valido} text={razonInvalidez}/>
    
</label>

<style>
    input, textarea {
        padding-left: 4px;
        padding-right: 4px;
        flex: 1 1 auto;
    }

    input:disabled, textarea:disabled {
        border-color: var(--color-dark);
        color: var(--color-dark);
        cursor: not-allowed;
    }
</style>

