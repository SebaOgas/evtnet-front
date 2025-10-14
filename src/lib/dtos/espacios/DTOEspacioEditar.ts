import type DTODisciplina from "../disciplinas/DTODisciplina"

export default interface DTOEspacio {
    id: number,
    nombre: string,
    descripcion: string,
    direccion: string,
    latitud: number,
    longitud: number,
    subEspacios: DTOSubespacioEditar[],
    esAdmin: boolean,
    esPropietario: boolean,
    esPublico: boolean,
    basesYCondiciones:DTOArchivo | null,
    documentacion:DTOArchivo[]|null,
    estado:DTOEspacioEstado | null,
    estadosEspacio: DTOEstadoEspacio[] | null
    requiereAprobacion: boolean
}
export interface DTOSubespacioEditar{
    id?: number,
    nombre:string,
    descripcion:string,
    capacidadMaxima: number,
    disciplinas:DTODisciplina[]
}

export interface DTOArchivo{
    id:number,
    nombreArchivo: string,
    base64: string
}

export interface DTOEspacioEstado{
    id: number,
    nombre: string,
    descripcion: string
}

export interface DTOEstadoEspacio{
    id: number,
    nombre: string,
    descripcion: string
}