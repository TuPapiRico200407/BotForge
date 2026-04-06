import { IIntentionProvider, IntentionResult } from '../interfaces/IIntentionProvider';

export class CerebrasIntentionProvider implements IIntentionProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.CEREBRAS_API_KEY || '';
  }

  async classifyIntent(transcriptionText: string, validIntents: string[]): Promise<IntentionResult> {
    if (!this.apiKey) {
       console.warn("⚠️ [Cerebras] CEREBRAS_API_KEY faltante. MOCK Classifier activado.");
       const lowercaseTrans = transcriptionText.toLowerCase();
       const matched = validIntents.find(i => lowercaseTrans.includes(i.toLowerCase()));
       return { intent: matched || "unknown", confidence: matched ? 90 : 0 };
    }

    const payload = {
      model: "llama3.1-70b", // Core Llama model soportado por Cerebras
      messages: [
        {
          role: "system",
          content: `Eres un clasificador CERO-SHOT. Tu única meta es clasificar la Intención de un texto de usuario contra un array estricto de keywords provistas.
          
          REGLAS:
          1. Responde UNICAMENTE en formato JSON plano: {"intent": "X", "confidence": Y}
          2. X debe ser EXACTAMENTE una de las keywords provistas, o la palabra "unknown".
          3. Y debe ser un integer del 0 al 100 marcando tu certeza.
          4. Si la transcripción es inentendible o ambigua, usa "unknown". No intentes adivinar locuras.
          
          KEYWORDS PERMITIDAS: [${validIntents.join(', ')}]`
        },
        {
          role: "user",
          content: `Texto del usuario: "${transcriptionText}"\n\nIdentifica su intención.`
        }
      ],
      temperature: 0.0 // 0 por obligacion al ser tarea clasificatoria
    };

    const res = await fetch("https://api.cerebras.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const body = await res.json();
    
    if (!res.ok) {
       console.error("[Cerebras Error]", body);
       return { intent: "unknown", confidence: 0 };
    }

    try {
      // El LLM debería escupir json tal cual
      const textToParse = body.choices?.[0]?.message?.content || '{"intent":"unknown", "confidence":0}';
      const parsed = JSON.parse(textToParse);
      return { 
        intent: parsed.intent || "unknown", 
        confidence: parsed.confidence || 0 
      };
    } catch {
      return { intent: "unknown", confidence: 0 };
    }
  }
}
