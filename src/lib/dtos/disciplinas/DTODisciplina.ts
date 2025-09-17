export default interface DTODisciplina {
    id: number;
    nombre: string;
    descripcion: string;
    fechaAlta: Date | null;
    fechaBaja?: Date | null;
}