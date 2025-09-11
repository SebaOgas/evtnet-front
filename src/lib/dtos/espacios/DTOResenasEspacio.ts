export default interface DTOResenasEspacio{
    resenas: DTOResenaEspacio[],
    puntuaciones: {puntuacion: number, cantidad: number}[],
}

export interface DTOResenaEspacio {
    titulo: string,
    comentario: string,
    puntuacion: number,
    username: string,
    usuario: string,
    fecha: Date
}