import type DTOBusquedaEventos from "$lib/dtos/eventos/DTOBusquedaEventos";
import type DTOBusquedaMisEventos from "$lib/dtos/eventos/DTOBusquedaMisEventos";
import type DTOResultadoBusquedaEventos from "$lib/dtos/eventos/DTOResultadoBusquedaEventos";
import type DTOResultadoBusquedaMisEventos from "$lib/dtos/eventos/DTOResultadoBusquedaMisEventos";
import { HttpRequestType, request } from "$lib/request/request";

export const EventosService = {
    buscar: async (data: DTOBusquedaEventos) => {
        let response : DTOResultadoBusquedaEventos[] = await request(HttpRequestType.PUT, "eventos/buscar", false, null, JSON.stringify(data));

        return response;
    },
    buscarMisEventos: async (data: DTOBusquedaMisEventos) => {
        let response : DTOResultadoBusquedaMisEventos[] = await request(HttpRequestType.PUT, "eventos/buscarMisEventos", false, null, JSON.stringify(data));

        return response;
    },
}