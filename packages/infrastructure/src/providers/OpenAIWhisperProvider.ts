import { ITranscriptionProvider } from '../interfaces/ITranscriptionProvider';

export class OpenAIWhisperProvider implements ITranscriptionProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
  }

  async transcribe(audioBuffer: Buffer, filename: string): Promise<string> {
    if (!this.apiKey) {
      console.warn("⚠️ [Whisper] OPENAI_API_KEY falante. Operando en MOCK fallback.");
      return "Estimado esto es una prueba MOCK porque no está la llave OpenAI.";
    }

    // OpenAI requiere "multipart/form-data" para upload.
    // Como estamos en Node, usaremos la API FormData de fetch 18+
    const blob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/ogg' });
    const formData = new FormData();
    formData.append("file", blob, filename);
    formData.append("model", "whisper-1");
    // formData.append("language", "es"); // Hardcodear o inferir automático

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: formData
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error?.message || "Error transcribiendo en OpenAI Whisper");
    }

    return data.text;
  }
}
