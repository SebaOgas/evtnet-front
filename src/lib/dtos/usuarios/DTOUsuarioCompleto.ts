export default interface DTOUsuarioCompleto {
    username: string,
    nombre: string,
    apellido: string,
    mail: string,
    dni: string,
    fechaNacimiento: Date,
    alta: Date,
    baja: Date | null,
    roles: string[]
}