import { HttpRequestType, request } from "$lib/request/request";


export const ModosDeEventoService = {
  buscar: async (text: string) => {
        let args = new Map<string, string>();
        args.set("text", text);

        let response : {id: number, nombre: string}[] = await request(HttpRequestType.GET, "modosDeEvento/buscar", false, args);

        return response;
    },
}