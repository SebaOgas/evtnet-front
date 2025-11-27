export default interface DTOChatResponse {
    id: number,
    tipo: string,
    fechaHoraAlta: Date,
    espacioId: number | null,
    nombreEspacio: string | null,
    eventoId: number | null,
    nombreEvento: string | null,
    superEventoId: number | null,
    nombreSuperEvento: string | null,
    usuarioUsername: string | null,
    usuarioNombre: string | null,
    usuarioApellido: string | null,
    grupoId: number | null,
    nombreGrupo: string | null
}