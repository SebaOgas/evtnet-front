export default interface DTOBusquedaDenunciasEventos {
    texto: string,
    estados: number[],
    fechaIngresoDesde: Date | null,
    fechaIngresoHasta: Date | null,
    fechaCambioEstadoDesde: Date | null,
    fechaCambioEstadoHasta: Date | null,
    orden: "FECHA_DENUNCIA_ASC" | "FECHA_DENUNCIA_DESC" | "FECHA_CAMBIO_ESTADO_ASC" | "FECHA_CAMBIO_ESTADO_DESC"
}