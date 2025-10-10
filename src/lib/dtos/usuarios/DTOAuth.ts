export default interface DTOAuth {
    token : string,
    permisos: string[],
    username: string,
    user: {
        nombre: string,
        apellido: string,
        roles: string[]
    }
}