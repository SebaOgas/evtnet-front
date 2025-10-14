export default interface DTOCrearEspacio {
    nombre: string,
    descripcion: string,
    direccion: string,
    requiereAprobarEventos: boolean,
    latitud: number | undefined,
    longitud: number | undefined,
    subEspacios: DTOSubespacio[],
    esPublico: boolean,
    sepId: number | null, //Solicitud de espacio público a vincular
    username: string
}

export interface DTOSubespacio{
    nombre: string,
    descripcion: string,
    capacidadMaxima: number,
    disciplinas: number[],
}