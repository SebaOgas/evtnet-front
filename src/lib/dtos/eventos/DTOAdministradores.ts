export default interface DTOAdministradores {
    esOrganizador: boolean,

    nombreEvento: string,

    administradores: {
        nombre: string,
        apellido: string,
        username: string,

        vigente: boolean,

        historico: {
            fechaDesde: Date,
            fechaHasta: Date | null,
            organizador: boolean
        }[]
    }[]
}