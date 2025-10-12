export default interface DTODatosCreacionEvento {
    nombreEspacio: string | null,

    comisionInscripcion: number,

    espacioPublico: boolean | null, //Solo usado para espacios registrados
    administrador: boolean | null, //Solo usado para espacios privados. true si es admin o propietario del espacio

    diasHaciaAdelante: number
}