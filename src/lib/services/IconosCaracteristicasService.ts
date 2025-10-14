import type DTOCaracteristica from "$lib/dtos/espacios/DTOCaracteristica";
import type DTOAltaIconoCaracteristica from "$lib/dtos/iconoscaracteristicas/DTOAltaIconoCaracteristica";
import type DTOIconoCaracteristica from "$lib/dtos/iconoscaracteristicas/DTOIconoCaracteristica";
import type DTOModificarIconoCaracteristica from "$lib/dtos/iconoscaracteristicas/DTOModificarIconoCaracteristica";
import { HttpRequestType, request } from "$lib/request/request";


export const IconosCaracteristicasService = {
    obtener: async (idIcono: number) => {
        let args = new Map<string, string>();
        args.set("idIcono", `${idIcono}`);
        
        let response = await request(HttpRequestType.GET, "iconosCaracteristicas/obtener", false, args);

       /* const bytes = new Uint8Array(response.content.length);
    
        for (let i = 0; i < response.content.length; i++) {
            bytes[i] = response.content.charCodeAt(i);
        }
        
        let urlCreator = window.URL || window.webkitURL;
        let url = urlCreator.createObjectURL(new Blob([bytes], {type: response.contentType}));*/

        let urlCreator = window.URL || window.webkitURL;
        let url = urlCreator.createObjectURL(response.content);

        return url;
    },
    obtenerCaracteristicasEspacio: async (idEspacio: number) => {
        let args = new Map<string, string>();
        args.set("idEspacio", `${idEspacio}`);
        let response : DTOCaracteristica[] = await request(HttpRequestType.GET, "iconosCaracteristicas/obtenerCaracteristicasEspacio", true, args);
        return response.map(iconoObj => {
            const byteCharacters = atob(iconoObj.urlIcono);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const bytes = new Uint8Array(byteNumbers);
            let urlCreator = window.URL || window.webkitURL;
            let url = urlCreator.createObjectURL(new Blob([bytes], {type: iconoObj.contentType || 'image/png'}));

            iconoObj.urlIcono = url;
            return iconoObj;
        });
    },
    obtenerListaIconos: async () => {
        let response : {id: number, url: string, contentType?: string}[] = await request(HttpRequestType.GET, "iconosCaracteristicas/obtenerListaIconos", false, null);
        return response.map(iconoObj => {
            const byteCharacters = atob(iconoObj.url);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const bytes = new Uint8Array(byteNumbers);
            let urlCreator = window.URL || window.webkitURL;
            let url = urlCreator.createObjectURL(new Blob([bytes], {type: iconoObj.contentType || 'image/png'}));
            return {
                id: iconoObj.id,
                url: url
            };
        });
    },
    obtenerIconosCaracteristicas: async () => {
        let response  = await request(HttpRequestType.GET, "iconosCaracteristicas/obtenerIconosCaracteristicas", false, null);
        let data=response.content as DTOIconoCaracteristica[];
        return data.map(iconoObj => {
            const byteCharacters = atob(iconoObj.url);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const bytes = new Uint8Array(byteNumbers);
            let urlCreator = window.URL || window.webkitURL;
            let mimeType = iconoObj.contentType === "svg" ? "image/svg+xml" : "image/png";
            let url = urlCreator.createObjectURL(new Blob([bytes], {type: mimeType}));
            iconoObj.url = url;
            return iconoObj;
        });
    },
    bajaIconoCaracteristica: async (idIcono: number) => {
        let args = new Map<string, string>();
        args.set("id", `${idIcono}`);
        await request(HttpRequestType.DELETE, "iconosCaracteristicas/baja", true, args);
        return;
    },
    obtenerIconoCaracteristicaCompleto: async (id: number) => {
            let args = new Map<string, string>();
            args.set("id", `${id}`);
            let response : DTOIconoCaracteristica = await request(HttpRequestType.GET, "iconosCaracteristicas/obtenerIconoCaracteristicaCompleto", true, args);
            const byteCharacters = atob(response.url);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const bytes = new Uint8Array(byteNumbers);
            let urlCreator = window.URL || window.webkitURL;
            let mimeType = response.contentType === "svg" ? "image/svg+xml" : "image/png";
            let url = urlCreator.createObjectURL(new Blob([bytes], {type: mimeType}));
            response.url = url;
            return response;
    },
    modificarIconoCaracteristica: async (icono: DTOModificarIconoCaracteristica) => {
            await request(HttpRequestType.PUT, "iconosCaracteristicas/modificar", true, null, JSON.stringify(icono));
    },
    altaIconoCaracteristica: async (icono: DTOAltaIconoCaracteristica) => {
            await request(HttpRequestType.POST, "iconosCaracteristicas/alta", true, null, JSON.stringify(icono));
    },
}