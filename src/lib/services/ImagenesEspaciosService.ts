import { HttpRequestType, request } from "$lib/request/request";


export const ImagenesEspaciosService = {
    obtener: async (idEspacio: number, orden: number) => {
        let args = new Map<string, string>();
        args.set("idEspacio", `${idEspacio}`);
        args.set("orden", `${orden}`);
        
        let response = await request(HttpRequestType.GET, "imagenesEspacios/obtener", false, args);

        const bytes = new Uint8Array(response.content.length);
    
        for (let i = 0; i < response.content.length; i++) {
            bytes[i] = response.content.charCodeAt(i);
        }
        
        let urlCreator = window.URL || window.webkitURL;
        let url = urlCreator.createObjectURL(new Blob([bytes], {type: response.contentType}));

        return url;
    }
}