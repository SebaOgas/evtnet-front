import type DTOBusquedaSEP from "$lib/dtos/espacios/DTOBusquedaSEP";
import type DTOCambioEstadoSEP from "$lib/dtos/espacios/DTOCambioEstadoSEP";
import type DTOCrearSolicitudEspacio from "$lib/dtos/espacios/DTOCrearSolicitudEspacio";
import type DTOEspacioPrivadoCompleto from "$lib/dtos/espacios/DTOEspacioPrivadoCompleto";
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
        let response : {id: number, nombre: string, checked: boolean}[] = await request(HttpRequestType.GET, "estadoSolicitudEspacioPublico/obtenerEstadosSEP", true);
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

        response.sepEstados = response.sepEstados.map(estado => {
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
    cambiarEstadoSEP: async (cambio: DTOCambioEstadoSEP) => {
        await request(HttpRequestType.PUT, "solicitudEspacio/cambiarEstadoSEP", true, null, JSON.stringify(cambio));
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
    buscarSolicitudesEspaciosPrivados: async (data: DTOBusquedaSEP) => {
        let response : DTOResultadoBusquedaSEP[] = await request(HttpRequestType.PUT, "solicitudEspacio/buscarSolicitudesEspaciosPrivados", false, null, JSON.stringify(data));
        return response;
    },
    obtenerEstadosSEPrivados: async () => {
        let response : {id: number, nombre: string, checked: boolean}[] = await request(HttpRequestType.GET, "espacios/obtenerEstadosEspacio", true);
        return response;
    },
    obtenerDetalleSolicitudEPrivado: async (idSEP: number) => {
        let args = new Map<string, string>();
        args.set("idSEP", `${idSEP}`);
        let response : DTOEspacioPrivadoCompleto = await request(HttpRequestType.GET, "solicitudEspacio/obtenerDetalleSolicitudEPrivado", true, args);
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

        return response;
    },
    cambiarEstadoSEPrivado: async (cambio: DTOCambioEstadoSEP) => {
        await request(HttpRequestType.PUT, "solicitudEspacio/cambiarEstadoSEPrivado", true, null, JSON.stringify(cambio));
    },
    descargarDocumentacionEP: async (idEspacio: number) => {
        let args = new Map<string, string>();
        args.set("idEspacio", `${idEspacio}`);

        const response = await request(HttpRequestType.GET, "solicitudEspacio/descargarDocumentacion", true, args);

        const blob = response.content;
        const contentType = response.contentType || "application/zip";

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `documentacion_espacio_${idEspacio}.zip`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }

}