export default interface DTOMedioPago {
    id: number;
    url:string;
    contentType?: string;
    nombre:string;
    fechaBaja?:Date|null
}