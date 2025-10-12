export default interface DTOEspacio {
    nombre: string,
    tipoEspacio: string,
    descripcion: string,
    direccion: string,
    latitud: number,
    longitud: number,
    cantidadImagenes: number,
    disciplinas: string[],
    caracteristicas: {imagenId: number, nombre: string}[],
    esAdmin: boolean,
    idChat: number | null
}
//TODO modificar para que traiga subespacio