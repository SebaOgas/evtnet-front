export default interface DTOResultadoBusquedaUsuario {
    username: string,
    nombre: string,
    apellido: string,
    mail: string,
    fechaAlta: Date,
    fechaBaja: Date | null
}