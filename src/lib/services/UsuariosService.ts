import type DTOAuth from "$lib/dtos/usuarios/DTOAuth";
import type DTORegistrarse from "$lib/dtos/usuarios/DTORegistrarse";
import {HttpRequestType, request } from "$lib/request/request";
import { permisos, token } from "$lib/stores";

export const UsuariosService = {
    iniciarSesion: async (
        mail: string, 
        password: string
    ) => {
        let args = new Map<string, string>();
        args.set("mail", mail);
        args.set("password", password);

        let response : DTOAuth = await request(HttpRequestType.POST, "usuarios/iniciarSesion", true, args, null, false);
        
        token.set(response.token);
        permisos.set(response.permisos);

        return response;
    },

    registrarse: async (
        data: DTORegistrarse
    ) => {
        let response : DTOAuth = await request(HttpRequestType.POST, "usuarios/registrarse", true, null, JSON.stringify(data), false);
        
        token.set(response.token);
        permisos.set(response.permisos);

        return response;
    },

    ingresarCodigo: async (
        codigo: string
    ) => {
        let args = new Map<string, string>();
        args.set("codigo", codigo);

        await request(HttpRequestType.POST, "usuarios/ingresarCodigo", true, args);
        return;
    },

    enviarCodigo: async () => {
        await request(HttpRequestType.PUT, "usuarios/enviarCodigo", false);
        return;
    }
}