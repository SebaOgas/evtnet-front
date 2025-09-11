export default interface DTOSupereventosUsuario {
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
    }[]
}