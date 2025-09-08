import type DTOCaracteristica from "$lib/dtos/espacios/DTOCaracteristica";
import { HttpRequestType, request } from "$lib/request/request";


export const IconosCaracteristicasService = {
    obtener: async (idIcono: number) => {
        let args = new Map<string, string>();
        args.set("idIcono", `${idIcono}`);
        
        let response = await request(HttpRequestType.GET, "iconosCaracteristicas/obtener", false, args);

        const bytes = new Uint8Array(response.content.length);
    
        for (let i = 0; i < response.content.length; i++) {
            bytes[i] = response.content.charCodeAt(i);
        }
        
        let urlCreator = window.URL || window.webkitURL;
        let url = urlCreator.createObjectURL(new Blob([bytes], {type: response.contentType}));

        return url;
    },
    obtenerCaracteristicasEspacio: async (idEspacio: number) => {
        let args = new Map<string, string>();
        args.set("idEspacio", `${idEspacio}`);
        let response : DTOCaracteristica[] = await request(HttpRequestType.GET, "iconosCaracteristicas/obtenerCaracteristicasEspacio", true, args);

        return response;
    },
    obtenerListaIconos: async () => {
        let response : {id: number, icono: string, contentType?: string}[] = await request(HttpRequestType.GET, "iconosCaracteristicas/obtenerListaIconos", false, null);
        return response.map(iconoObj => {
            const bytes = new Uint8Array(iconoObj.icono.length);
            for (let i = 0; i < iconoObj.icono.length; i++) {
                bytes[i] = iconoObj.icono.charCodeAt(i);
            }
            let urlCreator = window.URL || window.webkitURL;
            let url = urlCreator.createObjectURL(new Blob([bytes], {type: iconoObj.contentType || 'image/png'}));
            return {
                id: iconoObj.id,
                url: url
            };
        });
    }

}