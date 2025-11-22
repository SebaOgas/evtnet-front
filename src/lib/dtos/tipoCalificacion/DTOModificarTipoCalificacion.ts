import type DTOMotivoCalificacion from "../motivoCalificacion/DTOMotivoCalificacion";

export default interface DTOModificarTipoCalificacion {
	id: number;
	url: string;
	nombre:string;
	motivos:DTOMotivoCalificacion[];
}