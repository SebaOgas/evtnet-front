import type DTOAuth from "$lib/dtos/usuarios/DTOAuth";
import type DTOEditarPerfil from "$lib/dtos/usuarios/DTOEditarPerfil";
import type DTOPerfil from "$lib/dtos/usuarios/DTOPerfil";
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

    obtenerPerfil: async(username: string) => {
        let args = new Map<string, string>();
        args.set("username", username);

        let response : DTOPerfil = await request(HttpRequestType.GET, "usuarios/obtenerPerfil", true, args);

        return response;
    },

    obtenerFotoDePerfil: async(username: string) => {
        let args = new Map<string, string>();
        args.set("username", username);
        
        let response = await request(HttpRequestType.GET, "usuarios/obtenerFotoDePerfil", false, args);

        const bytes = new Uint8Array(response.content.length);
    
        for (let i = 0; i < response.content.length; i++) {
            bytes[i] = response.content.charCodeAt(i);
        }
        
        let urlCreator = window.URL || window.webkitURL;
        let url = urlCreator.createObjectURL(new Blob([bytes], {type: response.contentType}));

        return url;
    },

    obtenerImagenDeCalificacion: async(username: string) => {
        let args = new Map<string, string>();
        args.set("username", username);
        
        let response = await request(HttpRequestType.GET, "usuarios/obtenerImagenDeCalificacion", false, args, null, false);
        
        const bytes = new Uint8Array(response.content.length);

        for (let i = 0; i < response.content.length; i++) {
            bytes[i] = response.content.charCodeAt(i);
        }
        
        let urlCreator = window.URL || window.webkitURL;
        let url = urlCreator.createObjectURL(new Blob([bytes], {type: response.contentType}));


        return url;
    },


    obtenerPerfilParaEditar: async(username: string) => {
        let args = new Map<string, string>();
        args.set("username", username);

        let response : DTOEditarPerfil = await request(HttpRequestType.GET, "usuarios/obtenerPerfilParaEditar", true, args);

        return response;
    },

    editarPerfil: async(data: FormData) => {
        await request(HttpRequestType.PUT, "usuarios/editarPerfil", true, null, data);
    }

}