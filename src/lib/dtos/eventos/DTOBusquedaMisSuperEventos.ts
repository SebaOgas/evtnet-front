export default interface DTOBusquedaMisSuperEventos {
    texto: string,
    fechaDesde: Date | null,
    fechaHasta: Date | null,
    organizador: boolean,
    administrador: boolean,
    participante: boolean
}