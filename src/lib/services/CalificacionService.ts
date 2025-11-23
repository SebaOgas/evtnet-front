import type DTOAltaMotivoCalificacion from "$lib/dtos/motivoCalificacion/DTOAltaMotivoCalificacion";
import type DTOModificarMotivoCalificacion from "$lib/dtos/motivoCalificacion/DTOModificarMotivoCalificacion";
import type DTOMotivoCalificacion from "$lib/dtos/motivoCalificacion/DTOMotivoCalificacion";
import type DTOAltaTipoCalificacion from "$lib/dtos/tipoCalificacion/DTOAltaTipoCalificacion";
import type DTOModificarTipoCalificacion from "$lib/dtos/tipoCalificacion/DTOModificarTipoCalificacion";
import type DTOTipoCalificacion from "$lib/dtos/tipoCalificacion/DTOTipoCalificacion";
import { HttpRequestType, request } from "$lib/request/request";

export const CalificacionService={
    obtenerListaMotivosCalificacion: async () => {
            let response = await request(HttpRequestType.GET, "motivoCalificacion/obtenerMotivosCalificacion", true, null);
            return response.content as DTOMotivoCalificacion[];
    },
    altaMotivoCalificacion: async (motivo: DTOAltaMotivoCalificacion) => {
        await request(HttpRequestType.POST, "motivoCalificacion/alta", true, null, JSON.stringify(motivo));
    },
    obtenerMotivoCalificacionCompleto: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        let response : DTOMotivoCalificacion = await request(HttpRequestType.GET, "motivoCalificacion/obtenerMotivoCalificacionCompleto", true, args);
        return response;
    },
    modificarMotivoCalificacion: async (motivo: DTOModificarMotivoCalificacion) => {
        await request(HttpRequestType.PUT, "motivoCalificacion/modificar", true, null, JSON.stringify(motivo));
    },
    bajaMotivoCalificacion: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        await request(HttpRequestType.DELETE, "motivoCalificacion/baja", true, args);
    },
    obtenerTiposCalificacion:async()=>{
        let response : {id: number, nombre: string}[] = await request(HttpRequestType.GET, "tipoCalificacion/obtenerTiposCalificacionSelect", true, null);
        return response;
    },
    obtenerListaTiposCalificacion: async () => {
            let response = await request(HttpRequestType.GET, "tipoCalificacion/obtenerTiposCalificacion", true, null);
            let data=response.content as DTOTipoCalificacion[];
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
    altaTipoCalificacion: async (motivo: DTOAltaTipoCalificacion) => {
        await request(HttpRequestType.POST, "tipoCalificacion/alta", true, null, JSON.stringify(motivo));
    },
    obtenerTipoCalificacionCompleto: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        let response : DTOTipoCalificacion = await request(HttpRequestType.GET, "tipoCalificacion/obtenerTipoCalificacionCompleto", true, args);
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
    modificarTipoCalificacion: async (tipo: DTOModificarTipoCalificacion) => {
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

        if (tipo.url && !esDataBase64(tipo.url)) {
            tipo.url = await convertirADataBase64(tipo.url);
        }

        await request(HttpRequestType.PUT, "tipoCalificacion/modificar", true, null, JSON.stringify(tipo));
    },
    bajaTipoCalificacion: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        await request(HttpRequestType.DELETE, "tipoCalificacion/baja", true, args);
    }
}