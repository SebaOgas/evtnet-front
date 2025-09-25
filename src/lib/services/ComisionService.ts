import { HttpRequestType, request } from "$lib/request/request";
import type DTOComision from "$lib/dtos/comision/DTOComision";
import type DTOAltaComision from "$lib/dtos/comision/DTOAltaComision";
import type DTOModificarComision from "$lib/dtos/comision/DTOModificarComision";

export const ComisionService={
    obtenerListaComisionesInscripcion: async () => {
            let response : DTOComision[]= await request(HttpRequestType.GET, "comisionInscripcion/obtenerListaComisiones", true, null);
            return response;
    },
    altaComisionInscripcion: async (comision: DTOAltaComision) => {
        await request(HttpRequestType.PUT, "comisionInscripcion/alta", true, null, JSON.stringify(comision));
    },
    obtenerComisionInscripcionCompleta: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        let response : DTOComision = await request(HttpRequestType.GET, "comisionInscripcion/obtenerComisionCompleta", true, args);
        return response;
    },
    modificarComisionInscripcion: async (comision: DTOModificarComision) => {
        await request(HttpRequestType.PUT, "comisionInscripcion/modificar", true, null, JSON.stringify(comision));
    },
    bajaComisionInscripcion: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        await request(HttpRequestType.DELETE, "comisionInscripcion/baja", true, args);
    },
    obtenerListaComisionesOrganizacion: async () => {
            let response : DTOComision[]= await request(HttpRequestType.GET, "comisionOrganizacion/obtenerListaComisiones", true, null);
            return response;
    },
    altaComisionOrganizacion: async (comision: DTOAltaComision) => {
        await request(HttpRequestType.PUT, "comisionOrganizacion/alta", true, null, JSON.stringify(comision));
    },
    obtenerComisionOrganizacionCompleta: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        let response : DTOComision = await request(HttpRequestType.GET, "comisionOrganizacion/obtenerComisionCompleta", true, args);
        return response;
    },
    modificarComisionOrganizacion: async (comision: DTOModificarComision) => {
        await request(HttpRequestType.PUT, "comisionOrganizacion/modificar", true, null, JSON.stringify(comision));
    },
    bajaComisionOrganizacion: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        await request(HttpRequestType.DELETE, "comisionOrganizacion/baja", true, args);
    }
}