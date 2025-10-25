export default interface DTODatosModificarEvento {
    nombre: string,
    descripcion: string,

    nombreEspacio: string,
    nombreSubespacio: string,

    fechaHoraDesde: Date,
    fechaHoraHasta: Date,

    adicionalPorInscripcion: number,

    //Todos los espacios
    disciplinas: {
        id: number,
        nombre: string
    }[],

    precioInscripcion: number,
    comisionInscripcion: number,

    cantidadMaximaParticipantes: number,
    cantidadMaximaInvitados: number,

    cantidadParticipantesActual : number,
    cantidadMaximaInvitadosPorInvitacionEfectiva : number, //max(inscripcion.invitados.length()) entre todas las invitaciones vigentes del evento

    superevento: {
        id: number,
        nombre: string,
        descripcion: string //undefined al crear superevento
    } | null, //null al no estar vinculado a superevento

    rangosReintegro: {
        dias: number,
        horas: number,
        minutos: number,
        porcentaje: number
    }[]

    espacioPublico: boolean,
    
    administradorEspacio: boolean | null, //Solo usado para espacios privados. true si es admin o propietario del espacio
    
    //Si ambos fueran falsos, no mandar ninguna otra cosa al front
    administradorEvento: boolean | null,
    organizadorEvento: boolean | null
}