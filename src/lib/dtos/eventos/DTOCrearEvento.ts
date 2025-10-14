import type DTOPago from "../usuarios/DTOPago"

export default interface DTOCrearEvento {
    nombre: string,
    descripcion: string,
    
    idSubespacio: number | null, //null solo para el front
    usarCronograma: boolean, //false solo posible si el usuario es administrador del espacio

    //Todos los espacios
    //Con cronograma, ignorar
    //Sin cronograma,verificar que es admin y no haya cronograma vigente o esté en una excepción
    fechaHoraInicio: Date | null,
    fechaHoraFin: Date | null,

    //Espacio privado con cronograma
    horarioId: number,

    //Todos los espacios
    disciplinas: number[],
    precio: number, //Sin comisión ni adicional
    maxParticipantes: number

    //Para cuando ya se la va a generar
    pago: DTOPago | null
}