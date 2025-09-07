import type DTOBusquedaMisSuperEventos from "$lib/dtos/eventos/DTOBusquedaMisSuperEventos";
import type DTOResultadoBusquedaMisSuperEventos from "$lib/dtos/eventos/DTOResultadoBusquedaMisSuperEventos";
import type DTOSuperEvento from "$lib/dtos/eventos/DTOSuperEvento";
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
}