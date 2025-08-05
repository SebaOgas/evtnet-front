export default interface DTOBusquedaEspacios {
    texto: string,
    ubicacion: {
        latitud: number | undefined,
        longitud: number | undefined,
        rango: number | undefined // En metros
    } | undefined,
    tipos: number[],
    disciplinas: number[] // Si está vacío, es "Cualquiera" (no importan las disciplinas)
}