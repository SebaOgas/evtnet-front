export default interface DTODisciplina {
    id: number;
    nombre: string;
    descripcion: string | null;
    fechaAlta: Date | null;
    fechaBaja?: Date | null;
}