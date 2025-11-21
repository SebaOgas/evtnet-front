export default interface DTOGrupo {
    id: number,
    nombre: string,
    descripcion: string,
    fechaAlta: Date,
    idChat: number,
    participantes: {
        username: string,
        nombre: string,
        apellido: string,
        fechaHoraUnion: Date,
        aceptado: boolean
    }[],

    esAdministrador: boolean,
    invitado: boolean
}