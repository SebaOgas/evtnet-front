export default interface DTOPerfil {
    username: string,
    nombre: string,
    apellido: string,
    mail: string | null,
    dni: string | null,
    fechaNacimiento: Date | null,
    calificaciones: null | {nombre: string, porcentaje: number}[]
}