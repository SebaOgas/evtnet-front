export default interface DTORegistro {
    tipo: string,
    subtipo: string,
    fechaHora: Date,
    usuario: {
        nombre: string,
        apellido: string,
        username: string
    },
    solicitud: string,
    descripcion: string
}