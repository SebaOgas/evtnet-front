export default interface DTOTipoCalificacion {
    id: number,
    nombre: string,
    motivos: {
        id: number,
        nombre: string
    }[]
}