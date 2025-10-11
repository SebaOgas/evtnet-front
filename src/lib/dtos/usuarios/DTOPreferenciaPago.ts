export default interface DTOPreferenciaPago {
    concepto: string,
    montoBruto: number,
    comision: number, //Porcentaje, en flotante
    preference_id: string,
    public_key: string,
    completada: boolean
}