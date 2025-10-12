export default interface DTOBackup {
    id: number,
    ruta: string,
    tamano: number | null, // En GB. null si es manual pendiente
    fechaHora: Date,
    tipo: "Completa"|"Incremental",
    programacion: "Automática"|"Manual",
    pendiente: boolean | null, //Solo usado con programación "Manual"; si no, null
    dependeDe: number | null //Solo para incrementales. Es la id de otra copia (completa o incremental) automática
}