import type DTOBackup from "$lib/dtos/backups/DTOBackup";
import type DTOProgramacionBackupsAutomaticos from "$lib/dtos/backups/DTOProgramacionBackupsAutomaticos";
import type DTOChatResponse from "$lib/dtos/chat/DTOChatResponse";
import type DTOMensajeResponse from "$lib/dtos/chat/DTOMensajeResponse";
import type Page from "$lib/request/Page";
import { HttpRequestType, request } from "$lib/request/request";

export const ChatsService={
    obtenerMensajesDeChat: async (idChat:number) => {
        let response : DTOMensajeResponse[] = await request(HttpRequestType.GET, `chats/${idChat}/mensajes`, true);
        return response;
    } ,
    crearChatDirecto: async (username: string) => {
        let args = new Map<string, string>();
        args.set("username", `${username}`);

        let response : DTOChatResponse = await request(HttpRequestType.GET, `chats/directo`, true, args);
        return response;
    } ,
    obtenerDetalle: async (idChat:number) => {
        let response : DTOChatResponse = await request(HttpRequestType.GET, `chats/detalle/${idChat}`, true);
        return response;
    } 
}