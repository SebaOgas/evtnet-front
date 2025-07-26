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
    }
}