import type DTOFiltrosRegistro from "$lib/dtos/registros/DTOFiltrosRegistro";
import type DTORegistro from "$lib/dtos/registros/DTORegistro";
import type DTORegistroMeta from "$lib/dtos/registros/DTORegistroMeta";
import type DTOBusquedaUsuario from "$lib/dtos/usuarios/DTOBusquedaUsuario";
import { HttpRequestType, request } from "$lib/request/request";

export const RegistrosService = {
    obtenerRegistros: async () => {
        let response : DTORegistroMeta[] = await request(HttpRequestType.GET, "registros/obtenerRegistros", true);
        return response;
    },
    obtenerRegistroFormateado: async (nombre: string) => {
        let args = new Map<string, string>();
        args.set("nombre", nombre);

        let response : DTORegistroMeta = await request(HttpRequestType.GET, "registros/obtenerRegistroFormateado", false, args);
        return response;
    },
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
    buscarUsuarios: async (texto: string) => {
        let args = new Map<string, string>();
        args.set("texto", texto);

        let response : DTOBusquedaUsuario[] = await request(HttpRequestType.GET, "registros/buscarUsuarios", false, args);
        return response;
    }
}