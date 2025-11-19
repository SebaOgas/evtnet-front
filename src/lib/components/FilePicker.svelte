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

    export let label : string | null = "Label";
    export let classes : string = "";
    export let file : File | null = null; // sigue para compatibilidad
    export let placeholder : string = "Ningún archivo seleccionado";
    export let accept : string[] = [""];
    export let validate : (v: File | null) => {valid: boolean; reason: string | null | undefined} = (v: File | null) => {return {valid: true, reason: undefined}};
    export let buttonText: string = "Seleccionar";
    export let showFileName: boolean = true;
    
    // NUEVO: aceptar múltiples archivos
    export let multiple: boolean = false;
    export let files: File[] = [];

    function validar() {        
        if (!multiple) {
            let result = validate(file);
            valido = result.valid;
            razonInvalidez = result.reason ?? "";
        } else {
            // Si querés validar múltiples archivos, adaptá la función
            valido = true;
            razonInvalidez = "";
        }
    }
    
    $: valido = true;
    $: razonInvalidez = "";
    let acceptString = accept.reduce((acc, curr) => `${acc}, ${curr}`, "");
    let el: HTMLInputElement;
    function openInput() { el.click(); }

    $: filename = !multiple
        ? placeholder
        : files.length > 0 
            ? files.map(f => f.name).join(", ")
            : "";

    function changeFile() {     
        if (el.files !== null && el.files.length > 0) {
            if (multiple) {
                files = Array.from(el.files);
                file = files[0]; // para compatibilidad con código existente
            } else {
                file = el.files[0];
                files = [];
            }
        } else {
            file = null;
            files = [];
        }
        validar();
    }

</script>

<label class="{classes} flex flex-col md:items-center gap-2 md:flex-row mt-2 mb-2" for="inputfile">
    {#if label !== null && label !== ""}
        <span>{label}</span>
    {/if}
    <div class="flex flex-row justify-between items-center flex-wrap gap-2">
        {#if showFileName}
            <span>{filename}</span>
        {/if}
        <Button action={openInput}>{buttonText}</Button>
    </div>
    <input 
        type="file" 
        id="inputfile" 
        class="hidden" 
        bind:this={el} 
        on:change={changeFile} 
        accept={acceptString}
        {multiple} 
    >
    <Warning visible={!valido} text={razonInvalidez}/>
</label>
