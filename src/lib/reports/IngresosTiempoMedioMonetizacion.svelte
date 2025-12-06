<script lang="ts">
	import Button from "$lib/components/Button.svelte";
	import ComboBox from "$lib/components/ComboBox.svelte";
	import DatePicker, { formatDate } from "$lib/components/DatePicker.svelte";
	import { loadGraph } from "$lib/components/Plot";
	import PopupError from "$lib/components/PopupError.svelte";
	import Table, { exportarCSV } from "$lib/components/Table.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import type DTOReporteTiempoMedioMonetizacion from "$lib/dtos/reportes/DTOReporteTiempoMedioMonetizacion";
	import { HttpError } from "$lib/request/request";
	import { ReportesService } from "$lib/services/ReportesService";
	import { onMount, tick } from "svelte";

    let unidades : Map<number, string> = new Map([
        [1, "horas"],
        [24, "días"],
        [24*30, "meses"],
        [24*365, "años"]
    ]);
    let unidadSeleccionada : number = 24;
    let cantidad : number | undefined = 1;

    onMount(() => {
        loadGraph("bar");
    })

    $: (() => {
        if (cantidad === undefined) cantidad = 0;
    })()

    $: error = "";
	$: errorVisible = false;

    let minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 100);
    let maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 1);

    let fechaDesde : Date | null = new Date();
    fechaDesde.setDate(fechaDesde.getDate() - 7);
    let fechaHasta : Date | null = new Date(); 
 

    // @ts-ignore
    $: completo = fechaDesde !== null && fechaHasta !== null && cantidad !== undefined && unidadSeleccionada !== null;
    let textoWarning = ""
    $: (() => {
        if (completo) {
            textoWarning = "";
            return;
        }
        if (fechaDesde === null || fechaHasta === null) {
            textoWarning = "Ingrese el rango de fechas";
            return;
        }
        
        textoWarning = "Datos inválidos; verifique los filtros";
    })()

    $: (() => {
        if (cantidad !== undefined) cantidad = parseInt("" + cantidad);
        if (cantidad === undefined || Number.isNaN(cantidad) || cantidad <= 0) cantidad = 1;
    })();

    let data : DTOReporteTiempoMedioMonetizacion | null = null;

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

    let rangos : {inicio: Date, fin: Date}[] = []

    async function generar() {
        if (fechaDesde === null || fechaHasta === null || cantidad === undefined || !completo) return;

        let horas = unidadSeleccionada * cantidad;

        try {
            data = await ReportesService.generarTiempoMedioMonetizacion(fechaDesde, fechaHasta, 0, 0, 0, horas);
        } catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
            return;
		}

        rangos = [];

        let series: { name: string; values: number[]; color: string; }[] = [];
        let qMedios = data.datos[0].medios.length;

        data.datos.forEach(r => {
            if (r.medios.length !== qMedios) {
                error = "Faltan datos necesarios para generar el reporte";
				errorVisible = true;
                return;
            }

            r.medios.forEach(m => {
                let sIx = series.findIndex(s => s.name === m.nombre);
                if (sIx === -1) {
                    series.push({
						name: m.nombre,
						values: [m.monto],
						color: getColor()
					})
                } else {
                    series[sIx].values.push(m.monto);
                }
            })
            if (rangos.some(r2 => r2.inicio === r.inicio && r2.fin === r.fin)) return;

            rangos.push({
                inicio: r.inicio,
                fin: r.fin
            })
        })


        await tick();

        refs.innerHTML = "";

        // @ts-ignore
        plotBar(canvas, series, rangos.map(r => `${formatDate(r.inicio, true)} -\n ${formatDate(r.fin, true)}`), {
            height: 600,
            width: (rangos.length * 400),
            scaledWidth : rangos.length * 14,
            offset: {
                top: 0.08,
                left: 0.0,
                bottom: 0.2,
                right: 0.2 / rangos.length
            },
            lineWidth: 6,
            fontSize: 40,
            fontFamily: "Montserrat",
            refs: refs,
            precision: 0,
            barSize: 20,
            showInverseAxis: false,
            gap: {
                inner: 5,
                outer: 15
            },
            drawArrows: false
        })
    };

    let canvas : HTMLCanvasElement;
    let refs : HTMLDivElement;

    let raw : string[][] = [];
</script>

<div class="flex flex-col gap-2 justify-between mb-4">
    <div>
        Analizar intervalos de tiempo entre cierto rango de fechas para saber cuántos ingresos generó cada tipo de comisión.
    </div>
    <div class="flex flex-col md:flex-row md:flex-wrap gap-2 md:items-center justify-between">
        <DatePicker time range label="Generar entre las fechas:" classes="md:min-w-xl" {minDate} {maxDate} bind:startDate={fechaDesde} bind:endDate={fechaHasta}/>
        <div class="flex flex-col md:flex-row items-center gap-2">
            <h1 class="text-xxs whitespace-nowrap">Separar en intervalos de</h1>
            <TextField bind:value={cantidad} label={null} classes="min-w-16 max-w-20 [&>input]:w-full"/>
            <ComboBox options={unidades} bind:selected={unidadSeleccionada} maxHeight={5} classes="min-w-[100px]"/>
        </div>
    </div>
    <div class="w-full flex justify-end">
        <Button action={generar} disabled={!completo}>Generar reporte</Button>
    </div>
</div>

<Warning text={textoWarning} visible={!completo}/>
<Warning text="No se encontraron datos en el rango de fechas indicado." visible={data !== null && data.datos.length === 0}/>

{#if data !== null && data.datos.length > 0}
    <div class="w-full overflow-y-auto min-h-fit">
        <canvas bind:this={canvas}></canvas>
    </div>
    <div class="flex flex-col justify-start items-start">
        <div>Referencias</div>
        <div bind:this={refs} class="!w-fit [&_.bar_ref_color]:aspect-square"></div>
    </div>

    <Table bind:raw={raw} classes="md:min-h-fit [&_th]:[white-space:normal!important]" cols={["Rango", ...data.datos[0].medios.map(m => m.nombre)]}>
        {#each data.datos as d}
        <tr>
            <td>{formatDate(d.inicio, true)} - {formatDate(d.fin, true)}</td>
            {#each d.medios as m}
                <td>{m.monto.toFixed(2).replaceAll(".", ",")}</td>
            {/each}
        </tr>
        {/each}
    </Table>

    <div class="flex flex-col md:flex-row justify-center md:justify-between gap-2 mb-2">
        <p>Reporte generado al {formatDate(data.fechaHoraGeneracion, true)}</p>
        <Button action={() => 
            exportarCSV(
                raw, 
                "Ingresos por medio de monetización", 
                [
                    "evtnet - Ingresos por medio de monetización",
                    `Reporte generado al ${ data !== null ? formatDate(data.fechaHoraGeneracion, true) : formatDate(new Date(), true)}`,
                    `Fechas: ${formatDate(fechaDesde, true)} - ${formatDate(fechaHasta, true)}`,
                    `Longitud de intervalos: ${cantidad} ${unidades.get(unidadSeleccionada)}`
                ])
            }>
            Exportar
        </Button>
    </div>
{/if}


<PopupError bind:visible={errorVisible}>
    {error}
</PopupError>

