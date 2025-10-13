export default interface DTOAdministradoresEspacio{
    esPropietario: boolean;
    dtoAdministradores: DTOAdministrador[];
}

export interface DTOAdministrador{
    id:number;
    nombreApellido:string;
    username:string;
    urlFotoPerfil:string;
    contentType:string;
    esPropietario:boolean;
    fechasAdministracion: {
        fechaDesde:Date;
        fechaHasta?:Date;
    }[]
}