export default interface DTOBusquedaEventosPorEspacio {
    idEspacio: number,
    texto: string,
    fechaDesde: Date | null,
    fechaHasta: Date | null,
    horaDesde: Date | null,
    horaHasta: Date | null,
    disciplinas: number[],
    modos: number[],
    precioLimite: number | undefined
}