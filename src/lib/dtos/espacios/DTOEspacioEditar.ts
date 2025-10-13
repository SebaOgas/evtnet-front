export default interface DTOEspacio {
    id: number,
    nombre: string,
    descripcion: string,
    direccion: string,
    latitud: number,
    longitud: number,
    disciplinas: {
        id: number,
        nombre: string
    }[],
    esAdmin: boolean,
    esPropietario: boolean,
    esPublico: boolean
}