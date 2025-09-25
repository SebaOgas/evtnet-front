export default interface DTOComision {
    id: number;
    montoLimite: number;
    porcentaje: number;
    fechaDesde: Date | null;
    fechaHasta: Date | null;
}