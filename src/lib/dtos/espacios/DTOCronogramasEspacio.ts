export default interface DTOCronogramasEspacio {
    nombre: string,
    cronogramas: {
        id: number,
        fechaDesde: Date,
        fechaHasta: Date,
        diasHaciaAdelante: number
    }[]
}