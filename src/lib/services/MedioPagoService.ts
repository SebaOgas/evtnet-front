import type DTOAltaMedioPago from "$lib/dtos/medioPago/DTOAltaMedioPago";
import type DTOMedioPago from "$lib/dtos/medioPago/DTOMedioPago";
import type DTOModificarMedioPago from "$lib/dtos/medioPago/DTOModificarMedioPago";
import { HttpRequestType, request } from "$lib/request/request";

export const MedioPagoService = {
    obtenerMediosPago: async () => {
        let response = await request(HttpRequestType.GET, "medioPago/obtenerMediosPago", false, null);
        let data=response.content as DTOMedioPago[];
        return data.map(iconoObj => {
            const byteCharacters = atob(iconoObj.url);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const bytes = new Uint8Array(byteNumbers);
            let urlCreator = window.URL || window.webkitURL;            
            let mimeType = response.contentType === "svg" ? "image/svg+xml" : "image/png";
            let url = urlCreator.createObjectURL(new Blob([bytes], {type: mimeType}));
            iconoObj.url = url;
            return iconoObj;
        });
    },
    bajaMedioPago: async (idMedioPago: number) => {
        let args = new Map<string, string>();
        args.set("id", `${idMedioPago}`);
        await request(HttpRequestType.DELETE, "medioPago/baja", true, args);
        return;
    },
    obtenerMedioPagoCompleto: async (id: number) => {
            let args = new Map<string, string>();
            args.set("id", `${id}`);
            let response : DTOMedioPago = await request(HttpRequestType.GET, "medioPago/obtenerMedioPagoCompleto", true, args);
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
    modificarMedioPago: async (medioPago: DTOModificarMedioPago) => {
            const esDataBase64 = (str: string) => /^data:image\/[a-zA-Z]+;base64,/.test(str);

            const convertirADataBase64 = async (url: string): Promise<string> => {
                const response = await fetch(url);
                const blob = await response.blob();
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result as string); 
                    };
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(blob);
                });
            };

            if (medioPago.url && !esDataBase64(medioPago.url)) {
                medioPago.url = await convertirADataBase64(medioPago.url);
            }
            await request(HttpRequestType.PUT, "medioPago/modificar", true, null, JSON.stringify(medioPago));
    },
    altaMedioPago: async (medioPago: DTOAltaMedioPago) => {
            await request(HttpRequestType.POST, "medioPago/alta", true, null, JSON.stringify(medioPago));
    },
}