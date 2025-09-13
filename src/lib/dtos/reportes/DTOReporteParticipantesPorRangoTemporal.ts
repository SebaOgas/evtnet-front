export default interface DTOReporteParticipantesPorRangoTemporal {
    fechaHoraGeneracion: Date,
    datos: {
        espacio: string,
        rangos: {
            inicio: Date,
            fin: Date,
            participantes: number
        }[]
    }[]
}