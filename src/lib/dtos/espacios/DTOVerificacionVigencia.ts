export default interface DTOVerificacionVigencia {
    // Si en la solicitud se especificó una idCronograma, es porque se quiere modificar un cronograma. No devolver ese, siempre está superpuesto.
    cronogramasSuperpuestos: {
        id: number,
        fechaDesde: Date,
        fechaHasta: Date
    }[],

    eventosProblematicos: { //Eventos que ya no serían abarcados por el cronograma tras cambiar su vigencia
        id: number,
        nombre: string,
        fechaHoraInicio: Date
    }[]
}