import type DTOCrearEspacio from "$lib/dtos/espacios/DTOCrearEspacio";
import { HttpRequestType, request } from "$lib/request/request";


export const EspaciosService = {
    crearEspacio: async (data: DTOCrearEspacio) => {

        let response : {id: number} = await request(HttpRequestType.POST, "espacios/crearEspacio", true, null, JSON.stringify(data));

        return response.id;
    },
}