import type DTOFiltrosRegistro from "$lib/dtos/registros/DTOFiltrosRegistro";
import type DTORegistro from "$lib/dtos/registros/DTORegistro";
import { HttpRequestType, request } from "$lib/request/request";

export const RegistrosService = {
    buscar: async (registro: string, filtros: DTOFiltrosRegistro) => {
        let args = new Map<string, string>();
        args.set("registro", registro);

        let response : DTORegistro[] = await request(HttpRequestType.PUT, "registros/buscar", true, args, JSON.stringify(filtros));
        return response;
    },
    obtenerTipos: async (registro: string) => {
        let args = new Map<string, string>();
        args.set("registro", registro);

        let response : string[] = await request(HttpRequestType.GET, "registros/obtenerTipos", false, args);
        return response;
    },
    obtenerSubtipos: async (registro: string) => {
        let args = new Map<string, string>();
        args.set("registro", registro);

        let response : string[] = await request(HttpRequestType.GET, "registros/obtenerSubtipos", false, args);
        return response;
    },
}