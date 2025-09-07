export default interface DTOResultadoBusquedaMisSuperEventos {
    id: number,
    nombre: string,
    fechaDesde: Date,
    fechaHasta: Date,
    eventosFuturos: number,
    eventosTotales: number
}