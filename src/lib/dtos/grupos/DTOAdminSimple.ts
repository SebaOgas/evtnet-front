export default interface DTOAdminGrupo {
    id: number,
    nombre: string,
    descripcion: string,
    creador: {
        nombre: string,
        apellido: string,
        username: string,
        mail: string
    },
    miembros: {
        nombre: string,
        apellido: string,
        username: string,
        mail: string,
        tipo: string
    }[]
}