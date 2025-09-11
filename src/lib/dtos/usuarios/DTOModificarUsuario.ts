export default interface DTOModificarUsuario {
    username: string,
    usernameNuevo: string,
    nombre: string,
    apellido: string,
    mail: string,
    dni: string,
    fechaNacimiento: Date,
    roles: number[]
}