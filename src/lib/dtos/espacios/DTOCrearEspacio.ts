export default interface DTOCrearEspacio {
    nombre: string,
    descripcion: string,
    direccion: string,
    latitud: number | undefined,
    longitud: number | undefined,
    disciplinas: number[],

    publico: boolean,
    sepId: number | null //Solicitud de espacio público a vincular
}