export default interface DTOInscripcionesEvento {
    nombreEvento: string,

    esAdministrador: boolean,
    esOrganizador: boolean,

    inscripciones: {
        id: number,
        usuario: {
            nombre: string,
            apellido: string,
            username: string,
            dni: string
        },
        fechaInscripcion: Date,
        fechaCancelacionInscripcion: Date | null,
        transferencias: {
            numero: number,
            monto: number
        }[],
        invitados: {
            nombre: string,
            apellido: string,
            dni: number
        }[]
    }[]

}