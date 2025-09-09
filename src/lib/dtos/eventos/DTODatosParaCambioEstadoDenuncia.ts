export default interface DTODatosParaCambioEstadoDenuncia {
    titulo: string,
    estados: {
        id: number,
        nombre: string
    }[]
}