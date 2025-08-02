import type DTOCrearEspacio from "$lib/dtos/espacios/DTOCrearEspacio";
import type DTOEspacio from "$lib/dtos/espacios/DTOEspacio";
import type DTOEspacioEditar from "$lib/dtos/espacios/DTOEspacioEditar";
import { HttpRequestType, request } from "$lib/request/request";


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
    }
}