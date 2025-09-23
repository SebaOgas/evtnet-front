import { HttpRequestType, request } from "$lib/request/request";
import type DTOAltaEstadoDenuncia from "$lib/dtos/estadosdenuncia/DTOAltaEstadoDenuncia";
import type DTOModificarEstadoDenuncia from "$lib/dtos/estadosdenuncia/DTOModificarEstadoDenuncia";
import type DTOEstadoDenuncia from "$lib/dtos/estadosdenuncia/DTOEstadoDenuncia";

export const EstadoSolicitudEspacioPublicoService={
    obtenerListaEstadosSolicitud: async () => {
            let response : DTOEstadoDenuncia[]= await request(HttpRequestType.GET, "estadoSolicitudEspacioPublico/obtenerListaEstadoSolicitud", true, null);
            return response;
    },
    altaEstadoSolicitud: async (EstadoDenuncia: DTOAltaEstadoDenuncia) => {
        await request(HttpRequestType.PUT, "estadoSolicitudEspacioPublico/alta", true, null, JSON.stringify(EstadoDenuncia));
    },
    obtenerEstadoSolicitudCompleta: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        let response : DTOEstadoDenuncia = await request(HttpRequestType.GET, "estadoSolicitudEspacioPublico/obtenerEstadoSolicitudCompleta", true, args);
        return response;
    },
    modificarEstadoSolicitud: async (EstadoDenuncia: DTOModificarEstadoDenuncia) => {
        await request(HttpRequestType.PUT, "estadoSolicitudEspacioPublico/modificar", true, null, JSON.stringify(EstadoDenuncia));
    },
    bajaEstadoSolicitud: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        await request(HttpRequestType.DELETE, "estadoSolicitudEspacioPublico/baja", true, args);
    }
}