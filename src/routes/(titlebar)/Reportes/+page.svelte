<script lang="ts">
	import ComboBox from "$lib/components/ComboBox.svelte";
	import EventosPorEspacio from "$lib/reports/EventosPorEspacio.svelte";
	import IngresosTiempoMedioMonetizacion from "$lib/reports/IngresosTiempoMedioMonetizacion.svelte";
	import ParticipantesPorRangoTemporal from "$lib/reports/ParticipantesPorRangoTemporal.svelte";
	import PersonasEnEventosEnEspacio from "$lib/reports/PersonasEnEventosEnEspacio.svelte";
	import RegistracionesIniciosSesion from "$lib/reports/RegistracionesIniciosSesion.svelte";
	import { permisos } from "$lib/stores";
	import { onMount } from "svelte";
	import { get } from "svelte/store";

    let reportes : Map<string, string> = new Map();
    let reporteSeleccionado : string | null = null;

    let permisoBasico = false;
    let permisoGeneral = false;

    onMount(() => {
        let permisosList : string[] = get(permisos);
        permisoBasico = permisosList.includes("VisionReportes");
        permisoGeneral = permisosList.includes("VisionReportesGenerales");

        if (permisoBasico) {
            reportes.set("PERSONAS_EN_EVENTOS_EN_ESPACIO", "Cantidad de personas en eventos en mi espacio");
            reportes.set("EVENTOS_POR_ESPACIO", "Cantidad de eventos por espacio");
            reportes.set("PARTICIPANTES_POR_ESPACIO_Y_TIEMPO", "Participantes en eventos por rango temporal");
        }

        if (permisoGeneral) {
            reportes.set("REGISTRACIONES_E_INICIOS_DE_SESION", "Registraciones e inicios de sesión");
            reportes.set("INGRESOS_POR_TIEMPO_Y_MEDIO", "Ingresos por tiempo y por medio de monetización");
        }
    })


</script>

<div id="content" class="p-2 h-full overflow-y-auto">
    <div class="flex flex-col md:flex-row items-baseline gap-2 mb-4">
        <h1 class="text-m">Reportes</h1>
        <ComboBox options={reportes} bind:selected={reporteSeleccionado} placeholder="Seleccionar reporte" maxHeight={6}/>
    </div>


    {#if reporteSeleccionado === "PERSONAS_EN_EVENTOS_EN_ESPACIO"}
        <PersonasEnEventosEnEspacio/> 
    {:else if reporteSeleccionado === "EVENTOS_POR_ESPACIO"}
        <EventosPorEspacio/>
    {:else if reporteSeleccionado === "PARTICIPANTES_POR_ESPACIO_Y_TIEMPO"}
        <ParticipantesPorRangoTemporal/>
    {:else if reporteSeleccionado === "REGISTRACIONES_E_INICIOS_DE_SESION"}
        <RegistracionesIniciosSesion/>
    {:else if reporteSeleccionado === "INGRESOS_POR_TIEMPO_Y_MEDIO"}
        <IngresosTiempoMedioMonetizacion/>
    {/if}
</div>