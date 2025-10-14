export default interface DTOBusquedaEventosPorEspacio {
    idEspacio: number,
    texto: string,
    fechaDesde: Date | null,
    fechaHasta: Date | null,
    horaDesde: number | Date | null,
    horaHasta: number | Date | null,
    disciplinas: number[],
    modos: number[],
    precioLimite: number | undefined
}