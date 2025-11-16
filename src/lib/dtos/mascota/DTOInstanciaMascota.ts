import type DTOEventoMascota from "./DTOEventoMascota";

export default interface DTOInstanciaMascota {
    id: number;
    nombre: string;
    descripcion: string;
    pageSelector: string;
    selector: string;
    eventos: DTOEventoMascota[];
    longitud: number;
    fechaAlta: Date | null;
    fechaBaja?: Date | null;
    secuencia: {
        texto: string,
        imagenId: number,
        orden: number
    }[];
}