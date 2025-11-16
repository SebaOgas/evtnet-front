export default interface DTOModificarInstanciaMascota {
    id: number;
    nombre: string;
    descripcion: string;
    pageRegex: string;
    selector: string;
    events: string;
    imagenes: {texto: string, imagenId: number | null}[];
}