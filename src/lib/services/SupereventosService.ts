import type DTOAdministradoresSuperevento from "$lib/dtos/eventos/DTOAdministradoresSuperevento";
import type DTOBusquedaEvento from "$lib/dtos/eventos/DTOBusquedaEvento";
import type DTOBusquedaMisSuperEventos from "$lib/dtos/eventos/DTOBusquedaMisSuperEventos";
import type DTOCrearSuperEvento from "$lib/dtos/eventos/DTOCrearSuperEvento";
import type DTOResultadoBusquedaMisSuperEventos from "$lib/dtos/eventos/DTOResultadoBusquedaMisSuperEventos";
import type DTOSuperEvento from "$lib/dtos/eventos/DTOSuperEvento";
import type DTOSuperEventoEditar from "$lib/dtos/eventos/DTOSuperEventoEditar";
import type DTOBusquedaUsuario from "$lib/dtos/usuarios/DTOBusquedaUsuario";
import { HttpRequestType, request } from "$lib/request/request";


export const SupereventosService = {
    //Buscar supereventos de los que se es administrador
    buscarAdministrados: async (text: string) => {
        let args = new Map<string, string>();
        args.set("text", text);

        let response : {id: number, nombre: string}[] = await request(HttpRequestType.GET, "supereventos/buscarAdministrados", true, args);

        return response;
    },
    buscarMisSuperEventos: async (data: DTOBusquedaMisSuperEventos) => {
        let response : DTOResultadoBusquedaMisSuperEventos[] = await request(HttpRequestType.PUT, "supereventos/buscarMisSuperEventos", false, null, JSON.stringify(data));

        return response;
    },
    obtenerSuperEvento: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);

        let response : DTOSuperEvento = await request(HttpRequestType.GET, "supereventos/obtenerSuperEvento", true, args);

        return response;
    },
    crearSuperEvento: async (data: DTOCrearSuperEvento) => {

        let response : {id: number} = await request(HttpRequestType.POST, "supereventos/crearSuperEvento", true, null, JSON.stringify(data));

        return response.id;
    },

    obtenerSuperEventoEditar: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);

        let response : DTOSuperEventoEditar = await request(HttpRequestType.GET, "supereventos/obtenerSuperEventoEditar", true, args);

        return response;
    },

    editarSuperEvento: async (data: DTOSuperEventoEditar) => {
        await request(HttpRequestType.PUT, "supereventos/editarSuperEvento", true, null, JSON.stringify(data));
    },

    dejarDeAdministrar: async (supereventoId: number) => {
        let args = new Map<string, string>();
        args.set("supereventoId", `${supereventoId}`);

        await request(HttpRequestType.DELETE, "supereventos/dejarDeAdministrar", true, args);
    },

    baja: async (supereventoId: number) => {
        let args = new Map<string, string>();
        args.set("supereventoId", `${supereventoId}`);

        await request(HttpRequestType.DELETE, "supereventos/baja", true, args);
    },
    
    buscarEventosNoVinculados: async (idSuperevento: number, texto: string) => {
        let args = new Map<string, string>();
        args.set("idSuperevento", `${idSuperevento}`);
        args.set("texto", texto);

        let response : DTOBusquedaEvento[] = await request(HttpRequestType.GET, "supereventos/buscarEventosNoVinculados", false, args);
        return response;
    },


    obtenerAdministradores: async (idEvento: number) => {
        let args = new Map<string, string>();
        args.set("idEvento", `${idEvento}`);

        let response : DTOAdministradoresSuperevento = await request(HttpRequestType.GET, "supereventos/obtenerAdministradores", true, args);
        return response;
    },
    agregarAdministrador: async (idEvento: number, username: string) => {
        let args = new Map<string, string>();
        args.set("idEvento", `${idEvento}`);
        args.set("username", username);

        await request(HttpRequestType.POST, "supereventos/agregarAdministrador", true, args);
    },
    quitarAdministrador: async (idEvento: number, username: string) => {
        let args = new Map<string, string>();
        args.set("idEvento", `${idEvento}`);
        args.set("username", username);

        await request(HttpRequestType.DELETE, "supereventos/quitarAdministrador", true, args);
    },
    entregarOrganizador: async (idEvento: number, username: string) => {
        let args = new Map<string, string>();
        args.set("idEvento", `${idEvento}`);
        args.set("username", username);

        await request(HttpRequestType.PUT, "supereventos/entregarOrganizador", true, args);
    },
    buscarUsuariosNoAdministradores: async (idEvento: number, texto: string) => {
        let args = new Map<string, string>();
        args.set("idEvento", `${idEvento}`);
        args.set("texto", texto);

        // Sin fecha de nacimiento, dni y mail
        let response : DTOBusquedaUsuario[] = await request(HttpRequestType.GET, "supereventos/buscarUsuariosNoAdministradores", false, args);
        return response;
    },
}