import type { DTOActualizarImagenesEspacio } from "$lib/dtos/espacios/DTOActualizarImagenesEspacio";
import { HttpRequestType, request } from "$lib/request/request";


export const ImagenesEspaciosService = {
    obtener: async (idEspacio: number, orden: number) => {
        let args = new Map<string, string>();
        args.set("idEspacio", `${idEspacio}`);
        args.set("orden", `${orden}`);
        
        let response = await request(HttpRequestType.GET, "imagenesEspacios/obtener", false, args);
    
        const dataUrl = `data:image/${response.contentType};base64,${response.content}`;

        /*const byteCharacters = atob(response.content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob= new Blob([byteArray], { type: response.contentType });
        let urlCreator = window.URL || window.webkitURL;
        let url = urlCreator.createObjectURL(blob);*/

        return {
            id: response.id,
            url:dataUrl
        };
    },
    
    actualizar: async (imagenesPayload: DTOActualizarImagenesEspacio) => {
        // Convertir las imágenes a base64 antes de enviarlas
        const imagenesBase64 = await Promise.all(
            imagenesPayload.imagenes.map(async (img) => {
                if (img.archivo) {
                    const base64 = await convertirArchivoABase64(img.archivo);
                    return {
                        ...img,
                        blobUrl: base64, // enviás esto al backend
                        archivo: undefined, // ya no mandamos el File
                    };
                }
                return img;
            })
        );

        const payload = {
            idEspacio: imagenesPayload.idEspacio,
            imagenes: imagenesBase64
        };

        await request(HttpRequestType.POST,"imagenesEspacios/actualizar",true,null,JSON.stringify(payload)
        );
    },
    

}
const convertirArchivoABase64 = (archivo: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(archivo); // lee el archivo completo (incluye "data:image/png;base64,...")
    });
};
