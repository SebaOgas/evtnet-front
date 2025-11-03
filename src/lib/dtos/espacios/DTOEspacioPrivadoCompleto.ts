import type { DTOArchivo, DTOEstadoEspacio } from "./DTOEspacioEditar"

export default interface DTOEspacioPrivadoCompleto {
    idEspacio: number,
    nombreEspacio: string,
    descripcion: string,
    direccion: string,
    latitud: number,
    longitud: number,
    justificacion: string,
    fechaIngreso: Date,
    estadosPosibles: DTOEstadoEspacio[],
    documentacion: DTOArchivo[] | null,

    solicitante:{
        nombre: string,
        apellido: string,
        username: string,
        email: string,
        urlFotoPerfil: string | null,
        contentType?: string
    },

    espacioEstados:{
        id: number,
        nombre: string,
        descripcion: string,
        fechaHoraDesde: Date,
        idEstado: number
    }[],
}