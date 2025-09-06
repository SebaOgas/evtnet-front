export default interface DTOBusquedaUsuario {
    username: string,
    nombre: string,
    apellido: string,
    mail: string | null,
    dni: string | null,
    fechaNacimiento: Date | null
}