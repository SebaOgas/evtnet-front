export default interface DTOResultadoBusquedaEventos {
    esSuperevento: boolean,
    id: number,
    nombre: string,
    // Para Eventos
    fechaHoraInicio: Date | undefined,
    precio: number | undefined,
    nombreEspacio: string | undefined,
    disciplinas: string[] | undefined,
    // Para Supereventos
    fechaHoraProximoEvento: Date | undefined
}