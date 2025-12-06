<script lang="ts">
	import Button from "$lib/components/Button.svelte";
	import ComboBox from "$lib/components/ComboBox.svelte";
	import DatePicker, { formatDate } from "$lib/components/DatePicker.svelte";
	import { loadGraph } from "$lib/components/Plot";
	import PopupError from "$lib/components/PopupError.svelte";
	import Table, { exportarCSV } from "$lib/components/Table.svelte";
	import TextField from "$lib/components/TextField.svelte";
	import Warning from "$lib/components/Warning.svelte";
	import type DTOReporteRegistracionesIniciosSesion from "$lib/dtos/reportes/DTOReporteRegistracionesIniciosSesion";
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

    onMount(async () => {
        loadGraph("xy");
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

    let data : DTOReporteRegistracionesIniciosSesion | null = null;

    let rangos : {inicio: Date, fin: Date}[] = []
    let registraciones = {
        dots: [] as {
            x: number,
            y: number
        }[],
        name: "Registraciones"
    };
    let iniciosSesion = {
        dots: [] as {
            x: number,
            y: number
        }[],
        name: "Inicios de Sesión"
    };
    let iniciosSesionRegistraciones = {
        dots: [] as {
            x: number,
            y: number
        }[],
        name: "Inicios de Sesión / Registraciones"
    };

    async function generar() {
        if (fechaDesde === null || fechaHasta === null || cantidad === undefined || !completo) return;

        let horas = unidadSeleccionada * cantidad;
        
        try {
            data = await ReportesService.generarRegistracionesIniciosSesion(fechaDesde, fechaHasta, 0, 0, 0, horas);
        } catch (e) {
			if (e instanceof HttpError) {
				error = e.message;
				errorVisible = true;
			}
            return;
		}
        registraciones.dots = [];
        iniciosSesion.dots = [];
        iniciosSesionRegistraciones.dots = [];

        rangos = [];

        data.datos.forEach(r => {
            registraciones.dots.push({
                x: ((new Date(r.inicio)).getTime()) / 1000,
                y: r.registraciones
            })
            iniciosSesion.dots.push({
                x: ((new Date(r.inicio)).getTime()) / 1000,
                y: r.iniciosSesion
            })
            iniciosSesionRegistraciones.dots.push({
                x: ((new Date(r.inicio)).getTime()) / 1000,
                y: Number.isNaN(r.iniciosSesion / r.registraciones) || !Number.isFinite(r.iniciosSesion / r.registraciones) ? 0 : r.iniciosSesion / r.registraciones
            })
            if (rangos.some(r2 => r2.inicio === r.inicio && r2.fin === r.fin)) return;

            rangos.push({
                inicio: r.inicio,
                fin: r.fin
            })
        })


        await tick();

        mostrar();
    }

    let grafico : "r" | "is" | "ris" = "r";
    async function mostrar(g?: "r" | "is" | "ris") {
        if (g !== undefined)
            grafico = g;

        let func;
        let precY = 0;
        switch(grafico) {
            case "r":
                func = registraciones;
                break;
            case "is":
                func = iniciosSesion;
                break;
            case "ris":
                func = iniciosSesionRegistraciones;
                precY = 2;
                break;
            default:
                error = "Opción no válida para mostrar";
				errorVisible = true;
                return;
        }        

        await tick();

        // @ts-ignore
        plotXY(canvas, [func], {
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
                let from = formatDate(initDate, true);
                
                let endDate = new Date(Number(l)*1000 + cantidad * unidadSeleccionada * 60 * 60 * 1000);               
                //endDate.setTime(endDate.getTime() + cantidad * unidadSeleccionada);
                let to = formatDate(endDate, true);   
                
                return from + " - \n" + to;
            },
            precision: {
                x: 0,
                y: precY
            }
        })
    };

    let canvas : HTMLCanvasElement;

    let raw : string[][] = [];
</script>

<div class="flex flex-col gap-2 justify-between mb-4">
    <div>
        Analizar intervalos de tiempo entre cierto rango de fechas para saber cuántas veces los usuarios iniciaron sesión, se registraron y qué relación hay entre estas dos variables.
    </div>
    <div class="flex flex-col md:flex-row md:flex-wrap gap-2 md:items-center justify-between">
        <DatePicker time range label="Generar entre las fechas: " classes="md:min-w-xl" {minDate} {maxDate} bind:startDate={fechaDesde} bind:endDate={fechaHasta}/>
        <div class="flex flex-col md:flex-row items-center gap-2">
            <h1 class="text-xxs whitespace-nowrap">Separar en intervalos de</h1>
            <TextField bind:value={cantidad} label={null} classes="min-w-16 max-w-20 [&>input]:w-full"/>
            <ComboBox options={unidades} bind:selected={unidadSeleccionada} maxHeight={5} classes="min-w-[100px]"/>
        </div>
    </div>
    <div class="w-full flex justify-end">
        <Button action={generar} disabled={!completo}>Generar reporte</Button>
    </div>
    <div class="flex gap-2 mt-1 border rounded-lg p-1 w-full flex-wrap">
        <Button 
            action={() => mostrar("r")}
            classes="grow { grafico === "r" ? "" : "bg-white [&>span]:text-black"}"
        >
            <span>Registraciones</span>
        </Button>
        <Button 
            action={() => mostrar("is")}
            classes="grow { grafico === "is" ? "" : "bg-white [&>span]:text-black"}"
        >
            <span>Inicios de Sesión</span>
        </Button>
        <Button 
            action={() => mostrar("ris")}
            classes="grow { grafico === "ris" ? "" : "bg-white [&>span]:text-black"}"
        >
            <span>Inicios de Sesión / Registraciones</span>
        </Button>
    </div>
</div>

<Warning text={textoWarning} visible={!completo}/>
<Warning text="No se encontraron datos en el rango de fechas indicado." visible={data !== null && data.datos.length === 0}/>

{#if data !== null && data.datos.length > 0}
    <div class="w-full overflow-y-auto min-h-fit">
        <canvas bind:this={canvas}></canvas>
    </div>

    <Table bind:raw={raw} classes="md:min-h-fit [&_th]:[white-space:normal!important]" cols={["Desde", "Hasta", "Registraciones", "Inicios de sesión", "Inicios de sesión / registraciones"]}>
        {#each data.datos as d}
        <tr>
            <td>{formatDate(d.inicio, true)}</td>
            <td>{formatDate(d.fin, true)}</td>
            <td>{d.registraciones.toFixed(0)}</td>
            <td>{d.iniciosSesion.toFixed(0)}</td>
            <td>{Number.isNaN((d.iniciosSesion / d.registraciones)) || !Number.isFinite((d.iniciosSesion / d.registraciones)) ? "-" : (d.iniciosSesion / d.registraciones).toFixed(2).replaceAll(".", ",")}</td>
        </tr>
        {/each}
    </Table>

    <div class="flex flex-col md:flex-row justify-center md:justify-between gap-2 mb-2">
        <p>Reporte generado al {formatDate(data.fechaHoraGeneracion, true)}</p>
        <Button action={() => 
            exportarCSV(
                raw, 
                "Registraciones e inicios de sesión", 
                [
                    "evtnet - Registraciones e inicios de sesión",
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

