import type DTOAltaModoEvento from "$lib/dtos/modoevento/DTOAltaModoEvento";
import type DTOModificarModoEvento from "$lib/dtos/modoevento/DTOModificarModoEvento";
import type DTOModoEvento from "$lib/dtos/modoevento/DTOModoEvento";
import { HttpRequestType, request } from "$lib/request/request";


export const ModosDeEventoService = {
  buscar: async (text: string) => {
        let args = new Map<string, string>();
        args.set("text", text);

        let response : {id: number, nombre: string}[] = await request(HttpRequestType.GET, "modosDeEvento/buscar", false, args);

        return response;
  },
  obtenerListaModosEvento: async () => {
          let response = await request(HttpRequestType.GET, "modosDeEvento/obtenerListaModosEvento", true, null);
          return response.content as DTOModoEvento[];
  },
  altaModoEvento: async (modoEvento: DTOAltaModoEvento) => {
        await request(HttpRequestType.POST, "modosDeEvento/alta", true, null, JSON.stringify(modoEvento));
  },
  obtenerModoEventoCompleta: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        let response : DTOModoEvento = await request(HttpRequestType.GET, "modosDeEvento/obtenerModoEventoCompleto", true, args);
        return response;
  },
  modificarModoEvento: async (modoEvento: DTOModificarModoEvento) => {
        await request(HttpRequestType.PUT, "modosDeEvento/modificar", true, null, JSON.stringify(modoEvento));
  },
  bajaModoEvento: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        await request(HttpRequestType.DELETE, "modosDeEvento/baja", true, args);
  }
}