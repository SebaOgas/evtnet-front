export default interface DTOBusquedaEventos {
    texto: string,
    ubicacion: {
        latitud: number | undefined,
        longitud: number | undefined,
        rango: number | undefined // En metros
    } | undefined,
    fechaDesde: Date | null,
    fechaHasta: Date | null,
    horaDesde: Date | null | number,
    horaHasta: Date | null | number,
    tiposEspacio: number[],
    disciplinas: number[], // Si está vacío, es "Cualquiera" (no importan las disciplinas)
    precioLimite: number | undefined,
    buscarEventos: boolean,
    buscarSupereventos: boolean
}