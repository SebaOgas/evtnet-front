export default interface DTOBusquedaEvento {
    id: number,
    nombre: string,
    fechaDesde: Date,
    fechaHasta: Date,
    nombreEspacio: string,
    disciplinas: {
        id: number,
        nombre: string
    }[]
}