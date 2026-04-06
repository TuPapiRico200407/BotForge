export interface IStorageProvider {
  /**
   * Sube un archivo crudo al storage y devuelve una ruta o identificador interno
   * @param buffer El contenido binario
   * @param filename Nombre identificativo del archivo
   * @param mimeType Tipo de media (ej. 'audio/ogg')
   * @returns Un storage path interno o pre-firmado
   */
  uploadFile(buffer: Buffer, filename: string, mimeType: string): Promise<string>;

  /**
   * Retorna una URL pública o firmada estática dándole una ruta base
   */
  getSignedUrl(storagePath: string, expiresInSeconds?: number): Promise<string>;
}
