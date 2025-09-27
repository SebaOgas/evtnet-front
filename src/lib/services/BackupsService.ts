import type DTOBackup from "$lib/dtos/backups/DTOBackup";
import { HttpRequestType, request } from "$lib/request/request";

export const BackupsService={
    obtenerBackups: async () => {
        let response : DTOBackup[]= await request(HttpRequestType.GET, "backups/obtenerBackups", true);
        return response;
    },

    programarCopiaManual: async (fechaHora: Date) => {
        let args = new Map<string, string>();
        args.set("fechaHora", `${(new Date(fechaHora)).getTime()}`);

        await request(HttpRequestType.POST, "backups/programarCopiaManual", true, args);
    },

    eliminarCopia: async (copia: DTOBackup) => {
        await request(HttpRequestType.POST, "backups/eliminarCopia", true, null, JSON.stringify(copia));
    },
}