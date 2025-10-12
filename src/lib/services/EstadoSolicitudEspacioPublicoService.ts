import { HttpRequestType, request } from "$lib/request/request";
import type DTOAltaEstadoSolicitud from "$lib/dtos/estadossolicitudEP/DTOAltaEstadoSolicitud";
import type DTOModificarEstadoSolicitud from "$lib/dtos/estadossolicitudEP/DTOModificarEstadoSolicitud";
import type DTOEstadoSolicitud from "$lib/dtos/estadossolicitudEP/DTOEstadoSolicitud";

export const EstadoSolicitudEspacioPublicoService={
    obtenerListaEstadosSolicitud: async () => {
            let response = await request(HttpRequestType.GET, "estadoSolicitudEspacioPublico/obtenerListaEstadoSolicitud", true, null);
            return response.content as DTOEstadoSolicitud[];
    },
    altaEstadoSolicitud: async (estadoSolicitud: DTOAltaEstadoSolicitud) => {
        await request(HttpRequestType.POST, "estadoSolicitudEspacioPublico/alta", true, null, JSON.stringify(estadoSolicitud));
    },
    obtenerEstadoSolicitudCompleta: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        let response : DTOEstadoSolicitud = await request(HttpRequestType.GET, "estadoSolicitudEspacioPublico/obtenerEstadoSolicitudCompleto", true, args);
        return response;
    },
    modificarEstadoSolicitud: async (estadoSolicitud: DTOModificarEstadoSolicitud) => {
        await request(HttpRequestType.PUT, "estadoSolicitudEspacioPublico/modificar", true, null, JSON.stringify(estadoSolicitud));
    },
    bajaEstadoSolicitud: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        await request(HttpRequestType.DELETE, "estadoSolicitudEspacioPublico/baja", true, args);
    }
}