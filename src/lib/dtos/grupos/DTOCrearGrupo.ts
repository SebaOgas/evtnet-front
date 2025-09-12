export default interface DTOCrearGrupo {
    nombre: string,
    descripcion: string,
    participantes: {
        username: string,
        tipo: number
    }[]
}