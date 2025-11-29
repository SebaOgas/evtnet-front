<script lang="ts">
	import Warning from "./Warning.svelte";

    export let label : string | null = "Label"
    export let min : number = 0
    export let max : number = 50
    export let placeholder : string = ""
    export let value : string | number = ""

    export let validate : (v: string) => {valid: boolean; reason: string | null | undefined} = (v: string) => {return {valid: true, reason: undefined}};

    export let classes : string = ""
    
    export let action : () => void = () => {}

    export let change : () => void = () => {}
    
    export let disabled : boolean = false

    export let disableLinearDisplay : boolean = false;

    export let forceValidate : boolean = false;

    export let integer : boolean = false;

    //Para textarea
    export let multiline : boolean = false
    export let resize : boolean = false
    export let rows : number = 4

    //Para password
    export let isPassword : boolean = false;

    //Para wrap
    export let wrap : boolean = false;

    $: valido = true;
    $: razonInvalidez = "";

    $: (() => {
        if (!integer) return;

        if (typeof value === "string")
			value = parseInt(value);
		if (Number.isNaN(value)) value = 0;
    })()

    function validar()  {
        let result = validate("" + value);
        valido = result.valid;
        if (result.reason === null || result.reason === undefined) {
            razonInvalidez = "";
        } else {
            razonInvalidez = result.reason;
        }
    }

    function onKeyDown(event: KeyboardEvent) {
        if (event.key === "Enter" && !useTextarea)
            action();
        else if (event.key === "Enter" && useTextarea && !event.shiftKey) {
            event.preventDefault();
            action();
        }
    }

    $: (() => {
        if (forceValidate) {
            validar();
        }
    })()

    $: useTextarea = multiline || (!multiline && wrap);

</script>


<label class="{classes} flex flex-col gap-2 {disableLinearDisplay ? "" : "md:flex-row"} mt-2 mb-2">
    {#if label !== null && label !== ""}
        <span>{label}</span>
    {/if}
    {#if !useTextarea}
        <input {disabled} type="{!isPassword ? "text" : "password"}" on:focusout={validar} on:keydown={onKeyDown} on:keyup={change} placeholder={placeholder} bind:value minlength={min} maxlength={max} class="border border-solid rounded-lg h-fit">
    {:else}
        <textarea {disabled} on:focusout={validar} on:keydown={onKeyDown} on:keyup={change} placeholder={placeholder} bind:value minlength={min} maxlength={max} rows={multiline ? rows : 1} class="border border-solid rounded-lg w-full {wrap ? 'auto-resize' : ''}" style="resize:{multiline && resize ? "vertical" : "none"}; {wrap ? `max-height: calc(1.5em * ${rows} + 8px); overflow-y: auto;` : ''}"></textarea>
    {/if}
    <Warning visible={!valido} text={razonInvalidez} classes="h-fit"/>
    
</label>

<style>
    input,     textarea {
        padding-left: 4px;
        padding-right: 4px;
        flex: 1 1 auto;
    }

    .auto-resize {
        field-sizing: content;
        min-height: 1.5em;
        overflow-wrap: break-word;
        word-break: break-word;
    }

    input:disabled, textarea:disabled {
        border-color: var(--color-dark);
        color: var(--color-dark);
        cursor: not-allowed;
    }
</style>