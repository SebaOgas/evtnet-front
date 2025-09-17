export default interface DTOIconoCaracteristica {
    id: number;
    url:string;
    contentType?: string;
    fechaAlta: Date | null;
    fechaBaja?: Date | null;
}