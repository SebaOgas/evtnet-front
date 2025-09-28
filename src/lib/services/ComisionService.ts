import { HttpRequestType, request } from "$lib/request/request";
import type DTOComision from "$lib/dtos/comision/DTOComision";
import type DTOAltaComision from "$lib/dtos/comision/DTOAltaComision";
import type DTOModificarComision from "$lib/dtos/comision/DTOModificarComision";

export const ComisionService={
    obtenerListaComisionesInscripcion: async () => {
            let response = await request(HttpRequestType.GET, "comisionPorInscripcion/obtenerListaComisiones", true, null);
            return response.content as DTOComision[];
    },
    altaComisionInscripcion: async (comision: DTOAltaComision) => {
        await request(HttpRequestType.POST, "comisionPorInscripcion/alta", true, null, JSON.stringify(comision));
    },
    obtenerComisionInscripcionCompleta: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        let response : DTOComision = await request(HttpRequestType.GET, "comisionPorInscripcion/obtenerComisionCompleta", true, args);
        return response;
    },
    modificarComisionInscripcion: async (comision: DTOModificarComision) => {
        await request(HttpRequestType.PUT, "comisionPorInscripcion/modificar", true, null, JSON.stringify(comision));
    },
    bajaComisionInscripcion: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        await request(HttpRequestType.DELETE, "comisionPorInscripcion/baja", true, args);
    },
    obtenerListaComisionesOrganizacion: async () => {
            let response = await request(HttpRequestType.GET, "comisionPorOrganizacion/obtenerListaComisiones", true, null);
            return response.content as DTOComision[];;
    },
    altaComisionOrganizacion: async (comision: DTOAltaComision) => {
        await request(HttpRequestType.POST, "comisionPorOrganizacion/alta", true, null, JSON.stringify(comision));
    },
    obtenerComisionOrganizacionCompleta: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        let response : DTOComision = await request(HttpRequestType.GET, "comisionPorOrganizacion/obtenerComisionCompleta", true, args);
        return response;
    },
    modificarComisionOrganizacion: async (comision: DTOModificarComision) => {
        await request(HttpRequestType.PUT, "comisionPorOrganizacion/modificar", true, null, JSON.stringify(comision));
    },
    bajaComisionOrganizacion: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        await request(HttpRequestType.DELETE, "comisionPorOrganizacion/baja", true, args);
    }
}