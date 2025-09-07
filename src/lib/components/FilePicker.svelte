<script lang="ts" context="module">
    export const generateFileUrl = (file: File | null) => {
        if (file === null) return "";
        return URL.createObjectURL(file);
    };

    export const getImageFileDimensions = async (file: File | null) => {
        if (file === null) return {w: 0, h: 0};
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        
        try {
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = objectUrl;
            });
            
            return { w: img.width, h: img.height };
        } finally {
            URL.revokeObjectURL(objectUrl);
        }
    }
</script>

<script lang="ts">

	import Button from "./Button.svelte";
	import Warning from "./Warning.svelte";

    export let label : string | null = "Label"

    export let classes : string = ""

    export let file : File | null = null;

    export let placeholder : string = "Ningún archivo seleccionado"

    export let accept : string[] = [""];

    export let validate : (v: File | null) => {valid: boolean; reason: string | null | undefined} = (v: File | null) => {return {valid: true, reason: undefined}};

    export let buttonText: string = "Seleccionar";
    export let showFileName: boolean = true;

    function validar()  {        
        let result = validate(file);
       
        valido = result.valid;
        if (result.reason === null || result.reason === undefined) {
            razonInvalidez = "";
        } else {
            razonInvalidez = result.reason;
        }
    }
    
    $: valido = true;
    $: razonInvalidez = "";

    let acceptString = accept.reduce((acc, curr) => `${acc}, ${curr}`, "")

    let el: HTMLInputElement;

    function openInput() {
        el.click();
    }

    $: filename = placeholder

    function changeFile() {     
        if (el.files !== null && el.files[0] !== undefined) {
            file = el.files[0]
            filename = el.files[0].name;
        } else {
            file = null
            filename = placeholder
        }  
        validar(); 
    }

</script>




<label class="{classes} flex flex-col md:items-center gap-2 md:flex-row mt-2 mb-2" for="inputfile">
    {#if label !== null}
        <span>{label}</span>
    {/if}
    <div class="flex flex-row justify-between items-center flex-wrap gap-2">
        {#if showFileName}
            <span>{filename}</span>
        {/if}
        <Button action={openInput}>{buttonText}</Button>
    </div>
    <input type="file" id="inputfile" class="hidden" bind:this={el} on:change={changeFile} accept={acceptString}>
    <Warning visible={!valido} text={razonInvalidez}/>
</label>