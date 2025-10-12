export default interface DTOFiltrosRegistro {
    tipos: string[],
    subtipos: string[],
    fechaHoraDesde: Date | null,
    fechaHoraHasta: Date | null,
    usuarios: string[]
}