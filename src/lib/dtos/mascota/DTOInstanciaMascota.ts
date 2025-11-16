export default interface DTOInstanciaMascota {
    id: number;
    nombre: string;
    descripcion: string;
    pageRegex: string;
    selector: string;
    events: string;
    longitud: number;
    fechaAlta: Date | null;
    fechaBaja?: Date | null;
    secuencia: {
        texto: string,
        imagenId: number,
        orden: number
    }[];
}