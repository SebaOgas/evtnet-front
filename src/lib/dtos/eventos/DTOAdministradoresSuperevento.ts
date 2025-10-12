export default interface DTOAdministradoresSuperevento {
    esOrganizador: boolean,

    nombreSuperevento: string,

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