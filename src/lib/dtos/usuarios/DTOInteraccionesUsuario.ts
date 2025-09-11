export default interface DTOInteraccionesUsuario {
    interacciones: {
        id: number,
        nombre: string,
        tipo: "Evento" | "Espacio" | "SuperEvento" | "Grupo" | "Directo",
        fechaDesde: Date,
        fechaHasta: Date,
        username: string | undefined
    }[]
}