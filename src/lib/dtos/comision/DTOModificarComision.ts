export default interface DTOModificarComision {
	id: number;
	montoLimite: number;
    porcentaje: number;
	fechaDesde: Date | null;
    fechaHasta: Date | null;
}