export default interface DTOAdministradoresEspacio{
    esPropietario: boolean;
    administradores: DTOAdministrador[];
}

export interface DTOAdministrador{
    id:number;
    nombreApellido:string;
    username:string;
    urlFotoPerfil:string;
    contentType:string;
    fechasAdministracion: {
        fechaDesde:Date;
        fechaHasta?:Date;
    }[]
}