export default interface DTOModoEvento {
    id: number;
    nombre: string;
    descripcion: string;
    fechaAlta: Date | null;
    fechaBaja?: Date | null;
}