export default interface DTODEstadoDenuncia {
    id: number;
    nombre: string;
    descripcion: string;
    fechaAlta: Date | null;
    fechaBaja?: Date | null;
}