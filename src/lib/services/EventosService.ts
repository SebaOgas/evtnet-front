import type DTOBusquedaEventos from "$lib/dtos/eventos/DTOBusquedaEventos";
import type DTOBusquedaMisEventos from "$lib/dtos/eventos/DTOBusquedaMisEventos";
import type DTOCrearEvento from "$lib/dtos/eventos/DTOCrearEvento";
import type DTODatosCreacionEvento from "$lib/dtos/eventos/DTODatosCreacionEvento";
import type DTOEvento from "$lib/dtos/eventos/DTOEvento";
import type DTOEventoParaInscripcion from "$lib/dtos/eventos/DTOEventoParaInscripcion";
import type DTOInscripcion from "$lib/dtos/eventos/DTOInscripcion";
import type DTOResultadoBusquedaEventos from "$lib/dtos/eventos/DTOResultadoBusquedaEventos";
import type DTOResultadoBusquedaMisEventos from "$lib/dtos/eventos/DTOResultadoBusquedaMisEventos";
import { HttpRequestType, request } from "$lib/request/request";
import type DTOModificarEvento from "$lib/dtos/eventos/DTOModificarEvento";
import type DTOInscripcionesEvento from "$lib/dtos/espacios/DTOInscripcionesEvento";

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

    },
    obtenerMontoDevolucionCancelacionInscripcion: async (idEvento: number, username: string) => {
        let args = new Map<string, string>();
        args.set("idEvento", `${idEvento}`);
        args.set("username", `${username}`);

        let response : {monto: number} = await request(HttpRequestType.GET, "eventos/obtenerMontoDevolucionCancelacionInscripcion", true, args);

        return response.monto;
    },
    desinscribirse: async (idEvento: number) => {
        let args = new Map<string, string>();
        args.set("idEvento", `${idEvento}`);

        await request(HttpRequestType.POST, "eventos/desinscribirse", true, args);
    },
    obtenerEventoParaInscripcion: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);

        let response : DTOEventoParaInscripcion = await request(HttpRequestType.GET, "eventos/obtenerEventoParaInscripcion", true, args);

        return response;
    },
    verificarDatosPrePago: async (data: DTOInscripcion) => {
        let response : {valido: boolean} = await request(HttpRequestType.PUT, "eventos/verificarDatosPrePago", true, null, JSON.stringify(data));

        return response.valido;
    },
    inscribirse: async (data: DTOInscripcion) => {
        await request(HttpRequestType.POST, "eventos/inscribirse", true, null, JSON.stringify(data));
    },
    obtenerDatosModificacionEvento: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);

        let response : DTOModificarEvento = await request(HttpRequestType.GET, "eventos/obtenerDatosModificacionEvento", true, args);

        return response;
    },
    modificarEvento: async (data: DTOModificarEvento) => {
        await request(HttpRequestType.POST, "eventos/modificarEvento", true, null, JSON.stringify(data));
    },

    obtenerInscripciones: async (id: number, busqueda: string = "") => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        args.set("busqueda", `${busqueda}`);

        let response : DTOInscripcionesEvento = await request(HttpRequestType.GET, "eventos/obtenerInscripciones", true, args);

        return response;
    },

    cancelarInscripcion: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);

        await request(HttpRequestType.DELETE, "eventos/cancelarInscripcion", true, args);
    }
}