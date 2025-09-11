export default interface DTOSolicitudEPCompleta{
    idSEP: number,
    nombreEspacio: string,
    descripcion: string,
    direccion: string,
    latitud: number,
    longitud: number,
    justificacion: string,
    fechaIngreso: Date,

    solicitante:{
        nombre: string,
        apellido: string,
        username: string,
        email: string,
        urlFotoPerfil: string | null,
        contentType?: string
    },

    SEPEstado:{
        id: number,
        nombre: string,
        descripcion: string,
        fechaHoraDesde: Date,
        responsable: {
            nombre: string,
            apellido: string,
            username: string,
            email: string,
            urlFotoPerfil: string | null,
            contentType?: string
        }
    }[],
}