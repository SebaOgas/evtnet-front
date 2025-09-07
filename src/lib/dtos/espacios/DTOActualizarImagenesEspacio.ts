export type DTOActualizarImagenesEspacio = {
  idEspacio: number;
  imagenes: Array<{
    id?: number;
    orden: number;
    archivo?: File|null;
    blobUrl?: string;
  }>;
};