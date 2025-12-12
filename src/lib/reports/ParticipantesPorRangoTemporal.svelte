<script lang="ts">
	import Button from "$lib/components/Button.svelte";
	import CheckBox from "$lib/components/CheckBox.svelte";
	import ComboBox from "$lib/components/ComboBox.svelte";
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
	import { user, username } from "$lib/stores";
	import { onMount, tick } from "svelte";
	import { get } from "svelte/store";

    let unidades : Map<number, string> = new Map([
        [1, "horas"],
        [24, "días"],
        [24*30, "meses"],
        [24*365, "años"]
    ]);
    let unidadSeleccionada : number = 24;
    let cantidad : number | undefined = 1;

    onMount(() => {
        loadGraph("xy");
    })

    $: (() => {
        if (cantidad === undefined) cantidad = 0;
    })()

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

    let fechaDesde : Date | null = new Date();
    fechaDesde.setDate(fechaDesde.getDate() - 7);
    let fechaHasta : Date | null = new Date();   

    $: usarHoras = unidadSeleccionada === 1;

    // @ts-ignore
    $: completo = fechaDesde !== null && fechaHasta !== null && cantidad !== undefined && unidadSeleccionada !== null;
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
        
        textoWarning = "Datos inválidos; verifique los filtros";
    })()

    $: (() => {
        if (cantidad !== undefined) cantidad = parseInt("" + cantidad);
        if (cantidad === undefined || Number.isNaN(cantidad) || cantidad <= 0) cantidad = 1;
    })();

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
        if (fechaDesde === null || fechaHasta === null || cantidad === undefined || !completo) return;

        let horas = unidadSeleccionada * cantidad;

        let desde = new Date(fechaDesde);
        let hasta = new Date(fechaHasta);

        if (!usarHoras) {
            desde = new Date(desde.toDateString());
            hasta = new Date(hasta.toDateString());
        }

        try {
            data = await ReportesService.generarParticipantesPorRangoTemporal(todosLosEspacios, Array.from(espacios.keys()), desde, hasta, 0, 0, 0, horas);
        } catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
            return;
		}

        rangos = [];

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
                    x: ((new Date(r.inicio)).getTime()) / 1000,
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

        refs.innerHTML = "";

        // @ts-ignore
        plotXY(canvas, functions, {
            height: 500,
            width: (rangos.length <= 8 ? 1000 : 1000 + (rangos.length - 8) * 100)*2,
            scaledWidth : rangos.length <= 8 ? 100 : 100 + (rangos.length - 8) * 10,
            biggerDots: true,
            labelMethod: {
                x: "marks",
                y: "gcd"
            },
            marks: {
                x: rangos.length - 1,
                y: 8
            },
            offset: {
                top: 0.1,
                left: 0.2,
                bottom: 0.15,
                right: 0.2
            },
            lineWidth: 6,
            fontSize: 20,
            fontFamily: "Montserrat",
            xLabelFunction: (l: string) => {                
                if (cantidad === undefined) cantidad = 1;
                
                let initDate = new Date(Number(l)*1000);
                let from = formatDate(initDate, usarHoras);
                
                let endDate = new Date(Number(l)*1000 + cantidad * unidadSeleccionada * 60 * 60 * 1000);               
                //endDate.setTime(endDate.getTime() + cantidad * unidadSeleccionada);
                let to = formatDate(endDate, usarHoras);   
                
                return from + " - \n" + to;
            },
            refs: refs
        })
    }

    let canvas : HTMLCanvasElement;
    let refs : HTMLDivElement;

    let raw : string[][] = [];
</script>

<PopupSeleccion title="Buscar espacios" searchFunction={buscarEspacios} bind:selected={espacios} bind:visible={popupUsuarioVisible} fitH fitW/>

<div class="flex flex-col gap-2 justify-between">
    <div>
        Analizar la cantidad de participantes en eventos realizados por cada espacio y subespacio a lo largo del tiempo.
    </div>
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
        <DatePicker time={usarHoras} range label="Generar entre las fechas: " classes="md:min-w-xl" {minDate} bind:startDate={fechaDesde} bind:endDate={fechaHasta}/>
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

    <Table bind:raw={raw} classes="md:min-h-fit [&_th]:[white-space:normal!important]" cols={["Espacio - Subespacio", rangos.map(r => `${formatDate(r.inicio, usarHoras)} - ${formatDate(r.fin, usarHoras)}`)].flat()}>
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
        <Button action={() => 
            exportarCSV(
                raw, 
                "Participantes en eventos por rango temporal", 
                [
                    "evtnet - Participantes en eventos por rango temporal",
                    `Reporte generado al ${ data !== null ? formatDate(data.fechaHoraGeneracion, true) : formatDate(new Date(), true)}`,
                    `Fechas: ${formatDate(fechaDesde, usarHoras)} - ${formatDate(fechaHasta, usarHoras)}`,
                    `Longitud de intervalos: ${cantidad} ${unidades.get(unidadSeleccionada)}`,
                    `Generado por: ${get(user)?.apellido}, ${get(user)?.nombre} (@${get(username)})`,
                    `Espacios: ${espacios.size === 0 ? "Todos los espacios de los que el usuario es propietario" :  espacios.values().reduce((acc, curr) => `${acc}, ${curr}`)}`,
                ])
            }>
            Exportar
        </Button>
    </div>
{/if}


<PopupError bind:visible={errorVisible}>
    {error}
</PopupError>

