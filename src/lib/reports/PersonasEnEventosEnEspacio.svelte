<script lang="ts">
	import Button from "$lib/components/Button.svelte";
	import DatePicker, { formatDate } from "$lib/components/DatePicker.svelte";
	import { loadGraph } from "$lib/components/Plot";
	import PopupSeleccion from "$lib/components/PopupSeleccion.svelte";
	import Table, { exportarCSV } from "$lib/components/Table.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import type DTOBusquedaEspacio from "$lib/dtos/espacios/DTOBusquedaEspacio";
	import type DTOReportePersonsasEnEventosEnEspacio from "$lib/dtos/reportes/DTOReportePersonsasEnEventosEnEspacio";
	import { HttpError } from "$lib/request/request";
	import { EspaciosService } from "$lib/services/EspaciosService";
	import { ReportesService } from "$lib/services/ReportesService";
	import { onMount, tick } from "svelte";

    onMount(() => {
        loadGraph("bar");
    })

    $: error = "";
	$: errorVisible = false;

    async function buscarEspacios() {
         let aux : DTOBusquedaEspacio[] = [];
        try {
            aux = await EspaciosService.buscarEspaciosPropios();
        } catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
		}
        let ret = new Map<number, string>();
        aux.forEach(e => {
            ret.set(e.id, `${e.nombre} (${e.direccion})`)
        })
        return ret;
    }

    let espacios : Map<number, string> = new Map();
    $: espacio = espacios.size > 0 ? espacios.keys().next().value : null as number | null | undefined;

    let popupUsuarioVisible = false;

    let minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 100);
    let maxDate = new Date();

    let fechaDesde : Date | null;
    let fechaHasta : Date | null;

    $: completo = espacio !== null && espacio !== undefined && fechaDesde !== null && fechaHasta !== null;

    let data : DTOReportePersonsasEnEventosEnEspacio | null = null;

    function createColorGenerator() {
        let index = 0;

        return function getNextColor(): string {
            // Distribute hues evenly around the color wheel
            const hue = (index * 137) % 360; // spread around the color wheel
            const saturation = 70;           // keep them vibrant
            const lightness = 40;            // slightly dark for good contrast with white
            const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            index++;
            return color;
        };
        }

    // Example usage:
    const getColor = createColorGenerator();


    async function generar() {
        if (espacio === null || espacio === undefined || fechaDesde === null || fechaHasta === null) return;
        try {
            data = await ReportesService.generarPersonasEnEventosEnEspacio(espacio, fechaDesde, fechaHasta);
        } catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
            return;
		}
        let series: { name: string; values: number[]; color: string; }[] = [];

        data.datos.forEach(d => {
            series.push({
                name: d.evento,
                values: [d.participantes],
                color: getColor()
            })
        })
        
        await tick();
        
        refs.innerHTML = "";

        // @ts-ignore
        plotBar(canvas, series, [""], {
            mainAxis: "y",
            height: data.datos.length * 500,
            width: 10000,
            offset: {
                top: 0,
                left: 0.1,
                bottom: 0,
                right: 0.1,
            },
            showInverseAxis: false,
            refs: refs,
            precision: 0,
            barSize: 5,
            scaledWidth: 100,
            fontSize: 200,
            fontFamily: "Montserrat",
            lineWidth: 40,
            drawArrows: false
        })
    }

    let canvas : HTMLCanvasElement;
    let refs : HTMLDivElement;

    let raw : string[][] = [];
</script>

<PopupSeleccion title="Buscar espacio" searchFunction={buscarEspacios} bind:selected={espacios} bind:visible={popupUsuarioVisible} fitH fitW multiple={false}/>

<div class="flex flex-col md:flex-row gap-2 justify-between">
    <div class="flex flex-col md:flex-row gap-2 md:items-baseline">
        <span>Espacio: {espacio !== null && espacio !== undefined ? espacios.get(espacio) : ""}</span>
        <Button action={() => popupUsuarioVisible = true}>Seleccionar</Button>
    </div>
    <DatePicker time range label="Fechas" classes="md:min-w-sm" {minDate} {maxDate} bind:startDate={fechaDesde} bind:endDate={fechaHasta}/>
    <Button action={generar} disabled={!completo}>Generar reporte</Button>
</div>

<Warning text="No se encontraron eventos en el rango de fechas indicado." visible={data !== null && data.datos.length === 0}/>

{#if data !== null && data.datos.length > 0}
    <canvas bind:this={canvas}></canvas>
    <div class="flex flex-col justify-start items-start">
        <div>Referencias</div>
        <div bind:this={refs} class="!w-fit [&_.bar_ref_color]:aspect-square"></div>
    </div>

    <Table bind:raw={raw} cols={["Evento", "Desde", "Hasta", "Participantes"]} classes="md:min-h-fit">
        {#each data.datos as d}
        <tr>
            <td>{d.evento}</td>
            <td>{formatDate(d.fechaDesde)}</td>
            <td>{formatDate(d.fechaHasta)}</td>
            <td>{d.participantes}</td>
        </tr>
        {/each}
    </Table>

    <div class="flex flex-col md:flex-row justify-center md:justify-between gap-2 mb-2">
        <p>Reporte generado al {formatDate(data.fechaHoraGeneracion, true)}</p>
        <Button action={() => exportarCSV(raw, "Personas por evento en un espacio")}>Exportar</Button>
    </div>
{/if}

