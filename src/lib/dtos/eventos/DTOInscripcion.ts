import type DTOPago from "../usuarios/DTOPago"

export default interface DTOInscripcion {
    idEvento: number,
    username: string,
    invitados: {
        nombre: string,
        apellido: string,
        dni: string
    }[],
    precioInscripcion: number,
    datosPago: DTOPago[]
}