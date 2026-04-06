import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { keywordRules } from '../db/schema';

export class AutoReplyService {
  /**
   * Procesa un texto (o intención de IA transcrita) para buscar una regla correspondiente.
   * Tolerante al tipo de match (includes o exact).
   * 
   * @param botId Id del Bot
   * @param inputTexto El texto enviado por el cliente o la intención detectada
   * @returns La palabra clave (Rule) entera si matchea, o null
   */
  async process(botId: string, inputTexto: string) {
    if (!inputTexto) return null;
    
    const token = inputTexto.trim().toLowerCase();

    // 1. Traer todas las reglas activas del bot
    const rules = await db.select()
      .from(keywordRules)
      .where(eq(keywordRules.botId, botId));

    // Solo procesar activas
    const activeRules = rules.filter(r => r.isActive);

    // 2. Buscar primero matches exactos (prioridad alta)
    const exactMatch = activeRules.find(r => 
      r.matchType === 'exact' && r.keyword.toLowerCase() === token
    );
    if (exactMatch) return exactMatch;

    // 3. Buscar matches funcionales (includes)
    const includesMatch = activeRules.find(r => 
      r.matchType === 'includes' && token.includes(r.keyword.toLowerCase())
    );
    if (includesMatch) return includesMatch;

    // Ninguna regla matcheó
    return null;
  }
}
