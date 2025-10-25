export default interface DTOModificarEvento {
    id: number,
    nombre: string,
    descripcion: string,

    //Todos los espacios
    disciplinas: {
        id: number,
        nombre: string
    }[],

    precioInscripcion: number,

    cantidadMaximaParticipantes: number,
    cantidadMaximaInvitados: number,

    crearSuperevento: boolean, 

    superevento: {
        id: number | undefined, //undefined al crear superevento
        nombre: string,
        descripcion: string //undefined al crear superevento
    } | null, //null al no estar vinculado a superevento

    rangosReintegro: {
        dias: number,
        horas: number,
        minutos: number,
        porcentaje: number
    }[]
}