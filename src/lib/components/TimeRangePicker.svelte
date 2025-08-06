<script lang="ts" context="module">
    export const parseTime = (time: string) => {
        const hora = new Date();
        const [horaInicioH, horaInicioM] = time.split(':');
        hora.setHours(parseInt(horaInicioH), parseInt(horaInicioM), 0, 0);
        return hora;
    };
</script>
<script lang="ts">
    /**
     * Custom TimeRangePicker Component
     * Built with assistance from Claude (Anthropic)
     * Features: TypeScript, Tailwind CSS
     */
    import Warning from "./Warning.svelte";

    export let label: string | null = "Horario";
    export let validate: (start: string | null, end: string | null) => {valid: boolean; reason: string | null | undefined} = () => ({valid: true, reason: undefined});
    export let startTime: string | null = null;
    export let endTime: string | null = null;
    export let classes: string = "";
    export let disabled: boolean = false;
    export let disableLinearDisplay: boolean = false;

    let valido = true;
    let razonInvalidez = "";

    function validar() {
        const result = validate(startTime, endTime);
        valido = result.valid;
        razonInvalidez = result.reason || "";
    }

    $: {
        startTime;
        endTime;
        validar();
    }

    function handleStartTimeChange(event: Event) {
        const target = event.target as HTMLInputElement;
        startTime = target.value || null;
        
        // Auto-adjust end time if it's before start time
        /*if (startTime && endTime && endTime < startTime) {
            endTime = startTime;
        }*/
    }

    function handleEndTimeChange(event: Event) {
        const target = event.target as HTMLInputElement;
        endTime = target.value || null;
        
        // Auto-adjust end time if it's before start time
        /*if (startTime && endTime && endTime < startTime) {
            endTime = startTime;
        }*/
    }
</script>

<label class="{classes} flex flex-col gap-2 {disableLinearDisplay ? '' : 'md:flex-row'}">
    {#if label !== null}
        <span>{label}</span>
    {/if}
    
    <div class="time-range-picker border flex flex-row items-center {disabled ? 'disabled' : ''}">
        <input 
            type="time" 
            {disabled}
            placeholder="Inicio"
            value={startTime || ''}
            on:input={handleStartTimeChange}
            class="time-input"
        />
        
        <span class="separator">-</span>
        
        <input 
            type="time" 
            {disabled}
            placeholder="Fin"
            value={endTime || ''}
            on:input={handleEndTimeChange}
            class="time-input"
        />
        <span class="grow"></span>
        
        <img src="/icons/calendar.svg" alt="Calendario" class="clock-icon">
    </div>
    
    <Warning visible={!valido} text={razonInvalidez}/>
</label>

<style>
    .time-range-picker {
        border-radius: 4px;
        border: 1px solid var(--color-black) !important;
        background-color: var(--color-white);
        font-size: var(--text-xs);
        padding: 4px;
        gap: 8px;
        justify-content: space-between;
    }

    .time-input {
        border: none;
        background: transparent;
        outline: none;
        font-size: inherit;
        width: auto;
        flex: 0 0 auto;
        min-width: 60px;
    }

    .time-input::-webkit-calendar-picker-indicator {
        display: none;
        -webkit-appearance: none;
    }

    .separator {
        color: var(--color-black);
        font-weight: 500;
        padding: 0 4px;
        flex-shrink: 0;
    }
    
    .time-range-picker {
        justify-content: space-between;
    }

    .clock-icon {
        cursor: pointer;
        height: 20px;
        width: 20px;
        flex-shrink: 0;
        user-select: none;
    }

    .disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .disabled .time-input,
    .disabled .clock-icon {
        cursor: not-allowed;
    }

    @media (max-width: 575px) {
        .time-range-picker {
            width: 100% !important;
        }
    }
</style>