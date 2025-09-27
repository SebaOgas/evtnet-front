export default interface DTOProgramacionBackupsAutomaticos {
    frecuencia: {
        meses: number,
        dias: number,
        horas: number
    },
    fechaHoraInicio: Date,
    copiasIncrementalesPorCompleta: number,
    copiasAnterioresAConservar: number
}