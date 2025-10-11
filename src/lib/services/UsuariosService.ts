import type DTOAltaRol from "$lib/dtos/usuarios/DTOAltaRol";
import type DTOAltaUsuario from "$lib/dtos/usuarios/DTOAltaUsuario";
import type DTOAuth from "$lib/dtos/usuarios/DTOAuth";
import type DTOCalificacion from "$lib/dtos/usuarios/DTOCalificacion";
import type DTODenunciaUsuario from "$lib/dtos/usuarios/DTODenunciaUsuario";
import type DTOEditarPerfil from "$lib/dtos/usuarios/DTOEditarPerfil";
import type DTOEspaciosUsuario from "$lib/dtos/usuarios/DTOEspaciosUsuario";
import type DTOEventosUsuario from "$lib/dtos/usuarios/DTOEventosUsuario";
import type DTOFiltrosBusquedaUsuarios from "$lib/dtos/usuarios/DTOFiltrosBusquedaUsuarios";
import type DTOGruposUsuario from "$lib/dtos/usuarios/DTOGruposUsuario";
import type DTOInteraccionesUsuario from "$lib/dtos/usuarios/DTOInteraccionesUsuario";
import type DTOModificarRol from "$lib/dtos/usuarios/DTOModificarRol";
import type DTOModificarUsuario from "$lib/dtos/usuarios/DTOModificarUsuario";
import type DTOPerfil from "$lib/dtos/usuarios/DTOPerfil";
import type DTORegistrarse from "$lib/dtos/usuarios/DTORegistrarse";
import type DTOResultadoBusquedaUsuario from "$lib/dtos/usuarios/DTOResultadoBusquedaUsuario";
import type DTORol from "$lib/dtos/usuarios/DTORol";
import type DTOSupereventosUsuario from "$lib/dtos/usuarios/DTOSupereventosUsuario";
import type DTOTipoCalificacion from "$lib/dtos/usuarios/DTOTipoCalificacion";
import type DTOUsuarioCompleto from "$lib/dtos/usuarios/DTOUsuarioCompleto";
import type Page from "$lib/request/Page";
import {HttpRequestType, request } from "$lib/request/request";
import { permisos, token, user, username } from "$lib/stores";

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
        user.set(response.user);
    },

    registrarse: async (
        data: DTORegistrarse
    ) => {
        let response : DTOAuth = await request(HttpRequestType.POST, "usuarios/registrarse", true, null, JSON.stringify(data), false);
        
        token.set(response.token);
        permisos.set(response.permisos);
        username.set(response.username);
        user.set(response.user);
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
        user.set(response.user);
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

        await request(HttpRequestType.POST, "usuarios/enviarCodigoRecuperarContrasena", true, args);
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
        user.set(response.user);
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
        
        let urlCreator = window.URL || window.webkitURL;
        let url = urlCreator.createObjectURL(response.content);

        return url;
    },

    obtenerImagenDeCalificacion: async(nombre: string) => {
        let args = new Map<string, string>();
        args.set("nombre", nombre);
        
        let response = await request(HttpRequestType.GET, "usuarios/obtenerImagenDeCalificacion", false, args, null, false);
        
        /*const bytes = new Uint8Array(response.content.length);

        for (let i = 0; i < response.content.length; i++) {
            bytes[i] = response.content.charCodeAt(i);
        }
        
        let urlCreator = window.URL || window.webkitURL;
        let url = urlCreator.createObjectURL(new Blob([bytes], {type: response.contentType}));*/
        
        let urlCreator = window.URL || window.webkitURL;
        let url = urlCreator.createObjectURL(response.content);


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
    },



    obtenerCalificacionTiposPara: async (username: string) => {
        let args = new Map<string, string>();
        args.set("username", username);

        let response : {id: number, nombre: string}[] = await request(HttpRequestType.GET, "usuarios/obtenerCalificacionTipos", true, args);

        return response;
    },
    obtenerTiposYMotivosCalificacion: async () => {
        let response : DTOTipoCalificacion[] = await request(HttpRequestType.GET, "usuarios/obtenerTiposYMotivosCalificacion", false);

        return response;
    },
    calificarUsuario: async (data: DTOCalificacion) => {
        await request(HttpRequestType.POST, "usuarios/calificarUsuario", true, null, JSON.stringify(data));
    },

    obtenerRoles: async () => {
        let response : {id: number, nombre: string, checked: boolean}[] = await request(HttpRequestType.GET, "usuarios/obtenerRoles", true);

        return response;
    },
    adminBuscarUsuarios: async (filtros: DTOFiltrosBusquedaUsuarios, page: number) => {
        let args = new Map<string, string>();
        args.set("page", `${page}`);

        let response : Page<DTOResultadoBusquedaUsuario[]> = await request(HttpRequestType.PUT, "usuarios/adminBuscarUsuarios", true, args, JSON.stringify(filtros));
        return response;
    },
    adminObtenerUsuarioCompleto: async (username: string) => {
        let args = new Map<string, string>();
        args.set("username", username);

        let response : DTOUsuarioCompleto = await request(HttpRequestType.GET, "usuarios/adminObtenerUsuarioCompleto", true, args);
        return response;
    },
    adminObtenerEventosUsuario: async (username: string) => {
        let args = new Map<string, string>();
        args.set("username", username);

        let response : DTOEventosUsuario = await request(HttpRequestType.GET, "usuarios/adminObtenerEventosUsuario", true, args);
        return response;
    },
    adminObtenerEspaciosUsuario: async (username: string) => {
        let args = new Map<string, string>();
        args.set("username", username);

        let response : DTOEspaciosUsuario = await request(HttpRequestType.GET, "usuarios/adminObtenerEspaciosUsuario", true, args);
        return response;
    },
    adminObtenerSupereventosUsuario: async (username: string) => {
        let args = new Map<string, string>();
        args.set("username", username);

        let response : DTOSupereventosUsuario = await request(HttpRequestType.GET, "usuarios/adminObtenerSupereventosUsuario", true, args);
        return response;
    },
    adminObtenerGruposUsuario: async (username: string) => {
        let args = new Map<string, string>();
        args.set("username", username);

        let response : DTOGruposUsuario = await request(HttpRequestType.GET, "usuarios/adminObtenerGruposUsuario", true, args);
        return response;
    },
    adminObtenerInteraccionesUsuario: async (username: string) => {
        let args = new Map<string, string>();
        args.set("username", username);

        let response : DTOInteraccionesUsuario = await request(HttpRequestType.GET, "usuarios/adminObtenerInteraccionesUsuario", true, args);
        return response;
    },
    bajaUsuario: async (username: string) => {
        let args = new Map<string, string>();
        args.set("username", username);

        await request(HttpRequestType.DELETE, "usuarios/bajaUsuario", true, args);
    },
    altaUsuario: async (data: DTOAltaUsuario) => {
        await request(HttpRequestType.POST, "usuarios/altaUsuario", true, null, JSON.stringify(data));
    },
    modificarUsuario: async (data: DTOModificarUsuario) => { 
        await request(HttpRequestType.PUT, "usuarios/modificarUsuario", true, null, JSON.stringify(data));

    },


    obtenerRolesCompletos: async (page: number) => {
        let args = new Map<string, string>();
        args.set("page", `${page}`);

        let response : Page<DTORol[]> = await request(HttpRequestType.GET, "usuarios/obtenerRolesCompletos", true, args);

        return response;
    },
    bajaRol: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);

        await request(HttpRequestType.DELETE, "usuarios/bajaRol", true, args);
    },
    
    obtenerPermisos: async () => {
        let response : {nombre: string, reservado: boolean}[] = await request(HttpRequestType.GET, "usuarios/obtenerPermisos", true);

        return response;
    },
    altaRol: async (data: DTOAltaRol) => {
        await request(HttpRequestType.POST, "usuarios/altaRol", true, null, JSON.stringify(data));
    },
    obtenerRolCompleto: async (id: number) => {
        let args = new Map<string, string>();
        args.set("id", `${id}`);

        let response : DTORol = await request(HttpRequestType.GET, "usuarios/obtenerRolCompleto", true, args);

        return response;
    },
    modificarRol: async (data: DTOModificarRol) => {
        await request(HttpRequestType.PUT, "usuarios/modificarRol", true, null, JSON.stringify(data));
    },


    obtenerDenunciasUsuario: async (page: number) => {
        let args = new Map<string, string>();
        args.set("page", `${page}`);

        let response : Page<DTODenunciaUsuario[]> = await request(HttpRequestType.GET, "usuarios/obtenerDenunciasUsuario", true, args);

        return response;
    },
}