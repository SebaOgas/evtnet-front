export default interface DTOBusquedaMisEventos {
    texto: string,
    fechaDesde: Date | null,
    fechaHasta: Date | null,
    organizador: boolean,
    administrador: boolean,
    participante: boolean
}