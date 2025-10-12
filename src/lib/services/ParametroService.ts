import type DTOAltaParametro from "$lib/dtos/parametros/DTOAltaParametro";
import type DTOModificarParametro from "$lib/dtos/parametros/DTOModificarParametro";
import type DTOParametro from "$lib/dtos/parametros/DTOParametro";
import { HttpRequestType, request } from "$lib/request/request";

export const ParametroService={
    obtenerListaParametros: async () => {
            let response = await request(HttpRequestType.GET, "parametro/obtenerListaParametros", true, null);
            return response.content as DTOParametro[];
    },
    altaParametro: async (parametro: DTOAltaParametro) => {
        await request(HttpRequestType.POST, "parametro/alta", true, null, JSON.stringify(parametro));
    },
    obtenerParametroCompleto: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        let response : DTOParametro = await request(HttpRequestType.GET, "parametro/obtenerParametroCompleto", true, args);
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