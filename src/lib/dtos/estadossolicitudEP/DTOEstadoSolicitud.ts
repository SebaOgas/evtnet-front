export default interface DTOEstadoSolicitud {
    id: number;
    nombre: string;
    descripcion: string;
    fechaAlta: Date | null;
    fechaBaja?: Date | null;
}