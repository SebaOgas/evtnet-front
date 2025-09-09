export default interface DTOCalificacion {
    calificacionTipo: number | null, //null solo lo usa el front
    usuarioCalificado: string, //username

    //Calificación normal
    motivos: number[]

    //Denuncia
    descripcion: string
}