import type DTOAltaInstanciaMascota from "$lib/dtos/mascota/DTOAltaInstanciaMascota";
import type DTOEventoMascota from "$lib/dtos/mascota/DTOEventoMascota";
import type DTOInstanciaMascota from "$lib/dtos/mascota/DTOInstanciaMascota";
import type DTOInstanciaMascotaPagina from "$lib/dtos/mascota/DTOInstanciaMascotaPagina";
import type DTOModificarInstanciaMascota from "$lib/dtos/mascota/DTOModificarInstanciaMascota";
import type Page from "$lib/request/Page";
import { HttpRequestType, request } from "$lib/request/request";

export const InstanciasMascotaService = {
    obtenerInstanciasMascota: async (page: number, texto?: string) => {
        let args = new Map<string, string>();
        args.set("page", `${page}`);
        if (texto && texto.trim().length > 0) {
            args.set("texto", texto.trim());
        }
        let response : Page<DTOInstanciaMascota[]> = await request(HttpRequestType.GET, "instanciasMascota/obtenerInstanciasMascota", false, args);
        return response;
    },
    bajaInstanciaMascota: async (idInstancia: number) => {
        let args = new Map<string, string>();
        args.set("id", `${idInstancia}`);
        await request(HttpRequestType.DELETE, "instanciasMascota/baja", true, args);
        return;
    },
    obtenerInstanciaMascotaCompleta: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        let response: DTOInstanciaMascota = await request(HttpRequestType.GET, "instanciasMascota/obtenerInstanciaMascotaCompleta", true, args);
        return response;
    },
    modificarInstanciaMascota: async (instancia: DTOModificarInstanciaMascota) => {
        await request(HttpRequestType.PUT, "instanciasMascota/modificar", true, null, JSON.stringify(instancia));
    },
    altaInstanciaMascota: async (instancia: DTOAltaInstanciaMascota) => {
        await request(HttpRequestType.POST, "instanciasMascota/alta", true, null, JSON.stringify(instancia));
    },
    obtenerEventosMascota: async () => {
        let response : DTOEventoMascota[] = await request(HttpRequestType.GET, "instanciasMascota/obtenerEventosMascota", true);
        return response;
    },
    obtenerInstanciasParaPagina: async (url: string) => {
        let args = new Map<string, string>();
        args.set("url", url);
        let response: DTOInstanciaMascotaPagina[] = await request(HttpRequestType.GET, "instanciasMascota/obtenerInstanciasParaPagina", true, args);
        
        // Decode base64 images
        return response.map(instancia => ({
            ...instancia,
            secuencia: instancia.secuencia.map(item => {
                if (item.url) {
                    const byteCharacters = atob(item.url);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const bytes = new Uint8Array(byteNumbers);
                    let urlCreator = window.URL || window.webkitURL;
                    let url = urlCreator.createObjectURL(new Blob([bytes], {type: 'image/png'}));
                    return { ...item, url };
                }
                return item;
            })
        }));
    },
    registrarVisualizacion: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);
        await request(HttpRequestType.POST, "instanciasMascota/registrarVisualizacion", true, args);
    }
}