import type DTOBusquedaEspacios from "$lib/dtos/espacios/DTOBusquedaEspacios";
import type DTOResultadoBusquedaEspacios from "$lib/dtos/espacios/DTOResultadoBusquedaEspacios";
import type DTOCrearEspacio from "$lib/dtos/espacios/DTOCrearEspacio";
import type DTOEspacio from "$lib/dtos/espacios/DTOEspacio";
import type DTOEspacioEditar from "$lib/dtos/espacios/DTOEspacioEditar";
import { HttpRequestType, request } from "$lib/request/request";
import type DTOBusquedaMisEspacios from "$lib/dtos/espacios/DTOBusquedaMisEspacios";
import type DTOResultadoBusquedaMisEspacios from "$lib/dtos/espacios/DTOResultadoBusquedaMisEspacios";
import type DTOBusquedaEventosPorEspacio from "$lib/dtos/espacios/DTOBusquedaEventosPorEspacio";
import type DTOResultadoBusquedaEventosPorEspacio from "$lib/dtos/espacios/DTOResultadoBusquedaEventosPorEspacio";
import type DTOCaracteristica from "$lib/dtos/espacios/DTOCaracteristica";
import type DTOAdministradoresEspacio from "$lib/dtos/espacios/DTOAdministradoresEspacio";
import type DTOBusquedaUsuario from "$lib/dtos/usuarios/DTOBusquedaUsuario";


export const EspaciosService = {
    crearEspacio: async (data: DTOCrearEspacio) => {

        let response : {id: number} = await request(HttpRequestType.POST, "espacios/crearEspacio", true, null, JSON.stringify(data));

        return response.id;
    },
    obtenerEspacio: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);

        let response : DTOEspacio = await request(HttpRequestType.GET, "espacios/obtenerEspacio", true, args);

        return response;
    },
    obtenerEspacioEditar: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);

        let response : DTOEspacioEditar = await request(HttpRequestType.GET, "espacios/obtenerEspacioEditar", true, args);

        return response;
    },
    editarEspacio: async (data: DTOEspacioEditar) => {
        await request(HttpRequestType.PUT, "espacios/editarEspacio", true, null, JSON.stringify(data));
    },

    dejarDeAdministrar: async (espacioId: number) => {
        let args = new Map<string, string>();
        args.set("espacioId", `${espacioId}`);

        await request(HttpRequestType.DELETE, "espacios/dejarDeAdministrar", true, args);
    },
    obtenerNombreEspacio: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);

        let response : {nombre: string} = await request(HttpRequestType.GET, "espacios/obtenerNombreEspacio", false, args);

        return response.nombre;
    },
    buscar: async (data: DTOBusquedaEspacios) => {
        let response : DTOResultadoBusquedaEspacios[] = await request(HttpRequestType.PUT, "espacios/buscar", false, null, JSON.stringify(data));

        return response;
    },
    obtenerTiposEspacio: async () => {
        let response : {id: number, nombre: string, checked: boolean | undefined}[] = await request(HttpRequestType.GET, "espacios/obtenerTiposEspacio", false);

        return response;
    },
    buscarMisEspacios: async (data: DTOBusquedaMisEspacios) => {
        let response : DTOResultadoBusquedaMisEspacios[] = await request(HttpRequestType.PUT, "espacios/buscarMisEspacios", false, null, JSON.stringify(data));

        return response;
    },

    buscarEventosPorEspacio: async (data: DTOBusquedaEventosPorEspacio) => {
        let response : DTOResultadoBusquedaEventosPorEspacio[] = await request(HttpRequestType.PUT, "espacios/buscarEventosPorEspacio", false, null, JSON.stringify(data));

        return response;
    },
    cancelarEvento: async (eventoId: number, espacioId: number) => {
        let args = new Map<string, string>();
        args.set("eventoId", `${eventoId}`);
        args.set("espacioId", `${espacioId}`);
        await request(HttpRequestType.DELETE, "espacios/cancelarEvento", true, args);
    },
    actualizarCaracteristicasEspacio: async(idEspacio:number, caracteristicas:DTOCaracteristica[]) => {
        const payload = {
            idEspacio,
            caracteristicas
        };
        await request(HttpRequestType.POST, "espacios/actualizarCaracteristicasEspacio", true, null, JSON.stringify(payload));
    },
    obtenerAdministradoresEspacio: async (idEspacio: number) => {
        let args = new Map<string, string>();
        args.set("idEspacio", `${idEspacio}`);
        let response : DTOAdministradoresEspacio = await request(HttpRequestType.GET, "espacios/obtenerAdministradoresEspacio", true, args);
        response.administradores.map(iconoObj => {
            const byteCharacters = atob(iconoObj.urlFotoPerfil);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const bytes = new Uint8Array(byteNumbers);
            let urlCreator = window.URL || window.webkitURL;
            let url = urlCreator.createObjectURL(new Blob([bytes], {type: iconoObj.contentType || 'image/png'}));
            iconoObj.urlFotoPerfil = url;
            return iconoObj;
        });
        return response;
    },
    buscarUsuariosNoAdministradores: async (idEspacio: number, texto: string) => {
        let args = new Map<string, string>();
        args.set("idEvento", `${idEspacio}`);
        args.set("texto", texto);

        let response : DTOBusquedaUsuario[] = await request(HttpRequestType.GET, "espacios/buscarUsuariosNoAdministradores", false, args);
        return response;
    },
    eliminarAdministradorEspacio: async (idEspacio: number, idUsuario: number) => {
        let args = new Map<string, string>();
        args.set("idEspacio", `${idEspacio}`);
        args.set("idUsuario", `${idUsuario}`);
        await request(HttpRequestType.DELETE, "espacios/eliminarAdministradorEspacio", true, args);
    },
    agregarAdministradorEspacio: async (idEspacio: number, username:string) => {
        let args = new Map<string, string>();
        args.set("idEspacio", `${idEspacio}`);
        args.set("username", `${username}`);
        await request(HttpRequestType.POST, "espacios/agregarAdministradorEspacio", true, args);
    },
    entregarPropietario: async (idEspacio: number, idUsuario: number) => {
        let args = new Map<string, string>();
        args.set("idEspacio", `${idEspacio}`);
        args.set("idUsuario", `${idUsuario}`);
        await request(HttpRequestType.PUT, "espacios/entregarPropietario", true, args);
    }
}