import type DTOBusquedaEventos from "$lib/dtos/eventos/DTOBusquedaEventos";
import type DTOResultadoBusquedaEventos from "$lib/dtos/eventos/DTOResultadoBusquedaEventos";
import { HttpRequestType, request } from "$lib/request/request";

export const EventosService = {
    buscar: async (data: DTOBusquedaEventos) => {
        let response : DTOResultadoBusquedaEventos[] = await request(HttpRequestType.PUT, "eventos/buscar", false, null, JSON.stringify(data));

        return response;
    },
    /*buscarMisEspacios: async (data: DTOBusquedaMisEspacios) => {
        let response : DTOResultadoBusquedaMisEspacios[] = await request(HttpRequestType.PUT, "espacios/buscarMisEspacios", false, null, JSON.stringify(data));

        return response;
    },*/
}