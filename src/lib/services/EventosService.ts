import type DTOBusquedaEventos from "$lib/dtos/eventos/DTOBusquedaEventos";
import type DTOBusquedaMisEventos from "$lib/dtos/eventos/DTOBusquedaMisEventos";
import type DTOCrearEvento from "$lib/dtos/eventos/DTOCrearEvento";
import type DTODatosCreacionEvento from "$lib/dtos/eventos/DTODatosCreacionEvento";
import type DTOEvento from "$lib/dtos/eventos/DTOEvento";
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
    obtenerEvento: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);

        let response : DTOEvento = await request(HttpRequestType.GET, "eventos/obtenerEvento", true, args);

        return response;
    },
    obtenerDatosCreacionEvento: async (idEspacio: number | null) => {
        let args = new Map<string, string>();
        args.set("idEspacio", `${idEspacio === null ? "null" : idEspacio}`);

        let response : DTODatosCreacionEvento = await request(HttpRequestType.GET, "eventos/obtenerDatosCreacionEvento", true, args);

        return response;
    },
    crearEvento: async (data: DTOCrearEvento) => {
        let response : {id: number} = await request(HttpRequestType.POST, "eventos/crearEvento", true, null, JSON.stringify(data));

        return response.id;
    },
    obtenerCantidadEventosSuperpuestos: async (
        idEspacio: number, 
        fechaHoraDesde: Date, 
        fechaHoraHasta: Date
    ) => {
        let args = new Map<string, string>();
        args.set("idEspacio", `${idEspacio}`);
        args.set("fechaHoraDesde", `${(new Date(fechaHoraDesde)).getTime()}`);
        args.set("fechaHoraHasta", `${(new Date(fechaHoraHasta)).getTime()}`);

        let response : {cantidad: number} = await request(HttpRequestType.GET, "eventos/obtenerCantidadEventosSuperpuestos", false, args);

        return response.cantidad;

    }
}