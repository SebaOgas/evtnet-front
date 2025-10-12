import type DTOBackup from "$lib/dtos/backups/DTOBackup";
import type DTOProgramacionBackupsAutomaticos from "$lib/dtos/backups/DTOProgramacionBackupsAutomaticos";
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
        await request(HttpRequestType.DELETE, "backups/eliminarCopia", true, null, JSON.stringify(copia));
    },

    obtenerProgramacion: async () => {
        let response : DTOProgramacionBackupsAutomaticos = await request(HttpRequestType.GET, "backups/obtenerProgramacion", false);
        return response;
    },

    programarCopiasAutomaticas: async (data: DTOProgramacionBackupsAutomaticos) => {
        await request(HttpRequestType.PUT, "backups/programarCopiasAutomaticas", true, null, JSON.stringify(data));
    },
}