export default interface DTODatosParaInscripcion {
    nombreEvento: string,

    cantidadMaximaInvitados: number,
    limiteParticipantes: number,
    
    esAdministrador: boolean | null,
    esOrganizador: boolean | null

}