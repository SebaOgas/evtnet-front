export default interface DTODatosCreacionEvento {
    nombreEspacio: string | null,
    subespacios: {
        id: number,
        nombre: string,
        diasHaciaAdelante: number,
        capacidadMaxima: number
    }[],

    requiereAprobarEventos: boolean,

    comisionInscripcion: number,

    espacioPublico: boolean | null, //Solo usado para espacios registrados
    administrador: boolean | null, //Solo usado para espacios privados. true si es admin o propietario del espacio

    tieneBasesYCondiciones: boolean
}