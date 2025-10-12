export default interface DTOEstadoDenuncia {
    id: number;
    nombre: string;
    descripcion: string;
    fechaAlta: Date | null;
    fechaBaja?: Date | null;
}