export default interface DTOEvento {
    nombre: string,
    descripcion: string,
    fechaDesde: Date,
    fechaHasta: Date,
    precio: number,
    disciplinas: string[],
    espacio: {
        id: number,
        nombre: string
    } | undefined,
    direccion: string,
    ubicacion: {
        latitud: number | undefined,
        longitud: number | undefined,
    },
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
    idChat: number | null
}