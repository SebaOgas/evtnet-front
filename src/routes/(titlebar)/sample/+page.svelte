<script lang="ts">
	import TextField from "$lib/components/TextField.svelte";

    $: textValue = "Hola"
    $: textAreaValue = "Hola"

    function validarTextField(val: string) {
        let valid = true;
        let reason = null;
        if (val.length <= 5) {
            valid = false;
            reason = "Al menos 5 caracteres"
        }

        if (val.includes("$")) {
            valid = false;
            reason = "No se puede usar el caracter '$'"
        }

        return {
            valid: valid,
            reason: reason
        }
    }
</script>


<TextField label="Leyenda" placeholder="Placeholder" bind:value={textValue} validate={validarTextField}/>
<p>Valor del textfield: {textValue}</p>


<TextField label="Leyenda" multiline bind:value={textAreaValue}/>
<p>Valor de la textarea: {textAreaValue}</p>