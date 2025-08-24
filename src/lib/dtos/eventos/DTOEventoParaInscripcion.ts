export default interface DTOEventoParaInscripcion {
    nombre: string,
    descripcion: string,
    idSuperevento: number | undefined,
    fechaDesde: Date,
    fechaHasta: Date,
    espacio: {
        id: number,
        nombre: string,
        descripcion: string
    } | undefined,
    direccion: string,
    ubicacion: {
        latitud: number | undefined,
        longitud: number | undefined,
    },
    precioPorAsistente: number,
    cantidadMaximaInvitados: number,
    limiteParticipantes: number
}