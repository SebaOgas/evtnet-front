import { HttpRequestType, request } from "$lib/request/request";
import type DTOAltaEstadoDenuncia from "$lib/dtos/estadosdenuncia/DTOAltaEstadoDenuncia";
import type DTOModificarEstadoDenuncia from "$lib/dtos/estadosdenuncia/DTOModificarEstadoDenuncia";
import type DTOEstadoDenuncia from "$lib/dtos/estadosdenuncia/DTOEstadoDenuncia";

export const EstadoDenunciaEventoService={
    obtenerListaEstadosDenuncia: async () => {
            let response = await request(HttpRequestType.GET, "estadoDenunciaEvento/obtenerListaEstadoDenuncia", true, null);
            return response.content as DTOEstadoDenuncia[];
    },
    altaEstadoDenuncia: async (EstadoDenuncia: DTOAltaEstadoDenuncia) => {
        await request(HttpRequestType.POST, "estadoDenunciaEvento/alta", true, null, JSON.stringify(EstadoDenuncia));
    },
    obtenerEstadoDenunciaCompleta: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        let response : DTOEstadoDenuncia = await request(HttpRequestType.GET, "estadoDenunciaEvento/obtenerEstadoDenunciaEventoCompleto", true, args);
        return response;
    },
    modificarEstadoDenuncia: async (EstadoDenuncia: DTOModificarEstadoDenuncia) => {
        await request(HttpRequestType.PUT, "estadoDenunciaEvento/modificar", true, null, JSON.stringify(EstadoDenuncia));
    },
    bajaEstadoDenuncia: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        await request(HttpRequestType.DELETE, "estadoDenunciaEvento/baja", true, args);
    }
}