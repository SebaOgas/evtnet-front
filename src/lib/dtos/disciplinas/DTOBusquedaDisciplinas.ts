export default interface DTOBusquedaDisciplina {
    texto: string,
    fechaDesde:Date|null,
    fechaHasta:Date|null,
    vigentes:boolean,
    dadasDeBaja:boolean
}