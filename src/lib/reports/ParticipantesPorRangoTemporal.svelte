<script lang="ts">
	import Button from "$lib/components/Button.svelte";
	import CheckBox from "$lib/components/CheckBox.svelte";
	import DatePicker, { formatDate } from "$lib/components/DatePicker.svelte";
	import { loadGraph } from "$lib/components/Plot";
	import PopupError from "$lib/components/PopupError.svelte";
	import PopupSeleccion from "$lib/components/PopupSeleccion.svelte";
	import Table, { exportarCSV } from "$lib/components/Table.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import type DTOBusquedaEspacio from "$lib/dtos/espacios/DTOBusquedaEspacio";
	import type DTOReporteParticipantesPorRangoTemporal from "$lib/dtos/reportes/DTOReporteParticipantesPorRangoTemporal";
	import { HttpError } from "$lib/request/request";
	import { EspaciosService } from "$lib/services/EspaciosService";
	import { ReportesService } from "$lib/services/ReportesService";
	import { onMount, tick } from "svelte";

    onMount(() => {
        loadGraph("xy");
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

    let todosLosEspacios = true;
    let espacios : Map<number, string> = new Map();

    let popupUsuarioVisible = false;

    let minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 100);
    let maxDate = new Date();

    let fechaDesde : Date | null;
    let fechaHasta : Date | null;

    let anios = 0;
    let meses = 0;
    let dias = 0;
    let horas = 0;    

    // @ts-ignore
    $: completo = (todosLosEspacios || espacios.size > 0) && fechaDesde !== null && fechaHasta !== null && anios >= 0 && meses >= 0 && meses <= 11 && dias >= 0 && dias <= 30 && horas >= 0 && horas <= 23 && anios !== "" && meses !== "" && dias !== "" && horas !== "";
    let textoWarning = ""
    $: (() => {
        if (completo) {
            textoWarning = "";
            return;
        }
        if (!todosLosEspacios && espacios.size === 0) {
            textoWarning = "Seleccione al menos un espacio";
            return;
        }
        if (fechaDesde === null || fechaHasta === null) {
            textoWarning = "Ingrese el rango de fechas";
            return;
        }
        if (anios < 0) {
            textoWarning = "Especifique un número de años de 0 o mayor";
            return;
        }
        if (meses < 0 || meses > 11) {
            textoWarning = "Especifique un número de meses entre 0 y 11";
            return;
        }
        if (dias < 0 || dias > 30) {
            textoWarning = "Especifique un número de días entre 0 y 30";
            return;
        }
        if (horas < 0 || horas > 23) {
            textoWarning = "Especifique un número de horas entre 0 y 23";
            return;
        }
        
        textoWarning = "Datos inválidos; verifique los filtros";
    })()

    let data : DTOReporteParticipantesPorRangoTemporal | null = null;

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
        if (fechaDesde === null || fechaHasta === null || !completo) return;

        try {
            data = await ReportesService.generarParticipantesPorRangoTemporal(todosLosEspacios, Array.from(espacios.keys()), fechaDesde, fechaHasta, anios, meses, dias, horas);
        } catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
            return;
		}

        let functions : {
            dots: {
                x: number,
                y: number
            }[],
            name: string,
            color: string
        }[] = []

        data.datos.forEach(e => {
            let fun = {
                dots: [] as {x: number, y: number}[],
                name: e.espacio,
                color: getColor()
            }
            e.rangos.forEach(r => {
                fun.dots.push({
                    //x: ((new Date(r.fin)).getTime() + (new Date(r.inicio)).getTime()) / 2 / 1000000,
                    x: ((new Date(r.fin)).getTime()) / 1000000,
                    y: r.participantes
                })
                if (rangos.some(r2 => r2.inicio === r.inicio && r2.fin === r.fin)) return;

                rangos.push({
                    inicio: r.inicio,
                    fin: r.fin
                })
            })

            functions.push(fun);
        })
        
        await tick();

        // @ts-ignore
        plotXY(canvas, functions, {
            height: 500 * 2,
            width: (rangos.length <= 8 ? 1000 : 1000 + (rangos.length - 8) * 100)*2,
            scaledWidth : rangos.length <= 8 ? 100 : 100 + (rangos.length - 8) * 10,
            biggerDots: true,
            labelMethod: {
                x: "marks",
                y: "marks"
            },
            marks: {
                x: rangos.length - 1,
                y: 8
            },
            offset: {
                top: 0.1,
                left: 0.05,
                bottom: 0.12,
                right: 0.1
            },
            lineWidth: 6,
            fontSize: 40,
            fontFamily: "Montserrat",
            xLabelFunction: (l: string) => formatDate(new Date(Number(l)*1000000)),
            refs: refs
        })
    }

    let canvas : HTMLCanvasElement;
    let refs : HTMLDivElement;

    let raw : string[][] = [];
</script>

<PopupSeleccion title="Buscar espacios" searchFunction={buscarEspacios} bind:selected={espacios} bind:visible={popupUsuarioVisible} fitH fitW/>

<div class="flex flex-col gap-2 justify-between">
    <CheckBox bind:checked={todosLosEspacios}>Todos los espacios</CheckBox>
    <div class="flex flex-col md:flex-row gap-2 md:items-baseline md:justify-between">
        <span>Espacios: 
            <span class="commaList">
                {#each espacios.values() as e}
                    <span>{e}</span>
                {/each}
            </span>
        </span>
        <Button action={() => popupUsuarioVisible = true}>Seleccionar</Button>
    </div>
    <div class="flex flex-col md:flex-row md:flex-wrap gap-2 md:items-center justify-between">
        <DatePicker time range label="Fechas:" classes="md:min-w-md" {minDate} bind:startDate={fechaDesde} bind:endDate={fechaHasta}/>
        <div class="flex flex-row gap-2 justify-start items-baseline flex-wrap">
            <span>Rango:</span>
            <span class="flex gap-2 items-baseline w-fit">
                <TextField bind:value={anios} label={null} classes="min-w-16 max-w-20 [&>input]:w-full"/>
                <span>años</span>
            </span>
            <span class="flex gap-2 items-baseline w-fit">
                <TextField bind:value={meses} label={null} classes="min-w-16 max-w-20 [&>input]:w-full"/>
                <span>meses</span>
            </span>
            <span class="flex gap-2 items-baseline w-fit">
                <TextField bind:value={dias} label={null} classes="min-w-16 max-w-20 [&>input]:w-full"/>
                <span>días</span>
            </span>
            <span class="flex gap-2 items-baseline w-fit">
                <TextField bind:value={horas} label={null} classes="min-w-16 max-w-20 [&>input]:w-full"/>
                <span>horas</span>
            </span>
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

    <Table bind:raw={raw} classes="md:min-h-fit [&_th]:[white-space:normal!important]" cols={["Espacio", rangos.map(r => `${formatDate(r.inicio, true)} - ${formatDate(r.fin, true)}`)].flat()}>
        {#each data.datos as d}
        <tr>
            <td>{d.espacio}</td>
            {#each rangos as r}
                <td>{(() => {let aux = d.rangos.find(r2 => r2.inicio === r.inicio && r2.fin === r.fin); return aux === undefined ? 0 : aux.participantes})()}</td>
            {/each}
        </tr>
        {/each}
    </Table>

    <div class="flex flex-col md:flex-row justify-center md:justify-between gap-2 mb-2">
        <p>Reporte generado al {formatDate(data.fechaHoraGeneracion, true)}</p>
        <Button action={() => exportarCSV(raw, "Participantes en eventos por rango temporal")}>Exportar</Button>
    </div>
{/if}


<PopupError bind:visible={errorVisible}>
    {error}
</PopupError>

