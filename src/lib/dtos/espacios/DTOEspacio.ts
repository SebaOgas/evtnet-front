export default interface DTOEspacio {
    nombre: string,
    tipoEspacio: string,
    descripcion: string,
    direccion: string,
    latitud: number,
    longitud: number,
    cantidadImagenes: number,
    subEspacios: DTOSubespacioDetalle[],
    esAdmin: boolean,
    idChat: number | null
}

export interface DTOSubespacioDetalle{
    nombre:string,
    descripcion:string,
    capacidadMaxima: number,
    disciplinas:string[]
    caracteristicas: {
        imagenId: number,
        nombre: string
    }[]
}