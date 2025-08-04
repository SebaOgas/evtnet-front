import type DTOCronogramasEspacio from "$lib/dtos/espacios/DTOCronogramasEspacio";
import type DTODatosCreacionExcepcion from "$lib/dtos/espacios/DTODatosCreacionExcepcion";
import type DTODatosCreacionHorario from "$lib/dtos/espacios/DTODatosCreacionHorario";
import type DTODetalleCronograma from "$lib/dtos/espacios/DTODetalleCronograma";
import type DTOExcepcionesCronograma from "$lib/dtos/espacios/DTOExcepcionesCronograma";
import type DTOVerificacionVigencia from "$lib/dtos/espacios/DTOVerificacionVigencia";
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
    verificarVigencia: async (idEspacio: number, fechaDesde: Date, fechaHasta: Date) => {
        let args = new Map<string, string>();
        args.set("idEspacio", `${idEspacio}`);
        args.set("fechaDesde", `${fechaDesde}`);
        args.set("fechaHasta", `${fechaHasta}`);

        let response : DTOVerificacionVigencia = await request(HttpRequestType.GET, "cronogramas/verificarVigencia", true, args);

        return response;
    },
    crearCronograma: async (
        idEspacio: number, 
        fechaDesde: Date, 
        fechaHasta: Date, 
        diasHaciaAdelante: number
    ) => {
        let data = {
            idEspacio: idEspacio,
            fechaDesde: fechaDesde,
            fechaHasta: fechaHasta,
            diasHaciaAdelante: diasHaciaAdelante
        }

        let response : {id: number}= await request(HttpRequestType.POST, "cronogramas/crearCronograma", true, null, JSON.stringify(data));
        
        return response.id;
    },
    obtenerDatosCreacionHorario: async (idCronograma: number) => {
        let args = new Map<string, string>();
        args.set("idCronograma", `${idCronograma}`);

        let response : DTODatosCreacionHorario = await request(HttpRequestType.GET, "cronogramas/obtenerDatosCreacionHorario", true, args);

        return response;
    },
    crearHorario: async (
        idCronograma: number, 
        diaSemana: number,
        horaDesde: Date, 
        horaHasta: Date, 
        precio: number
    ) => {
        let data = {
            idCronograma: idCronograma,
            diaSemana: diaSemana,
            horaDesde: horaDesde,
            horaHasta: horaHasta,
            precio: precio
        }

        await request(HttpRequestType.POST, "cronogramas/crearHorario", true, null, JSON.stringify(data));
    },
    obtenerDatosCreacionExcepcion: async (idCronograma: number) => {
        let args = new Map<string, string>();
        args.set("idCronograma", `${idCronograma}`);

        let response : DTODatosCreacionExcepcion = await request(HttpRequestType.GET, "cronogramas/obtenerDatosCreacionExcepcion", true, args);

        return response;
    },
    crearExcepcion: async (
        idCronograma: number, 
        fechaDesde: Date, 
        fechaHasta: Date, 
        tipoExcepcion: number
    ) => {
        let data = {
            idCronograma: idCronograma,
            fechaDesde: fechaDesde,
            fechaHasta: fechaHasta,
            tipoExcepcion: tipoExcepcion
        }

        await request(HttpRequestType.POST, "cronogramas/crearExcepcion", true, null, JSON.stringify(data));
    },
}