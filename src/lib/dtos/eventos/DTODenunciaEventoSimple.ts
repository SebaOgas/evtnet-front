export default interface DTODenunciaEventoSimple {
    idDenuncia: number,
    titulo: string,
    usernameDenunciante: string,
    nombreEvento: string,
    usernameOrganizador: string,
    estado: string,
    fechaHoraUltimoCambio: Date,
    fechaHoraIngreso: Date,
    permiteCambioEstado: boolean
}