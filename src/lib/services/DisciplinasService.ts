import { HttpRequestType, request } from "$lib/request/request";


export const DisciplinasService = {
  buscar: async (text: string) => {
        let args = new Map<string, string>();
        args.set("text", text);

        let response : {id: number, nombre: string}[] = await request(HttpRequestType.GET, "disciplinas/buscar", false, args);

        return response;
    },
  buscarPorEspacio: async (text: string, espacioId: number) => {
        let args = new Map<string, string>();
        args.set("text", text);
        args.set("espacioId", "" + espacioId);

        let response : {id: number, nombre: string}[] = await request(HttpRequestType.GET, "disciplinas/buscarPorEspacio", false, args);

        return response;
    },
}