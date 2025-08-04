export default interface DTODatosCreacionExcepcion {
    nombreEspacio: string,
    fechaDesde: Date,
    fechaHasta: Date,
    tiposExcepcion: {
        id: number,
        nombre: string
    }[]
}