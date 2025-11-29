export default interface DTOSuperEvento {
    nombre: string,
    descripcion: string,
    esAdministrador: boolean, //true para el organizador también
    chatId: number,

    eventos: {
        id: number,
        nombre: string,
        fechaDesde: Date,
        fechaHasta: Date,
        nombreEspacio: string,
        esAdministrador: boolean,
        cancelado: boolean
    }[]
}