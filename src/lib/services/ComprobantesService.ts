import type DTOComprobante from "$lib/dtos/comprobantes/DTOComprobante";
import { HttpRequestType, request } from "$lib/request/request";


export const ComprobantesService = {
  	obtener: async (numero: number) => {
		let args = new Map<string, string>();
		args.set("numero", `${numero}`);

		let response : DTOComprobante = await request(HttpRequestType.GET, "comprobantes/obtener", true, args);

		return response;
  	},

  	obtenerArchivo: async (numero: number) => {
		let args = new Map<string, string>();
		args.set("numero", `${numero}`);

		let response = await request(HttpRequestType.GET, "comprobantes/obtenerArchivo", true, args);

        const bytes = new Uint8Array(response.content.length);
    
        for (let i = 0; i < response.content.length; i++) {
            bytes[i] = response.content.charCodeAt(i);
        }
        
        let urlCreator = window.URL || window.webkitURL;
        let url = urlCreator.createObjectURL(new Blob([bytes], {type: response.contentType}));

        return url;
  	},
}