export default interface DTOEvento {
    nombre: string,
    descripcion: string,
    fechaHoraInicio: Date,
    fechaHoraFin: Date,
    precioBase: number,
    precioTotal: number,
    disciplinas: string[],
    espacio: {
        id: number,
        nombre: string,
        direccion: string,
        latitud: number,
        longitud: number,
    },
    subespacio: {
        id: number,
        nombre: string,
        descripcion: string
    },
    estado: string,
    motivoCancelacion: string,
    cupoLleno: boolean,
    superevento: {
        id: number,
        nombre: string
    } | undefined,
    inscripto: boolean,
    inscriptos: {
        username: string,
        nombre: string,
        apellido: string
    }[],
    administrador: boolean,
    organizador: boolean,
    idChat: number | null
}