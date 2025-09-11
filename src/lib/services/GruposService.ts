import type DTOAdminGrupo from "$lib/dtos/grupos/DTOAdminSimple";
import type DTOGrupoSimple from "$lib/dtos/grupos/DTOGrupoSimple";
import type Page from "$lib/request/Page";
import { HttpRequestType, request } from "$lib/request/request";

export const GruposService = {
    obtenerGrupos: async (texto: string, page: number) => {
        let args = new Map<string, string>();
        args.set("texto", texto);
        args.set("page", `${page}`);

        let response : Page<DTOGrupoSimple[]> = await request(HttpRequestType.GET, "grupos/obtenerGrupos", true, args);

        return response;
    },
    adminObtenerGrupo: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);

        let response : DTOAdminGrupo = await request(HttpRequestType.GET, "grupos/adminObtenerGrupo", true, args);

        return response;
    }
}