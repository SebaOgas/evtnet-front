export default interface DTOImagenMascota {
    id: number;
    url:string;
    nombre: string;
    contentType?: string;
    fechaAlta: Date | null;
    fechaBaja?: Date | null;
}