export default interface DTODetalleCronograma {
    nombreEspacio: string,
    fechaDesde: Date,
    fechaHasta: Date,
    horarios: {
        id: number,
        diaSemana: number, //0: lunes, 1: martes, 2: miércoles...
        horaDesde: Date,
        horaHasta: Date,
        precioOrganizacion: number
    }[]
}