<script lang="ts">
	import Button from "$lib/components/Button.svelte";
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

    onMount(() => {
        loadGraph("xy");
    })

    $: error = "";
	$: errorVisible = false;

    let minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 100);
    let maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 1);

    let fechaDesde : Date | null;
    let fechaHasta : Date | null;

    let anios = 0;
    let meses = 0;
    let dias = 0;
    let horas = 0;    

    // @ts-ignore
    $: completo = fechaDesde !== null && fechaHasta !== null && anios >= 0 && meses >= 0 && meses <= 11 && dias >= 0 && dias <= 30 && horas >= 0 && horas <= 23 && anios !== "" && meses !== "" && dias !== "" && horas !== "";
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
        if (fechaDesde === null || fechaHasta === null || !completo) return;

        try {
            data = await ReportesService.generarRegistracionesIniciosSesion(fechaDesde, fechaHasta, anios, meses, dias, horas);
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
                x: ((new Date(r.fin)).getTime()) / 1000000,
                y: r.registraciones
            })
            iniciosSesion.dots.push({
                x: ((new Date(r.fin)).getTime()) / 1000000,
                y: r.iniciosSesion
            })
            iniciosSesionRegistraciones.dots.push({
                x: ((new Date(r.fin)).getTime()) / 1000000,
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
                left: 0.08,
                bottom: 0.12,
                right: 0.1
            },
            lineWidth: 6,
            fontSize: 40,
            fontFamily: "Montserrat",
            xLabelFunction: (l: string) => formatDate(new Date(Number(l)*1000000)),
            precision: {
                x: 0,
                y: precY
            }
        })
    };

    let canvas : HTMLCanvasElement;

    let raw : string[][] = [];
</script>

<div class="flex flex-col gap-2 justify-between">
    <div class="flex flex-col md:flex-row md:flex-wrap gap-2 md:items-center justify-between">
        <DatePicker time range label="Fechas:" classes="md:min-w-md" {minDate} {maxDate} bind:startDate={fechaDesde} bind:endDate={fechaHasta}/>
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
        <Button action={() => exportarCSV(raw, "Registraciones e inicios de sesión")}>Exportar</Button>
    </div>
{/if}


<PopupError bind:visible={errorVisible}>
    {error}
</PopupError>

