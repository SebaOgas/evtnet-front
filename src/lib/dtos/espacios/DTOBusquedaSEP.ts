export default interface DTOBusquedaSEP{
    texto: string,
    ubicacion?: {latitud: number, longitud: number, rango: number},
    tipos: number[],
    fechaIngresoDesde: Date | null,
    fechaIngresoHasta: Date | null,
    fechaUltimoCambioEstadoDesde: Date | null,
    fechaUltimoCambioEstadoHasta: Date | null,
    espacios: number[],
    estados: number[]
}