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

    export let range : boolean = false;

    export let value : Date | null = new Date();

    export let startDate : Date | null = new Date();
    export let endDate : Date | null = new Date();

    export let time : boolean = false;

    export let classes : string = "";
    export let width : string = "300px";

    let isOpen = false;

    const toggleDatePicker = () => (isOpen = !isOpen);

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
    
</script>


{#if !range}
    <DatePicker bind:isOpen bind:startDate={value} enableFutureDates dowLabels={dowLabels} monthLabels={monthLabels} showTimePicker={time}>
        <div class="datepicker border flex flex-row items-center {classes}" style="width: {width};">
            <input type="text" placeholder="Seleccione la fecha" bind:value={formattedValue} on:click={toggleDatePicker} />
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <img src="icons/calendar.svg" alt="Calendario" on:click={toggleDatePicker}>
        </div>
    </DatePicker>
{:else}
    <DatePicker bind:isOpen bind:startDate bind:endDate enableFutureDates dowLabels={dowLabels} monthLabels={monthLabels} showTimePicker={time} isRange>
        <div class="datepicker border flex flex-row items-center {classes}" style="width: {width};">
            <input type="text" placeholder="Seleccione las fechas" bind:value={formattedDateRange} on:click={toggleDatePicker} />            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <img src="icons/calendar.svg" alt="Calendario" on:click={toggleDatePicker}>
        </div>
    </DatePicker>
{/if}




<style>
    .datepicker {
        border-radius: 4px;
        border: 1px solid var(--color-black) !important;
        background-color: var(--color-white);
        font-size: var(--text-xs);
        padding: 4px;
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