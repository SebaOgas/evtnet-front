import type { DTOActualizarImagenesEspacio } from "$lib/dtos/espacios/DTOActualizarImagenesEspacio";
import { HttpRequestType, request } from "$lib/request/request";


export const ImagenesEspaciosService = {
    obtener: async (idEspacio: number, orden: number) => {
        let args = new Map<string, string>();
        args.set("idEspacio", `${idEspacio}`);
        args.set("orden", `${orden}`);
        
        let response = await request(HttpRequestType.GET, "imagenesEspacios/obtener", false, args);

        const byteCharacters = atob(response.content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob= new Blob([byteArray], { type: response.contentType });
        let urlCreator = window.URL || window.webkitURL;
        let url = urlCreator.createObjectURL(blob);

        console.log(url);

        return {
            id: response.id,
            url
        };
    },
    
    actualizar: async (imagenesPayload: DTOActualizarImagenesEspacio) => {
        // Convertir archivos nuevos a blobUrl si existen
        const imagenesJson = imagenesPayload.imagenes.map(img => {
            if (img.archivo) {
                return {
                    ...img,
                    blobUrl: URL.createObjectURL(img.archivo),
                    archivo: undefined
                };
            }
            return img;
        });
        const payload = {
            idEspacio: imagenesPayload.idEspacio,
            imagenes: imagenesJson
        };
        await request(HttpRequestType.POST, "imagenesEspacios/actualizar", true, null, JSON.stringify(payload));
    },
}