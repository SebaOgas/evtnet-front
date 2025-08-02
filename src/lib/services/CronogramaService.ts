import type DTOCronogramasEspacio from "$lib/dtos/espacios/DTOCronogramasEspacio";
import type DTODetalleCronograma from "$lib/dtos/espacios/DTODetalleCronograma";
import type DTOExcepcionesCronograma from "$lib/dtos/espacios/DTOExcepcionesCronograma";
import { HttpRequestType, request } from "$lib/request/request";


export const CronogramaService = {
    obtenerCronogramasEspacio: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);

        let response : DTOCronogramasEspacio = await request(HttpRequestType.GET, "cronogramas/obtenerCronogramasEspacio", true, args);

        return response;
    },
    obtenerDetalleCronograma: async (idCronograma: number) => {
        let args = new Map<string, string>();
        args.set("idCronograma", `${idCronograma}`);

        let response : DTODetalleCronograma = await request(HttpRequestType.GET, "cronogramas/obtenerDetalleCronograma", true, args);

        return response;
    },
    eliminarHorario: async (idHorario: number) => {
        let args = new Map<string, string>();
        args.set("idHorario", `${idHorario}`);

        await request(HttpRequestType.DELETE, "cronogramas/eliminarHorario", true, args);
    },
    obtenerExcepcionesCronograma: async (idCronograma: number) => {
        let args = new Map<string, string>();
        args.set("idCronograma", `${idCronograma}`);

        let response : DTOExcepcionesCronograma = await request(HttpRequestType.GET, "cronogramas/obtenerExcepcionesCronograma", true, args);

        return response;
    },
    eliminarExcepcion: async (idExcepcion: number) => {
        let args = new Map<string, string>();
        args.set("idExcepcion", `${idExcepcion}`);

        await request(HttpRequestType.DELETE, "cronogramas/eliminarExcepcion", true, args);
    },
}