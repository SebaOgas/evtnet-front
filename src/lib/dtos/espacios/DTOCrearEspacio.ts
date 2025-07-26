export default interface DTOCrearEspacio {
    nombre: string,
    descripcion: string,
    direccion: string,
    latitud: number | undefined,
    longitud: number | undefined,
    disciplinas: number[]
}