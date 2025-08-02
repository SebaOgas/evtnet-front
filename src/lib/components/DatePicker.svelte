<script lang="ts" context="module">
    export const formatDate = (date: Date | null, showTime: boolean = false) => {
        if (date === null) return "";
        if (showTime) {
            return new Date(date).toLocaleString("es-AR", { hour12: false }).slice(0, -3);
        } else {
            return new Date(date).toLocaleDateString("es-AR");
        }
    };
</script>

<script lang="ts">
    import { DatePicker } from "@svelte-plugins/datepicker";
	import Warning from "./Warning.svelte";

    export let label : string | null = "Label";

    export let validate : (start: Date | null, end: Date | null) => {valid: boolean; reason: string | null | undefined} = (start: Date | null, end: Date | null) => {return {valid: true, reason: undefined}};

    export let range : boolean = false;

    export let value : Date | null = new Date();

    export let startDate : Date | null = new Date();
    export let endDate : Date | null = new Date();

    export let time : boolean = false;

    export let classes : string = "";
    export let width : string = "350px";
    
    export let disabled : boolean = false
    
    export let disableLinearDisplay : boolean = false;
    
    $: isOpen = false;

    const toggleDatePicker = () => {
        isOpen = !isOpen;
    };

    let formattedValue : string = "";
    let formattedStartDate : string = "";
    let formattedEndDate : string = "";
    let formattedDateRange : string = "";

    $: formattedValue = formatDate(value, time);
    $: formattedStartDate = formatDate(startDate, time);
    $: formattedEndDate = formatDate(endDate, time);

    $: formattedDateRange = `${formattedStartDate} - ${formattedEndDate}`;


    let dowLabels = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

    let monthLabels = [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre'
    ];

    $: valido = true;
    $: razonInvalidez = "";

    function validar() {
        let result;
        if (!range) {
            result = validate(value, null);
        } else {
            if (endDate !== null && startDate !== null && endDate < startDate) endDate = startDate;
            result = validate(startDate, endDate);
        }
        
        valido = result.valid;
        if (result.reason === null || result.reason === undefined) {
            razonInvalidez = "";
        } else {
            razonInvalidez = result.reason;
        }
    }


    $: (() => {
        value;
        startDate;
        endDate;
        validar()
    })()


    function parseDate(dateString: string): Date | null {
        if (!dateString.trim()) return null;
        
        try {
            // Handle DD/MM/YYYY format (es-AR format)
            const ddmmyyyy = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
            if (ddmmyyyy) {
                const [, day, month, year] = ddmmyyyy;
                // Create date with correct order: year, month-1, day
                const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                return isNaN(date.getTime()) ? null : date;
            }
            
            // Handle DD/MM/YYYY HH:MM format (with time)
            const withTime = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\,\s+(\d{1,2}):(\d{2})$/);
            
            if (withTime) {
                const [, day, month, year, hour, minute] = withTime;
                // Create date with correct order: year, month-1, day, hour, minute
                const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));                
                return isNaN(date.getTime()) ? null : date;
            }            
            return null; // Don't use fallback parsing as it might flip day/month
        } catch {
            return null;
        }
    }

    function handleSingleDateInput(event: Event) {
        const target = event.target as HTMLInputElement;
        const parsed = parseDate(target.value);
        if (parsed) {
            value = parsed;
        } else {
            value = null;
        }
        validar()
    }

    function handleRangeDateInput(event: Event) {
        const target = event.target as HTMLInputElement;
        const rangeParts = target.value.split(' - ');
        
        if (rangeParts.length === 2) {
            const start = parseDate(rangeParts[0]);
            const end = parseDate(rangeParts[1]);
            
            if (start) startDate = start;
            if (end) endDate = end;
        } else {
            startDate = null;
            endDate = null;
        }
        validar();
    }
    
</script>

<label class="{classes} flex flex-col gap-2 {disableLinearDisplay ? "" : "md:flex-row"}">
    {#if label !== null}
        <span>{label}</span>
    {/if}
    {#if !range}
        <DatePicker {disabled} bind:isOpen bind:startDate={value} enableFutureDates dowLabels={dowLabels} monthLabels={monthLabels} showTimePicker={time}>
            <div class="datepicker {disabled ? "disabled" : ""} border flex flex-row items-center" style="width: {width};">
                <input type="text" {disabled} placeholder="Seleccione la fecha" bind:value={formattedValue} on:click={toggleDatePicker} on:blur={handleSingleDateInput}/>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <img src="/icons/calendar.svg" alt="Calendario">
            </div>
        </DatePicker>
    {:else}
        <DatePicker {disabled} bind:isOpen bind:startDate bind:endDate enableFutureDates dowLabels={dowLabels} monthLabels={monthLabels} showTimePicker={time} isRange>
            <div class="datepicker {disabled ? "disabled" : ""} border flex flex-row items-center" style="width: {width};">
                <input type="text" {disabled} placeholder="Seleccione las fechas" bind:value={formattedDateRange} on:click={toggleDatePicker} on:blur={handleRangeDateInput}/>            
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <img src="/icons/calendar.svg" alt="Calendario">
            </div>
        </DatePicker>
    {/if}
    <Warning visible={!valido} text={razonInvalidez}/>
    
</label>



<style>
    .datepicker {
        border-radius: 4px;
        border: 1px solid var(--color-black) !important;
        background-color: var(--color-white);
        font-size: var(--text-xs);
        padding: 4px;
    }

    :disabled, .disabled img {
        cursor: not-allowed !important;
    }

    .datepicker>input[type=text] {
        border-width: 0;
        height: 100%;
        flex: 1 1 auto;
        width: 100%;
    }

    .datepicker>img {
        cursor: pointer;
        height: 100%;
    }

    @media (max-width: 575px) {
        .datepicker {
            width: 100% !important;
        }
    }

    img {
        user-select: none;
    }


    :root {

        --datepicker-spacing: 8px !important;

        --datepicker-state-active: var(--color-dark) !important;
        --datepicker-calendar-range-selected-background: var(--datepicker-state-active) !important;
        --datepicker-calendar-range-selected-border-radius: 20px !important;
        --datepicker-calendar-range-selected-color: var(--color-white) !important;
        --datepicker-state-hover: var(--color-light) !important;

        --datepicker-calendar-range-start-end-background: var(--color-dark) !important;
        --datepicker-calendar-range-start-end-color: var(--color-white) !important;
        
        --datepicker-calendar-range-included-background: var(--color-light) !important;
        --datepicker-calendar-range-start-box-shadow-selected: inset -20px 0 0 var(--color-light) !important;
        --datepicker-calendar-range-end-box-shadow-selected: inset 20px 0 0 var(--color-light) !important;
        --datepicker-calendar-range-included-box-shadow: inset 20px 0 0 var(--color-light) !important;
        --datepicker-calendar-range-included-color: var(--color-black) !important;

        --datepicker-calendar-day-height: 40px !important;

        --datepicker-calendar-day-background-hover: var(--color-dark) !important;
        --datepicker-calendar-day-color-hover: var(--color-light) !important;

        --datepicker-calendar-header-margin: 0 0 0 0 !important;
        --datepicker-calendar-dow-margin-bottom: 0 !important;
    }
</style>