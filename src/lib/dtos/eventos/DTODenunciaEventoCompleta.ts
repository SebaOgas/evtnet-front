export default interface DTODenunciaEventoCompleta {
    id: number,
    titulo: string,
    descripcion: string,

    denunciante: {
        nombre: string,
        apellido: string,
        username: string,
        mail: string
    },

    historico: {
        nombre: string,
        fechaHoraDesde: Date,
        descripcion: string,
        responsable: {
            nombre: string,
            apellido: string,
            username: string,
            mail: string
        }
    }[],

    evento: {
        id: number,
        nombre: string,
        descripcion: string,
        
        espacio: {
            nombre: string | null, //null => espacio no registrado
            direccion: string
        }

        // El back siempre debe devolverlo, el null solo lo usa el front
        fechaHoraInicio: Date | null,
        fechaHoraFin: Date | null,

        participantes: number,

        organizador: {
            nombre: string,
            apellido: string,
            username: string,
            mail: string
        },

        administradores: {
            nombre: string,
            apellido: string,
            username: string,
            mail: string
        }[]
    }
}