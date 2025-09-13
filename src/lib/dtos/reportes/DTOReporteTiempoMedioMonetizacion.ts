export default interface DTOReporteTiempoMedioMonetizacion {
    fechaHoraGeneracion: Date,
    datos: {
        inicio: Date,
        fin: Date,
        medios: {
            nombre: string,
            monto: number
        }[]
    }[]
}