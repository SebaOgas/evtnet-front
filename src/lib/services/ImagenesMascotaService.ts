import type DTOAltaImagenMascota from "$lib/dtos/mascota/DTOAltaImagenMascota";
import type DTOImagenMascota from "$lib/dtos/mascota/DTOImagenMascota";
import type DTOImagenMascotaLista from "$lib/dtos/mascota/DTOImagenMascotaLista";
import type DTOModificarImagenMascota from "$lib/dtos/mascota/DTOModificarImagenMascota";
import type Page from "$lib/request/Page";
import { HttpRequestType, request } from "$lib/request/request";


export const ImagenesMascotaService = {
    obtener: async (idImagen: number) => {
        let args = new Map<string, string>();
        args.set("idImagen", `${idImagen}`);
        
        let response = await request(HttpRequestType.GET, "imagenesMascota/obtener", false, args);
        
        let urlCreator = window.URL || window.webkitURL;
        let url = urlCreator.createObjectURL(response.content);

        return url;
    },
    obtenerListaImagenes: async () => {
        let response : {id: number, nombre: string, url: string, contentType?: string}[] = await request(HttpRequestType.GET, "imagenesMascota/obtenerListaImagenes", false, null);
        return response.map(imagenObj => {
            const byteCharacters = atob(imagenObj.url);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const bytes = new Uint8Array(byteNumbers);
            let urlCreator = window.URL || window.webkitURL;
            let url = urlCreator.createObjectURL(new Blob([bytes], {type: imagenObj.contentType || 'image/png'}));
            return {
                id: imagenObj.id,
                nombre: imagenObj.nombre,
                url: url
            };
        });
    },

    obtenerImagenesMascota: async (page : number = 0) => {
        let args = new Map<string, string>();
        args.set("page", `${page}`);

        let response : Page<DTOImagenMascota[]> = await request(HttpRequestType.GET, "imagenesMascota/obtenerImagenesMascota", false, args);
        let data=response.content as DTOImagenMascota[];
        
        response.content = data.map(imagenObj => {
            const byteCharacters = atob(imagenObj.url);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const bytes = new Uint8Array(byteNumbers);
            let urlCreator = window.URL || window.webkitURL;
            let mimeType = imagenObj.contentType === "svg" ? "image/svg+xml" : "image/png";
            let url = urlCreator.createObjectURL(new Blob([bytes], {type: mimeType}));
            imagenObj.url = url;
            return imagenObj;
        });

        return response;
    },
    bajaImagenMascota: async (idImagen: number) => {
        let args = new Map<string, string>();
        args.set("id", `${idImagen}`);
        await request(HttpRequestType.DELETE, "imagenesMascota/baja", true, args);
        return;
    },
    obtenerImagenMascotaCompleta: async (id: number) => {
            let args = new Map<string, string>();
            args.set("id", `${id}`);
            let response : DTOImagenMascota = await request(HttpRequestType.GET, "imagenesMascota/obtenerImagenMascotaCompleta", true, args);
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
    modificarImagenMascota: async (imagen: DTOModificarImagenMascota) => {
            await request(HttpRequestType.PUT, "imagenesMascota/modificar", true, null, JSON.stringify(imagen));
    },
    altaImagenMascota: async (imagen: DTOAltaImagenMascota) => {
            await request(HttpRequestType.POST, "imagenesMascota/alta", true, null, JSON.stringify(imagen));
    },
    obtenerListaImagenesMascota: async () => {
        let response: DTOImagenMascotaLista[] = await request(HttpRequestType.GET, "imagenesMascota/obtenerLista", false, null);
        return response.map(imagenObj => {
            const byteCharacters = atob(imagenObj.url);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const bytes = new Uint8Array(byteNumbers);
            let urlCreator = window.URL || window.webkitURL;
            let url = urlCreator.createObjectURL(new Blob([bytes], {type: 'image/png'}));
            return {
                id: imagenObj.id,
                nombre: imagenObj.nombre,
                url: url
            };
        });
    }
}