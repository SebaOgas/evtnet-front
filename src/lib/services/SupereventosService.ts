import { HttpRequestType, request } from "$lib/request/request";


export const SupereventosService = {
    //Buscar supereventos de los que se es administrador
    buscarAdministrados: async (text: string) => {
        let args = new Map<string, string>();
        args.set("text", text);

        let response : {id: number, nombre: string}[] = await request(HttpRequestType.GET, "supereventos/buscarAdministrados", true, args);

        return response;
    },
}