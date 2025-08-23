export default interface DTOCrearEvento {
    nombre: string,
    descripcion: string,
    
    idEspacio: number | null, //number => id de espacio, null => espacio no registrado
    usarCronograma: boolean, //false solo posible si el usuario es administrador del espacio

    //Todos los espacios
    //Con cronograma, verificar en back-end que el Horario (horarioId) coincida en horas con fechaDesde y Hasta
    //null solo para el front, el back siempre recibe una Date
    fechaDesde: Date | null,
    fechaHasta: Date | null,

    //Espacio privado con cronograma
    horarioId: number,

    //Todos los espacios
    disciplinas: number[],

    //Espacios no registrados
    direccion: string,
    ubicacion: {
        latitud: number | undefined,
        longitud: number | undefined,
    },

    //Todos los espacios
    modos: number[],
    tipoInscripcion: number, 
    precio: number, //Sin comisión
    maxParticipantes: number
}