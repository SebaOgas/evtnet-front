export default interface DTOComprobante {
    numero: number,
    concepto: string,
    fechaHoraEmision: Date,
    formaDePago: string,
    pago: {
        nombre: string,
        apellido: string,
        dni: number,
        cbu: string
    },
    cobro: {
        nombre: string,
        apellido: string,
        dni: number,
        cbu: string
    }
    montoTotalBruto: number,
    comision: number,
    evtnetPagaComision: boolean,
}