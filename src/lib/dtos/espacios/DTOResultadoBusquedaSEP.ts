export default interface DTOResultadoBusquedaSEP{
    idSEP: number,
    nombreEspacio: string,
    estado: string,
    fechaIngreso: Date,
    fechaUltimoCambioEstado: Date,
    idEspacio:number | null
}