export default interface DTOGruposUsuario {
    grupos: {
        id: number,
        nombre: string,
        roles: {
            nombre: string,
            fechaDesde: Date,
            fechaHasta: Date
        }[] 
    }[]
}