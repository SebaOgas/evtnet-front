export default interface DTODenunciaUsuario {
    fecha: Date,
    descripcion: string,
    denunciado: {
        nombre: string,
        apellido: string,
        username: string,
        mail: string,
    },
    denunciante: {
        nombre: string,
        apellido: string,
        username: string,
        mail: string,
    }
}