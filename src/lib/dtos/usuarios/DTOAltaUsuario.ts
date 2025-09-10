export default interface DTOAltaUsuario {
    nombre: string,
    apellido: string,
    username: string,
    dni: string,
    fechaNacimiento: Date | null, //null solo para el front-end
    mail: string,
    roles: number[]
}