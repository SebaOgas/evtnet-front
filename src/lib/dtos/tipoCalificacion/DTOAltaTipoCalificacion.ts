import type DTOMotivoCalificacion from "../motivoCalificacion/DTOMotivoCalificacion";

export default interface DTOAltaTipoCalificacion {
    url: string;
    nombre:string;
    motivos:DTOMotivoCalificacion[];
}