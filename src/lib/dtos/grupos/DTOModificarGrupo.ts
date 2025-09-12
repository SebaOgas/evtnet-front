export default interface DTOModificarGrupo {
    id: number,
    nombre: string,
    descripcion: string,
    participantes: {
        username: string,
        tipo: number,
        nombre: string,
        apellido: string
    }[]
}