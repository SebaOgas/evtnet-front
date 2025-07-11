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

    //Para textarea
    export let multiline : boolean = false
    export let resize : boolean = false
    export let rows : number = 4

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
</script>


<label class="{classes} flex flex-col gap-2 md:flex-row">
    {#if label !== null}
        <span>{label}</span>
    {/if}
    {#if !multiline}
        <input type="text" on:focusout={validar} on:keydown={onKeyDown} placeholder={placeholder} bind:value minlength={min} maxlength={max} class="border border-solid rounded-lg" >
    {:else}
        <textarea on:focusout={validar} on:keydown={onKeyDown} placeholder={placeholder} bind:value minlength={min} maxlength={max} rows={rows} class="border border-solid rounded-lg w-full" style="resize:{resize?"vertical":"none"}"></textarea>
    {/if}
    <Warning visible={!valido} text={razonInvalidez}/>
    
</label>

<style>
    input, textarea {
        padding-left: 4px;
        padding-right: 4px;
        flex: 1 1 auto;
    }
</style>

