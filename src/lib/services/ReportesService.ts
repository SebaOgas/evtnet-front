import type DTOReporteEventosPorEspacio from "$lib/dtos/reportes/DTOReporteEventosPorEspacio";
import type DTOReporteParticipantesPorRangoTemporal from "$lib/dtos/reportes/DTOReporteParticipantesPorRangoTemporal";
import type DTOReportePersonsasEnEventosEnEspacio from "$lib/dtos/reportes/DTOReportePersonsasEnEventosEnEspacio";
import { HttpRequestType, request } from "$lib/request/request";

export const ReportesService = {
    // #US_REP_1
    generarPersonasEnEventosEnEspacio: async (espacioId: number, fechaDesde: Date, fechaHasta: Date) => {
        let args = new Map<string, string>();
        args.set("espacioId", `${espacioId}`);
        args.set("fechaDesde", `${(new Date(fechaDesde)).getTime()}`);
        args.set("fechaHasta", `${(new Date(fechaHasta)).getTime()}`);

        let response : DTOReportePersonsasEnEventosEnEspacio = await request(HttpRequestType.GET, "reportes/generarPersonasEnEventosEnEspacio", true, args);

        return response;
    },
    // #US_REP_2
    generarEventosPorEspacio: async (espacios: number[], fechaDesde: Date, fechaHasta: Date) => {
        let args = new Map<string, string>();
        espacios.forEach(e => {
            args.set("espacios", `${e}`);
        })
        args.set("fechaDesde", `${(new Date(fechaDesde)).getTime()}`);
        args.set("fechaHasta", `${(new Date(fechaHasta)).getTime()}`);

        let response : DTOReporteEventosPorEspacio = await request(HttpRequestType.GET, "reportes/generarEventosPorEspacio", true, args);

        return response;
    },
    // #US_REP_3
    generarParticipantesPorRangoTemporal: async (todosLosEspacios: boolean, espacios: number[], fechaDesde: Date, fechaHasta: Date, anios: number, meses: number, dias: number, horas: number) => {
        let args = new Map<string, string>();
        args.set("todosLosEspacios", `${todosLosEspacios}`);
        espacios.forEach(e => {
            args.set("espacios", `${e}`);
        })
        args.set("fechaDesde", `${(new Date(fechaDesde)).getTime()}`);
        args.set("fechaHasta", `${(new Date(fechaHasta)).getTime()}`);
        args.set("anios", `${anios}`);
        args.set("meses", `${meses}`);
        args.set("dias", `${dias}`);
        args.set("horas", `${horas}`);

        let response : DTOReporteParticipantesPorRangoTemporal = await request(HttpRequestType.GET, "reportes/generarParticipantesPorRangoTemporal", true, args);

        return response;
    },
}