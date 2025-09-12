export default interface DTOReporteEventosPorEspacio {
    fechaHoraGeneracion: Date,
    datos: {
        espacio: string,
        fechaDesde: Date,
        fechaHasta: Date,
        eventos: number
    }[]
}