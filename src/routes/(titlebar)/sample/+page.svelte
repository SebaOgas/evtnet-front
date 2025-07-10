<script lang="ts">
	import Button from "$lib/components/Button.svelte";
	import CheckBox from "$lib/components/CheckBox.svelte";
	import DatePicker, { formatDate } from "$lib/components/DatePicker.svelte";
	import Popup from "$lib/components/Popup.svelte";
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

    let toggledButton : boolean = false;
    let toggledCheckbox : boolean = false;

    $: dateValue = new Date()
    $: dateValueFrom = new Date()
    $: dateValueTo = new Date()

    function validarDate(val: Date | null) {
        let valid = true;
        let reason = null;
        if (val === null) {
            valid = false;
            reason = "Ingrese la fecha"
        }

        let currDate = new Date();
        currDate.setMinutes(currDate.getMinutes() - 1)
        

        if (val !== null && val < currDate) {
            valid = false;
            reason = "La fecha no debe haber pasado"
        }
        
        return {
            valid: valid,
            reason: reason
        }
    }

    $: popupVisible = false;
</script>

<div id="content">
    <div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
        <TextField label="Leyenda" placeholder="Placeholder" bind:value={textValue} validate={validarTextField}/>
        <p>Valor del textfield: {textValue}</p>


        <TextField label="Leyenda" multiline bind:value={textAreaValue}/>
        <p>Valor de la textarea: {textAreaValue}</p>

        <Button icon="icons/check.png" action={() => alert("Hola!")}>Botón</Button>
        <Button icon="icons/check.png" toggable bind:active={toggledButton}></Button>
        <p>Valor del botón: {toggledButton ? "Activo" : "No activo"}</p>
        <Button classes="bg-orange w-full" action={() => {popupVisible = !popupVisible}}>Mostrar popup</Button>
        <Button disabled>Botón deshabilitado</Button>

        <DatePicker label="Fecha" bind:value={dateValue} validate={validarDate}/>
        <p>Fecha formateada: {formatDate(dateValue)}</p>

        <DatePicker range time label={null} bind:startDate={dateValueFrom} bind:endDate={dateValueTo}/>
        <p>Rango de fechas formateadas con hora: {formatDate(dateValueFrom, true)} - {formatDate(dateValueTo, true)}</p>
    
        <CheckBox bind:checked={toggledCheckbox}>Checkbox</CheckBox>
        <p>Valor del checkbox: {toggledCheckbox ? "Activo" : "No activo"}</p>

        <Popup title="Título" visible={popupVisible} fitH={true}>
            <p>Lorem ipsum y esas cosas</p>
            <Button action={() => {popupVisible = !popupVisible}}>Cerrar</Button>
        </Popup>
    </div>

    <div class="flex gap-2 h-fit p-2 justify-center items-center">
        <Button>Acción 1</Button>
        <Button>Acción 2</Button>
    </div>

</div>