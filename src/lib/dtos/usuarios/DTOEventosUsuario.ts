export default interface DTOEventosUsuario {
    organizador: {
        id: number,
        nombre: string,
        fechaDesde: Date,
        fechaHasta: Date
    }[],
    administrador: {
        id: number,
        nombre: string,
        fechaDesde: Date,
        fechaHasta: Date,
        periodos: {
            desde: Date,
            hasta: Date
        }[]
    }[],
    participante: {
        id: number,
        nombre: string,
        fechaDesde: Date,
        fechaHasta: Date
    }[],
}