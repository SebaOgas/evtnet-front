export default interface DTOInstanciaMascotaPagina {
    id: number;
    nombre: string;
    selector: string;
    eventos: string[];
    secuencia: {
        texto: string;
        url: string;
    }[];
    visualizado: boolean;
}