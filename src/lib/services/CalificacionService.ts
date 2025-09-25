import type DTOAltaMotivoCalificacion from "$lib/dtos/motivoCalificacion/DTOAltaMotivoCalificacion";
import type DTOModificarMotivoCalificacion from "$lib/dtos/motivoCalificacion/DTOModificarMotivoCalificacion";
import type DTOMotivoCalificacion from "$lib/dtos/motivoCalificacion/DTOMotivoCalificacion";
import type DTOAltaTipoCalificacion from "$lib/dtos/tipoCalificacion/DTOAltaTipoCalificacion";
import type DTOModificarTipoCalificacion from "$lib/dtos/tipoCalificacion/DTOModificarTipoCalificacion";
import type DTOTipoCalificacion from "$lib/dtos/usuarios/DTOTipoCalificacion";
import { HttpRequestType, request } from "$lib/request/request";

export const CalificacionService={
    obtenerListaMotivosCalificacion: async () => {
            let response : DTOMotivoCalificacion[]= await request(HttpRequestType.GET, "motivoCalificacion/obtenerListaMotivos", true, null);
            return response;
    },
    altaMotivoCalificacion: async (motivo: DTOAltaMotivoCalificacion) => {
        await request(HttpRequestType.PUT, "motivoCalificacion/alta", true, null, JSON.stringify(motivo));
    },
    obtenerMotivoCalificacionCompleto: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        let response : DTOMotivoCalificacion = await request(HttpRequestType.GET, "motivoCalificacion/obtenerMotivoCompleto", true, args);
        return response;
    },
    modificarMotivoCalificacion: async (motivo: DTOModificarMotivoCalificacion) => {
        await request(HttpRequestType.PUT, "motivoCalificacion/modificar", true, null, JSON.stringify(motivo));
    },
    bajaMotivoCalificacion: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        await request(HttpRequestType.DELETE, "motivoCalificacion/baja", true, args);
    },
    obtenerTiposCalificacion:async()=>{
        let response : {id: number, nombre: string}[] = await request(HttpRequestType.GET, "tipoCalificacion/obtenerTiposCalificacion", true, null);
        return response;
    },
    obtenerListaTiposCalificacion: async () => {
            let response : DTOTipoCalificacion[]= await request(HttpRequestType.GET, "tipoCalificacion/obtenerListaTipos", true, null);
            return response;
    },
    altaTipoCalificacion: async (motivo: DTOAltaTipoCalificacion) => {
        await request(HttpRequestType.PUT, "tipoCalificacion/alta", true, null, JSON.stringify(motivo));
    },
    obtenerTipoCalificacionCompleto: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        let response : DTOTipoCalificacion = await request(HttpRequestType.GET, "tipoCalificacion/obtenerTipoCompleto", true, args);
        return response;
    },
    modificarTipoCalificacion: async (tipo: DTOModificarTipoCalificacion) => {
        await request(HttpRequestType.PUT, "tipoCalificacion/modificar", true, null, JSON.stringify(tipo));
    },
    bajaTipoCalificacion: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        await request(HttpRequestType.DELETE, "tipoCalificacion/baja", true, args);
    }
}