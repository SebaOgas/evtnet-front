import type DTOAltaDisciplina from "$lib/dtos/disciplinas/DTOAltaDisciplina";
import type DTOBusquedaDisciplina from "$lib/dtos/disciplinas/DTOBusquedaDisciplinas";
import type DTODisciplina from "$lib/dtos/disciplinas/DTODisciplina";
import type DTOModificarDisciplina from "$lib/dtos/disciplinas/DTOModificarDisciplina";
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
  buscarDisciplinas: async (filtros: DTOBusquedaDisciplina) => {
        let response : DTODisciplina[]= await request(HttpRequestType.PUT, "disciplinas/buscarDisciplinas", true, null, JSON.stringify(filtros));
        return response;
  },
  altaDisciplina: async (disciplina: DTOAltaDisciplina) => {
        await request(HttpRequestType.PUT, "disciplinas/alta", true, null, JSON.stringify(disciplina));
  },
  obtenerDisciplinaCompleta: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        let response : DTODisciplina = await request(HttpRequestType.GET, "disciplinas/obtenerDisciplinaCompleta", true, args);
        return response;
  },
  modificarDisciplina: async (disciplina: DTOModificarDisciplina) => {
        await request(HttpRequestType.PUT, "disciplinas/modificar", true, null, JSON.stringify(disciplina));
  },
  bajaDisciplina: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        await request(HttpRequestType.DELETE, "disciplinas/baja", true, args);
  }
}