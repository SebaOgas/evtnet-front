export default interface DTOModificarInstanciaMascota {
    id: number;
    nombre: string;
    descripcion: string;
    pageSelector: string;
    selector: string;
    eventos: number[];
    imagenes: {texto: string, imagenId: number | null}[];
}