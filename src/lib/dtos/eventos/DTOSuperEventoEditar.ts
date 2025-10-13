export default interface DTOSuperEventoEditar {
    id: number,
    nombre: string,
    descripcion: string,

    esOrganizador: boolean,

    eventos: {
        id: number,
        nombre: string,
        fechaDesde: Date,
        fechaHasta: Date,
        nombreEspacio: string,
        crear: boolean, //Por defecto false,
        eliminar: boolean, //Por defecto false
        cancelado: boolean
    }[]
}