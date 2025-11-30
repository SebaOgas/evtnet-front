export default interface DTOInteraccionesUsuario {
    interacciones: {
        id: number,
        nombre: string,
        tipo: "EVENTO" | "ESPACIO" | "SUPEREVENTO" | "GRUPO" | "DIRECTO",
        fechaDesde: Date,
        fechaHasta: Date,
        username: string | undefined
    }[]
}