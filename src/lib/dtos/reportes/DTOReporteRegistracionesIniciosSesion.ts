export default interface DTOReporteRegistracionesIniciosSesion {
    fechaHoraGeneracion: Date,
    datos: {
        inicio: Date,
        fin: Date,
        registraciones: number,
        iniciosSesion: number
    }[]
}