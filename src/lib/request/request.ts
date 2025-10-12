import {loading, token} from "$lib/stores"
import { get } from "svelte/store";

export enum HttpRequestType {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE"
}

const BASE_URL = "http://localhost:8080"

const DEBUG : boolean = true

export class HttpError {
    code: number;
    message: string;

    constructor(code: number, message: string) {
        this.code = code
        this.message = message
    }
}

export class ProxyError {
    code: number;
    message: string;
    url: string;

    constructor(code: number, message: string, url: string) {
        this.code = code
        this.message = message
        this.url = url
    }
}

export async function request(
    type: HttpRequestType, //GET, POST, PUT, DELETE
    path: string, //Ruta dentro de la API
    block: boolean = true, //Mostrar spinner; impedir que se interactúe con la página
    args: Map<string, string | string[]> | null = null, //Lista de argumentos a pasar en la URL
    body: string | FormData | null = null, //Cuerpo de la solicitud
    useAuth : boolean = true, //Autenticar al usuario al realizar la solicitud
    baseUrl : string = BASE_URL //Ruta base de la API, es concatenada antes de path
) : Promise<any> {
    let headers: any = {};

    if (useAuth) {  
        headers["Authorization"] = "Bearer " + get(token);
    }

    let data: RequestInit = {
        method: type,
        headers: headers,
        mode: 'cors',
        credentials: "include"
    };

    //Si el body es FormData, NO seteamos Content-Type (el navegador lo hace automáticamente)
    if (body instanceof FormData) {
        data.body = body;
    } else if (body !== null) {
        headers["Content-Type"] = "application/json";
        data.body = body;
    }


    let argUrl = "?"

    if (args !== null) {
        args.forEach((val, key) => {
            if (Array.isArray(val)) {
                val.forEach(v => {
                    argUrl += `${key}=${v}&`
                })
            } else {
                argUrl += `${key}=${val}&`
            }
        });
    }

    if (body !== null) {
        data["body"] = body
    }

    argUrl = argUrl.substring(0, argUrl.length - 1)

    let url = `${baseUrl}/${path}${argUrl}`

    url = encodeURI(url)

    if (block) loading.set(true);
    
    let response = await fetch(url, data)
    .catch((error) => {
        if (DEBUG) {
            console.warn(`Using proxy for request: ${url}`);
        } else {
            throw new HttpError(-1, "No se pudo realizar la solicituda");
            
        }
    });

    function isOk(code: number) {
        return code >= 200 && code < 300;
    }

    if (response instanceof Response && !isOk(response.status) && response.status !== 404) {
        if (block) loading.set(false);
        try {
            let error = await response.json() as HttpError;
            throw error;
        } catch (e) {
            throw new HttpError(-1, "No se pudo realizar la solicitud");
        }
    }

    if (DEBUG && (!(response instanceof Response) || response.status === 404)) {
        const dummy_url = `/proxy/${path}.txt`
        const dummy = await fetch(dummy_url)
        const dummy_txt = await dummy.text()

        if (block) loading.set(false);

        const dummy_regex : RegExp = /REQUEST TYPE\s+(\w+)\s+REQUEST ARGS\s+([\s\S]*?)REQUEST BODY\s+({[\s\S]*?})\s+RESPONSE TYPE\s+(\w+)\s+RESPONSE BODY\s+([\w\s\S]*)/
    
        let dummy_parts = dummy_regex.exec(dummy_txt)

        if (dummy_parts === null) throw new ProxyError(0, "El endpoint dummy tiene un formato incorrecto", dummy_url);      

        let dummy_req_type = dummy_parts[1];
        if (!["GET","POST","PUT","DELETE"].includes(dummy_req_type))
            throw new ProxyError(1, `Método HTTP no soportado: ${dummy_req_type}`, dummy_url)
        
        let dummy_req_args = dummy_parts[2];
        let req_args_regex : RegExp = /^\s*(?:[^\s]+\s*\:\s*[^\s]+\s*\n+)*$/
        if (!req_args_regex.test(dummy_req_args)) {
            throw new ProxyError(2, `Argumentos de solicitud no válidos`, dummy_url)
        }

        let dummy_req_body = dummy_parts[3];
        try {
            JSON.parse(dummy_req_body)
        } catch (e) {
            throw new ProxyError(3, `Solicitud JSON no válida`, dummy_url)
        }

        let dummy_res_type = dummy_parts[4];
        if (!["TEXT","JSON","BLOB"].includes(dummy_res_type))
            throw new ProxyError(4, `Tipo de contenido de respuesta HTTP no soportado: ${dummy_res_type}`, dummy_url)
        
        let dummy_res_body = dummy_parts[5];

        let dummy_res_body_blob_type;
        let dummy_res_body_blob_content;

        if (dummy_res_type === "BLOB") {
            let index : number | undefined = dummy_res_body.indexOf("\r\n")
            if (index === -1) index = 0;
            dummy_res_body_blob_type = dummy_res_body.substring(0, index);
            dummy_res_body_blob_content = window.atob(dummy_res_body.substring(index + 2).trim().replace(/\s/g, ''));
        }

        switch (dummy_res_type) {
            case "TEXT":
                return dummy_res_body        
            case "JSON":
                try {
                    return JSON.parse(dummy_res_body)
                } catch (e) {
                    throw new ProxyError(5, `Respuesta JSON no válida`, dummy_url)
                }
            case "BLOB":
                return {content: dummy_res_body_blob_content, contentType: dummy_res_body_blob_type}
            default:
                break;
        }        
    }

    response = <Response>response;

    if (block) loading.set(false);

    if (isOk(response.status)) {
        let contentType = response.headers.get("content-type")
        switch (contentType) {
            case "text/plain":
                return await response.text()
            case "application/json":
                return await response.json()
            default:
                return await {content: response.blob(), contentType: response.headers.get("content-type")};
        }
    }

    let res = await response.json()

    throw <HttpError> res;
}