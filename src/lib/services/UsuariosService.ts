import type DTOAuth from "$lib/dtos/usuarios/DTOAuth";
import type DTORegistrarse from "$lib/dtos/usuarios/DTORegistrarse";
import {HttpRequestType, request } from "$lib/request/request";
import { permisos, token, username } from "$lib/stores";

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
        username.set(response.username);
    },

    registrarse: async (
        data: DTORegistrarse
    ) => {
        let response : DTOAuth = await request(HttpRequestType.POST, "usuarios/registrarse", true, null, JSON.stringify(data), false);
        
        token.set(response.token);
        permisos.set(response.permisos);
        username.set(response.username);
    },

    ingresarCodigo: async (
        codigo: string
    ) => {
        let args = new Map<string, string>();
        args.set("codigo", codigo);

        let response : DTOAuth = await request(HttpRequestType.POST, "usuarios/ingresarCodigo", true, args);
        
        token.set(response.token);
        permisos.set(response.permisos);
        username.set(response.username);
    },

    enviarCodigo: async () => {
        await request(HttpRequestType.PUT, "usuarios/enviarCodigo", false);
        return;
    },

    verificarUsernameDisponible: async (username: string) => {
        let args = new Map<string, string>();
        args.set("username", username);

        let resp : {disponible: boolean} = await request(HttpRequestType.GET, "usuarios/verificarUsernameDisponible", false, args, null, false);
        return resp.disponible;
    },

    enviarCodigoRecuperarContrasena: async (mail: string) => {
        let args = new Map<string, string>();
        args.set("mail", mail);

        await request(HttpRequestType.PUT, "usuarios/enviarCodigoRecuperarContrasena", true, args);
    },

    recuperarContrasena: async (mail: string, password: string, codigo: string) => {
        let args = new Map<string, string>();
        args.set("mail", mail);
        args.set("password", password);
        args.set("codigo", codigo);

        let response : DTOAuth = await request(HttpRequestType.PUT, "usuarios/recuperarContrasena", true, args, null, false);

        token.set(response.token);
        permisos.set(response.permisos);
        username.set(response.username);
    },

    restablecerContrasena: async (currentPassword: string, newPassword: string) => {
        let args = new Map<string, string>();
        args.set("currentPassword", currentPassword);
        args.set("newPassword", newPassword);

        await request(HttpRequestType.PUT, "usuarios/restablecerContrasena", true, args);
    },

}