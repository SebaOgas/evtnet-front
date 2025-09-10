export default interface DTORol {
    id: number,
    nombre: string,
    descripcion: string,
    reservado: boolean,
    fechaAlta: Date,
    fechaBaja: Date | null,
    permisos: {
        nombre: string,
        periodos: {
            desde: Date,
            hasta: Date | null
        }[]
    }[]
}