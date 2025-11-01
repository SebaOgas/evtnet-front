export default interface DTOInscripcionesEvento {
    nombreEvento: string,

    esAdministrador: boolean,
    esOrganizador: boolean,
    esEncargado: boolean,

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
            numero: string,
            monto: number
        }[],
        invitados: {
            nombre: string,
            apellido: string,
            dni: number
        }[]
    }[]

}