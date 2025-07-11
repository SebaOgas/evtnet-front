<script lang="ts">
	import Button from "$lib/components/Button.svelte";
	import CheckBox from "$lib/components/CheckBox.svelte";
	import ComboBox from "$lib/components/ComboBox.svelte";
	import DatePicker, { formatDate } from "$lib/components/DatePicker.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupSeleccion from "$lib/components/PopupSeleccion.svelte";
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


    $: popupSMVisible = false;

    async function searchSM(val: string) {
        await new Promise(resolve => setTimeout(resolve, 500));

        let m : Map<number, string> = new Map<number, string>();

        m.set(1, "Opción 1");
        m.set(2, "Opción 2");
        m.set(3, "Opción 3");

        return m;
    }

    let selectedOptions : Map<number, string> = new Map<number, string>();

    selectedOptions.set(2, "Opción 2");
    selectedOptions.set(4, "Opción 4");
    selectedOptions.set(5, "Opción 5");

    $: popupSUVisible = false;
    $: popupSUSBVisible = false;

    let selectedOptionsU : Map<number, string> = new Map<number, string>();

    selectedOptionsU.set(2, "Opción 2");

    let cbOptions : Map<number, string> = new Map<number, string>();

    cbOptions.set(1, "Opción 1");
    cbOptions.set(2, "Opción 2");
    cbOptions.set(3, "Opción 3");
    cbOptions.set(4, "Opción 4");
    cbOptions.set(5, "Opción 5");
    cbOptions.set(6, "Opción 6");
    cbOptions.set(7, "Opción 7");

    let cbSelected : number | undefined = undefined;

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

        <ComboBox options={cbOptions} bind:selected={cbSelected} placeholder="Seleccionar opción" maxHeight={5}/>
        <p>
            Valor seleccionado: {cbSelected !== undefined ? cbOptions.get(cbSelected) : "Ninguno"}
        </p>

        <Popup title="Título" bind:visible={popupVisible} fitH={true}>
            <p>Lorem ipsum y esas cosas</p>
            <Button action={() => {popupVisible = !popupVisible}}>Cerrar</Button>
        </Popup>

        <Button classes="w-full" action={() => {popupSMVisible = !popupSMVisible}}>Mostrar popup de selección múltiple</Button>
        <PopupSeleccion title="Selección múltiple" multiple={true} bind:visible={popupSMVisible} searchFunction={searchSM} bind:selected={selectedOptions}/>
        <div>
            Opciones seleccionadas:
            <ul>
                {#each selectedOptions as s}
                    <li>{s[1]}</li>
                {/each}
            </ul>
        </div>

        <Button classes="w-full" action={() => {popupSUVisible = !popupSUVisible}}>Mostrar popup de selección única</Button>
        <PopupSeleccion title="Selección única" multiple={false} bind:visible={popupSUVisible} searchFunction={searchSM} bind:selected={selectedOptionsU}/>
        
        <Button classes="w-full" action={() => {popupSUSBVisible = !popupSUSBVisible}}>Mostrar popup de selección única sin buscador</Button>
        <PopupSeleccion title="Selección única" multiple={false} noSearch={true} bind:visible={popupSUSBVisible} searchFunction={searchSM} bind:selected={selectedOptionsU}/>
        <div>
            Opción seleccionada:
                {#each selectedOptionsU as s}
                    {s[1]}
                {/each}
        </div>
    </div>

    <div class="flex gap-2 h-fit p-2 justify-center items-center">
        <Button>Acción 1</Button>
        <Button>Acción 2</Button>
    </div>

</div>