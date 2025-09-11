export default interface DTOCrearSolicitudEspacio {
    nombre: string,
    descripcion: string,
    direccion: string,
    latitud: number | undefined,
    longitud: number | undefined,
    justificacion: string,

    publico: boolean,
    sepId: number | null //Solicitud de espacio público a vincular
}