export default interface DTOReportePersonsasEnEventosEnEspacio {
    fechaHoraGeneracion: Date,
    datos: {
        evento: string,
        fechaDesde: Date,
        fechaHasta: Date,
        participantes: number
    }[]
}