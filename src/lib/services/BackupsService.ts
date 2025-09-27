import type DTOBackup from "$lib/dtos/backups/DTOBackup";
import { HttpRequestType, request } from "$lib/request/request";

export const BackupsService={
    obtenerBackups: async () => {
        let response : DTOBackup[]= await request(HttpRequestType.GET, "backups/obtenerBackups", true);
        return response;
    },
}