export interface ITranscriptionProvider {
  /**
   * Recibe un buffer de audio y lo convierte a texto en el lenguaje meta (español por defecto).
   * @param audioBuffer 
   * @param filename Archivo simulativo (Whisper a veces exige .ogg en el metadata)
   * @returns El string completo de la nota de voz.
   */
  transcribe(audioBuffer: Buffer, filename: string): Promise<string>;
}
