import type DTOPago from "./DTOPago";

export default interface DTOPagoCompleto {
    pagos: DTOPago[],
    data: any,
    endpoint: string,
    redir: string
}