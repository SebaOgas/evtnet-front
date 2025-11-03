export default interface DTOResultadoBusquedaEventosPorEspacio {
    id: number,
    nombre: string,
    fechaHoraInicio: Date | undefined,
    precio: number | undefined,
    disciplinas: string[] | undefined,
    estado: string | null
}