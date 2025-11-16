export default interface DTOAltaInstanciaMascota {
    nombre: string;
    descripcion: string;
    pageRegex: string;
    selector: string;
    events: string;
    imagenes: {texto: string, imagenId: number | null}[];
}