export default interface DTOTipoCalificacion {
    id: number;
    url:string;
    contentType?: string;
    nombre:string;
    fechaBaja?:Date|null
}