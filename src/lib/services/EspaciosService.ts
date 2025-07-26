import type DTOCrearEspacio from "$lib/dtos/espacios/DTOCrearEspacio";
import type DTOEspacio from "$lib/dtos/espacios/DTOEspacio";
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
    }
}