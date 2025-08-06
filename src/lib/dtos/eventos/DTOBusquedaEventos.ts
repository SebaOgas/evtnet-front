export default interface DTOBusquedaEventos {
    texto: string,
    ubicacion: {
        latitud: number | undefined,
        longitud: number | undefined,
        rango: number | undefined // En metros
    } | undefined,
    fechaDesde: Date | null,
    fechaHasta: Date | null,
    horaDesde: Date | null,
    horaHasta: Date | null,
    tiposEspacio: number[],
    espaciosNoRegistrados: boolean,
    disciplinas: number[], // Si está vacío, es "Cualquiera" (no importan las disciplinas)
    modos: number[], // Si está vacío, es "Cualquiera" (no importan los modos de evento)
    precioLimite: number | undefined,
    buscarEventos: boolean,
    buscarSuperventos: boolean
}