export default interface DTOAuth {
    token : string,
    permisos: string[],
    username: string,
    vinculadoMP: boolean,
    user: {
        nombre: string,
        apellido: string,
        roles: string[]
    }
}