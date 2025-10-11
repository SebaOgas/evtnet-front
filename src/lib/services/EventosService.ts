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
import type DTODatosParaInscripcion from "$lib/dtos/eventos/DTODatosParaInscripcion";
import type DTOBusquedaUsuario from "$lib/dtos/usuarios/DTOBusquedaUsuario";
import type DTOAdministradores from "$lib/dtos/eventos/DTOAdministradores";
import type DTODatosParaDenunciarEvento from "$lib/dtos/eventos/DTODatosParaDenunciar";
import type DTODenunciaEvento from "$lib/dtos/eventos/DTODenunciaEvento";
import type DTODenunciaEventoSimple from "$lib/dtos/eventos/DTODenunciaEventoSimple";
import type DTOBusquedaDenunciasEventos from "$lib/dtos/eventos/DTOBusquedaDenunciasEventos";
import type Page from "$lib/request/Page";
import type DTODenunciaEventoCompleta from "$lib/dtos/eventos/DTODenunciaEventoCompleta";
import type DTODatosParaCambioEstadoDenuncia from "$lib/dtos/eventos/DTODatosParaCambioEstadoDenuncia";
import type DTOCambioEstadoDenuncia from "$lib/dtos/eventos/DTOCambioEstadoDenuncia";
import type DTOPreferenciaPago from "$lib/dtos/usuarios/DTOPreferenciaPago";
import { preferences } from "$lib/stores";

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
        let response : {valido: boolean, preferencias: DTOPreferenciaPago[]} = await request(HttpRequestType.PUT, "eventos/verificarDatosPrePago", true, null, JSON.stringify(data));

        return response;
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
    },

    obtenerDatosParaInscripcion: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);

        let response : DTODatosParaInscripcion = await request(HttpRequestType.GET, "eventos/obtenerDatosParaInscripcion", true, args);

        return response;
    },
    inscribirUsuario: async (data: DTOInscripcion) => {
        await request(HttpRequestType.POST, "eventos/inscribirUsuario", true, null, JSON.stringify(data));
    },
    buscarUsuariosNoInscriptos: async (idEvento: number, texto: string) => {
        let args = new Map<string, string>();
        args.set("idEvento", `${idEvento}`);
        args.set("texto", texto);

        // Sin fecha de nacimiento, dni y mail
        let response : DTOBusquedaUsuario[] = await request(HttpRequestType.GET, "eventos/buscarUsuariosNoInscriptos", false, args);
        return response;
    },

    obtenerAdministradores: async (idEvento: number) => {
        let args = new Map<string, string>();
        args.set("idEvento", `${idEvento}`);

        let response : DTOAdministradores = await request(HttpRequestType.GET, "eventos/obtenerAdministradores", true, args);
        return response;
    },
    agregarAdministrador: async (idEvento: number, username: string) => {
        let args = new Map<string, string>();
        args.set("idEvento", `${idEvento}`);
        args.set("username", username);

        await request(HttpRequestType.POST, "eventos/agregarAdministrador", true, args);
    },
    quitarAdministrador: async (idEvento: number, username: string) => {
        let args = new Map<string, string>();
        args.set("idEvento", `${idEvento}`);
        args.set("username", username);

        await request(HttpRequestType.DELETE, "eventos/quitarAdministrador", true, args);
    },
    entregarOrganizador: async (idEvento: number, username: string) => {
        let args = new Map<string, string>();
        args.set("idEvento", `${idEvento}`);
        args.set("username", username);

        await request(HttpRequestType.PUT, "eventos/entregarOrganizador", true, args);
    },
    buscarUsuariosNoAdministradores: async (idEvento: number, texto: string) => {
        let args = new Map<string, string>();
        args.set("idEvento", `${idEvento}`);
        args.set("texto", texto);

        // Sin fecha de nacimiento, dni y mail
        let response : DTOBusquedaUsuario[] = await request(HttpRequestType.GET, "eventos/buscarUsuariosNoAdministradores", false, args);
        return response;
    },

    getDatosParaDenunciar: async (idEvento: number) => {
        let args = new Map<string, string>();
        args.set("idEvento", `${idEvento}`);

        let response : DTODatosParaDenunciarEvento = await request(HttpRequestType.GET, "eventos/getDatosParaDenunciar", true, args);
        return response;
    },
    denunciar: async (data: DTODenunciaEvento) => {
        await request(HttpRequestType.POST, "eventos/denunciar", true, null, JSON.stringify(data));
    },

    obtenerEstadosDenuncias: async () => {
        let response : {id: number, nombre: string, checked : boolean}[] = await request(HttpRequestType.GET, "eventos/obtenerEstadosDenuncias", true);
        return response;
    },
    buscarDenuncias: async (filtros: DTOBusquedaDenunciasEventos, page : number = 0) => {
        let args = new Map<string, string>();
        args.set("page", `${page}`);

        let response : Page<DTODenunciaEventoSimple[]> = await request(HttpRequestType.PUT, "eventos/buscarDenuncias", true, args, JSON.stringify(filtros));
        return response;
    },
    obtenerDenuncia: async (idDenuncia: number) => {
        let args = new Map<string, string>();
        args.set("idDenuncia", `${idDenuncia}`);

        let response : DTODenunciaEventoCompleta = await request(HttpRequestType.GET, "eventos/obtenerDenuncia", true, args);
        return response;
    },
    obtenerDatosParaCambioEstadoDenuncia: async (idDenuncia: number) => {
        let args = new Map<string, string>();
        args.set("idDenuncia", `${idDenuncia}`);

        let response : DTODatosParaCambioEstadoDenuncia = await request(HttpRequestType.GET, "eventos/obtenerDatosParaCambioEstadoDenuncia", true, args);
        return response;
    },
    cambiarEstadoDenuncia: async (data: DTOCambioEstadoDenuncia) => {
        await request(HttpRequestType.POST, "eventos/cambiarEstadoDenuncia", true, null, JSON.stringify(data));
    }
}