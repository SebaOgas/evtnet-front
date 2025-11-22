import type DTOAltaParametro from "$lib/dtos/parametros/DTOAltaParametro";
import type DTOModificarParametro from "$lib/dtos/parametros/DTOModificarParametro";
import type DTOParametro from "$lib/dtos/parametros/DTOParametro";
import type Page from "$lib/request/Page";
import { HttpRequestType, request } from "$lib/request/request";

export const ParametroService = {
    obtenerListaParametros: async (page: number) => {
        let args = new Map<string, string>();
        args.set("page", `${page}`);
        let response : Page<DTOParametro[]> = await request(HttpRequestType.GET, "parametro/obtenerListaParametros", true, args);
        return response
    },
    altaParametro: async (parametro: DTOAltaParametro) => {
        await request(HttpRequestType.POST, "parametro/alta", true, null, JSON.stringify(parametro));
    },
    obtenerParametroCompleto: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        let response: DTOParametro = await request(HttpRequestType.GET, "parametro/obtenerParametroCompleto", true, args);
        return response;
    },
    modificarParametro: async (parametro: DTOModificarParametro) => {
        await request(HttpRequestType.PUT, "parametro/modificar", true, null, JSON.stringify(parametro));
    },
    bajaParametro: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        await request(HttpRequestType.DELETE, "parametro/baja", true, args);
    }
}