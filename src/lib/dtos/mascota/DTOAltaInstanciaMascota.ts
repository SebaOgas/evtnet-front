export default interface DTOAltaInstanciaMascota {
    nombre: string;
    descripcion: string;
    pageSelector: string;
    selector: string;
    eventos: number[];
    imagenes: {texto: string, imagenId: number | null}[];
}