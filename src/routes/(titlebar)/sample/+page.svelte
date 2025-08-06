<script lang="ts">
	import Button from "$lib/components/Button.svelte";
	import CheckBox from "$lib/components/CheckBox.svelte";
	import ComboBox from "$lib/components/ComboBox.svelte";
	import DatePicker, { formatDate } from "$lib/components/DatePicker.svelte";
	import MapDisplay from "$lib/components/MapDisplay.svelte";
	import Popup from "$lib/components/Popup.svelte";
	import PopupSeleccion from "$lib/components/PopupSeleccion.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import TimeRangePicker from "$lib/components/TimeRangePicker.svelte";
	import { TestService } from "$lib/services/TestService";
	import { token } from "$lib/stores";

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

    let mapSelectedPos : {x: number, y: number} = {x: -32.89713443095706, y: -68.85353962902123}
    let mapMarkerRadius : string = "100";


    $: response = ""
    async function makeRequest() {
        let resp = await TestService.endpoint();
        console.log(resp);
        response = "Respuesta recibida: " + JSON.stringify(resp);
    }

    let s1: string | null = null, e1: string | null = null;
    let s2: string | null = "09:00", e2: string | null = "17:00";
    let s3: string | null = null, e3: string | null = null;
    let s4: string | null = null, e4: string | null = null;
    let s5: string | null = null, e5: string | null = null;

    const validateTime = (start: string | null, end: string | null) => 
        !start || !end ? {valid: false, reason: "Required"} : 
        start >= end ? {valid: false, reason: "Start must be before end"} : 
        {valid: true, reason: undefined};


    function textFieldChange() {
        console.log("A");
    }

</script>

<div id="content">
    <div class="p-2 text-xs flex flex-col gap-2 overflow-y-auto grow">
        <TextField label="Leyenda" placeholder="Placeholder" bind:value={textValue} validate={validarTextField} change={textFieldChange}/>
        <p>Valor del textfield: {textValue}</p>

        {$token}

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
    
        <DatePicker range label={null} minDate={new Date()} maxDate={1755318199514}/>

        <TimeRangePicker bind:startTime={s1} bind:endTime={e1} />
        {s1} - {e1}

        <TimeRangePicker bind:startTime={s2} bind:endTime={e2} disabled={true} />

        <TimeRangePicker bind:startTime={s3} bind:endTime={e3} />

        <TimeRangePicker bind:startTime={s4} bind:endTime={e4} validate={validateTime} />

        <TimeRangePicker bind:startTime={s5} bind:endTime={e5} label={null} classes="text-orange" disableLinearDisplay={true} />
        
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

        <MapDisplay latitude={-32.89713443095706} longitude={-68.85353962902123} bind:marked={mapSelectedPos} radius={Number(mapMarkerRadius)}/>
        <TextField bind:value={mapMarkerRadius} label="Radio"/>
        <p>
            Posición seleccionada: 
            <br/>
            x: {mapSelectedPos.x}
            <br/>
            y: {mapSelectedPos.y}
        </p>

        <Button action={makeRequest}>Realizar solicitud</Button>
        <p>
            {response}
        </p>

    </div>

    <div class="flex gap-2 h-fit p-2 justify-center items-center">
        <Button>Acción 1</Button>
        <Button>Acción 2</Button>
    </div>

</div>