export default interface DTODatosCreacionEvento {
    nombreEspacio: string,

    tiposInscripcion: {
        id: number,
        nombre: string
    }[],

    comisionInscripcion: number,

    espacioPublico: boolean | null, //Solo usado para espacios registrados
    administrador: boolean | null, //Solo usado para espacios privados. true si es admin o propietario del espacio

    diasHaciaAdelante: number
}