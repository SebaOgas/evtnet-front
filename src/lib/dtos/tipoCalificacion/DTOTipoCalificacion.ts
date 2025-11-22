import type DTOMotivoCalificacion from "../motivoCalificacion/DTOMotivoCalificacion";

export default interface DTOTipoCalificacion {
    id: number;
    url:string;
    contentType?: string;
    nombre:string;
    fechaAlta?:Date|null
    fechaBaja?:Date|null
    motivos:DTOMotivoCalificacion[];
}