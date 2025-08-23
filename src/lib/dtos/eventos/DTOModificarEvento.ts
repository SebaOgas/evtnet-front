export default interface DTOModificarEvento {
    id: number,
    nombre: string,
    descripcion: string,

    nombreEspacio: string | null, //string => nombre de espacio, null => espacio no registrado
    usarCronograma: boolean, //false solo posible si el usuario es administrador del espacio

    //Todos los espacios
    //Con cronograma, verificar en back-end que el Horario (horarioId) coincida en horas con fechaDesde y Hasta
    //null solo para el front, el back siempre recibe una Date
    fechaDesde: Date,
    fechaHasta: Date,

    //Espacio privado con cronograma
    horarioId: number,

    //Espacio privado del que no se es admin
    precioOrganizacion: number | null,

    //Espacios no registrados
    direccion: string,
    ubicacion: {
        latitud: number | undefined,
        longitud: number | undefined,
    },

    //Todos los espacios
    disciplinas: {
        id: number,
        nombre: string
    }[],

    modos: {
        id: number,
        nombre: string
    }[],

    tiposInscripcion: {
        id: number,
        nombre: string,
        seleccionado: boolean
    }[],

    precioInscripcion: number,
    comisionInscripcion: number,

    cantidadMaximaParticipantes: number,
    cantidadMaximaInvitados: number,

    cantidadParticipantesActual : number,
    cantidadMaximaInvitadosPorInvitacionEfectiva : number, //max(inscripcion.invitados.length()) entre todas las invitaciones vigentes del evento

    crearSuperevento: boolean | undefined, //Undefined al traer los datos, boolean al modificiar el evento

    superevento: {
        id: number | undefined, //undefined al crear superevento
        nombre: string,
        descripcion: string | undefined //undefined al crear superevento
    } | null, //null al no estar vinculado a superevento

    rangosReintegro: {
        dias: number,
        horas: number,
        minutos: number,
        porcentaje: number
    }[]

    espacioPublico: boolean | null, //Solo usado para espacios registrados
    
    administradorEspacio: boolean | null, //Solo usado para espacios privados. true si es admin o propietario del espacio
    
    //Si ambos fueran falsos, no mandar ninguna otra cosa al front
    administradorEvento: boolean | null,
    organizadorEvento: boolean | null,

    diasHaciaAdelante: number
}