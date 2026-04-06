export interface IntentionResult {
  intent: string;         // 'precio', 'ubicacion', 'unknown'
  confidence: number;     // 0 - 100
}

export interface IIntentionProvider {
  /**
   * Clasifica la intención excluyente de una transcripción basándose en las keywords disponibles.
   * @param transcriptionText Texto detectado a evaluar
   * @param validIntents Array de keywords que el bot comprende actualmente
   * @returns La intención detectada ('unknown' si ninguna aplica contundentemente)
   */
  classifyIntent(transcriptionText: string, validIntents: string[]): Promise<IntentionResult>;
}
