import type DTOBusquedaSEP from "$lib/dtos/espacios/DTOBusquedaSEP";
import type DTOCrearSolicitudEspacio from "$lib/dtos/espacios/DTOCrearSolicitudEspacio";
import type DTOResultadoBusquedaSEP from "$lib/dtos/espacios/DTOResultadoBusquedaSEP";
import type DTOSolicitudEPCompleta from "$lib/dtos/espacios/DTOSolicitudEPCompleta";
import { HttpRequestType, request } from "$lib/request/request";

export const SolicitudEspacioService = {
    crearSolicitudEspacio: async (data: DTOCrearSolicitudEspacio) => {

        let response = await request(HttpRequestType.POST, "solicitudEspacio/crearSolicitudEspacio", true, null, JSON.stringify(data));

        return response;
    },
    buscarSolicitudesEspaciosPublicos: async (data: DTOBusquedaSEP) => {
        let response : DTOResultadoBusquedaSEP[] = await request(HttpRequestType.PUT, "solicitudEspacio/buscarSolicitudesEspaciosPublicos", false, null, JSON.stringify(data));
        return response;
    },
    obtenerEstadosSEP: async () => {
        let response : {id: number, nombre: string, checked: boolean}[] = await request(HttpRequestType.GET, "solicitudEspacio/obtenerEstadosSEP", true);
        return response;
    },
    obtenerDetalleSolicitudEP: async (idSEP: number) => {
        let args = new Map<string, string>();
        args.set("idSEP", `${idSEP}`);
        let response : DTOSolicitudEPCompleta = await request(HttpRequestType.GET, "solicitudEspacio/obtenerDetalleSolicitudEP", true, args);
        const byteCharacters = atob(response.solicitante.urlFotoPerfil || "");
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob= new Blob([byteArray], { type: response.solicitante.contentType ?? 'image/png' });
        let urlCreator = window.URL || window.webkitURL;
        let url = urlCreator.createObjectURL(blob);
        response.solicitante.urlFotoPerfil = url;

        response.SEPEstados = response.SEPEstados.map(estado => {
            const byteCharacters = atob(estado.responsable.urlFotoPerfil || "");
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob= new Blob([byteArray], { type: estado.responsable.contentType ?? 'image/png' });
            let urlCreator = window.URL || window.webkitURL;
            let url = urlCreator.createObjectURL(blob);
            estado.responsable.urlFotoPerfil = url;
            return estado;
        });

        return response;
    },
    cambiarEstadoSEP: async (idSEP: number, idEstado: number) => {
        let args = new Map<string, string>();
        args.set("idSEP", `${idSEP}`);
        args.set("idEstado", `${idEstado}`);
        await request(HttpRequestType.PUT, "solicitudEspacio/cambiarEstadoSEP", true, args);
    },
    obtenerEspaciosParaSolicitud: async () => {
        let response : {id: number, nombre: string}[] = await request(HttpRequestType.GET, "solicitudEspacio/obtenerEspaciosParaSolicitud", true);
        return response;
    },
    vincularEspacioASolicitud: async (idSEP: number, idEspacio: number) => {
        let args = new Map<string, string>();
        args.set("idSEP", `${idSEP}`);
        args.set("idEspacio", `${idEspacio}`);
        await request(HttpRequestType.PUT, "solicitudEspacio/vincularEspacioASolicitud", true, args);
    },
}