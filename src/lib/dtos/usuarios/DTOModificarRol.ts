export default interface DTOModificarRol {
    id: number,
    nombre: string,
    descripcion: string,
    reservado: boolean,
    permisos: string[]
}