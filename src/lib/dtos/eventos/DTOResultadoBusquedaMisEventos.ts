export default interface DTOResultadoBusquedaMisEventos {
    id: number,
    nombre: string,
    fechaDesde: Date,
    fechaHasta: Date,
    espacioNombre: string,
    rol: string,
    participantes: number | null
}