export default interface DTOGrupoSimple {
    id: number,
    nombre: string,
    descripcion: string,
    creador: {
        nombre: string,
        apellido: string
    },
    fechaAlta: Date,
    fechaBaja: Date | null
}