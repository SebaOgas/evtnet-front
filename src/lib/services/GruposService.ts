import type DTOAdminGrupo from "$lib/dtos/grupos/DTOAdminSimple";
import type DTOCrearGrupo from "$lib/dtos/grupos/DTOCrearGrupo";
import type DTOGrupo from "$lib/dtos/grupos/DTOGrupo";
import type DTOGrupoSimple from "$lib/dtos/grupos/DTOGrupoSimple";
import type DTOModificarGrupo from "$lib/dtos/grupos/DTOModificarGrupo";
import type DTOBusquedaUsuario from "$lib/dtos/usuarios/DTOBusquedaUsuario";
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
    },

    obtenerMisGrupos: async () => {
        let response : {id: number, nombre: string, idChat: number, aceptado: boolean}[] = await request(HttpRequestType.GET, "grupos/obtenerMisGrupos", true);

        return response;
    },

    salir: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);

        await request(HttpRequestType.DELETE, "grupos/salir", true, args);
    },

    obtenerGrupo: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);

        let response : DTOGrupo = await request(HttpRequestType.GET, "grupos/obtenerGrupo", true, args);

        return response;
    },

    crearGrupo: async (data: DTOCrearGrupo) => {
        let response : {id: number} = await request(HttpRequestType.POST, "grupos/crearGrupo", true, null, JSON.stringify(data));

        return response.id;
    },

    toggleInvitacion: async (idGrupo: number, aceptar: boolean) => {
        let args = new Map<string, string>();
        args.set("idGrupo", `${idGrupo}`);
        args.set("aceptar", `${aceptar}`);

        await request(HttpRequestType.POST, "grupos/toggleInvitacion", true, args);
    },

    buscarUsuariosParaAgregar: async (idGrupo: number | null, texto: string) => {
        let args = new Map<string, string>();
        args.set("idGrupo", idGrupo === null ? "" : "" + idGrupo);
        args.set("texto", texto);

        let response : DTOBusquedaUsuario[] = await request(HttpRequestType.GET, "grupos/buscarUsuariosParaAgregar", false, args);
        return response;
    },
    obtenerTiposUsuarioGrupo: async () => {
        let response : {id: number, nombre: string}[] = await request(HttpRequestType.GET, "grupos/obtenerTiposUsuarioGrupo", true);
        return response;
    },
    modificarGrupo: async (data: DTOModificarGrupo) => {
        await request(HttpRequestType.PUT, "grupos/modificarGrupo", true, null, JSON.stringify(data));
    },
    obtenerDatosModificarGrupo: async (idGrupo: number) => {
        let args = new Map<string, string>();
        args.set("idGrupo", `${idGrupo}`);

        let response : DTOModificarGrupo = await request(HttpRequestType.GET, "grupos/obtenerDatosModificarGrupo", true, args);
        return response;
    },
}