export default interface DTOExcepcionesCronograma {
    nombreEspacio: string,
    fechaDesde: Date,
    fechaHasta: Date,
    excepciones: {
        id: number,
        fechaHoraDesde: Date,
        fechaHoraHasta: Date,
        tipo: string,
        hayEventosProgramados: boolean
    }[]
}