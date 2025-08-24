export default interface DTOPago {
    medio: string,
    datos: {
        paymentId: number | undefined
    }
}