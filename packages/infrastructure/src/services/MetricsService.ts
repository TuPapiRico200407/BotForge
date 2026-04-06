import { sql } from 'drizzle-orm';
import { db } from '../db/client';
import { dailyBotMetrics } from '../db/schema';

export type MetricField = 'incomingMessagesCount' | 'outgoingMessagesCount' | 'handoffsCount' | 'aiRepliesCount' | 'pendingHumanCount';

/**
 * Normaliza la fecha actual a medianoche UTC.
 * Ejemplo: 2026-04-06T23:59:59-04:00 → 2026-04-06T00:00:00.000Z
 * Esto garantiza que todos los incrementos del mismo día UTC
 * aterricen en el mismo registro, sin importar la zona del servidor.
 */
export function getTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * Incrementa de forma idempotente un contador de la métrica diaria de un bot.
 * Usa INSERT ... ON CONFLICT DO UPDATE para ser seguro ante reintentos.
 */
export async function incrementMetric(botId: string, field: MetricField, amount = 1): Promise<void> {
  const todayUTC = getTodayUTC();

  await db.execute(sql`
    INSERT INTO daily_bot_metrics (id, bot_id, date, incoming_messages_count, outgoing_messages_count, handoffs_count, ai_replies_count, pending_human_count)
    VALUES (gen_random_uuid(), ${botId}, ${todayUTC.toISOString()}, 0, 0, 0, 0, 0)
    ON CONFLICT (bot_id, date) DO NOTHING
  `);

  // Incremento atómico del campo específico
  const columnMap: Record<MetricField, string> = {
    incomingMessagesCount: 'incoming_messages_count',
    outgoingMessagesCount: 'outgoing_messages_count',
    handoffsCount: 'handoffs_count',
    aiRepliesCount: 'ai_replies_count',
    pendingHumanCount: 'pending_human_count',
  };

  const col = columnMap[field];
  await db.execute(sql`
    UPDATE daily_bot_metrics
    SET ${sql.raw(col)} = ${sql.raw(col)} + ${amount}
    WHERE bot_id = ${botId} AND date = ${todayUTC.toISOString()}
  `);
}

/**
 * Recupera las métricas del día UTC actual para un bot.
 * Devuelve ceros si no existe registro aún.
 */
export async function getDailyMetrics(botId: string, dateUTC?: Date) {
  const target = dateUTC ?? getTodayUTC();

  const rows = await db.execute(sql`
    SELECT * FROM daily_bot_metrics
    WHERE bot_id = ${botId} AND date = ${target.toISOString()}
    LIMIT 1
  `);

  const row = (rows as any).rows?.[0] ?? (rows as any)[0];

  if (!row) {
    return {
      botId,
      date: target.toISOString(),
      incomingMessagesCount: 0,
      outgoingMessagesCount: 0,
      handoffsCount: 0,
      aiRepliesCount: 0,
      pendingHumanCount: 0,
    };
  }

  return {
    botId: row.bot_id,
    date: row.date,
    incomingMessagesCount: Number(row.incoming_messages_count),
    outgoingMessagesCount: Number(row.outgoing_messages_count),
    handoffsCount: Number(row.handoffs_count),
    aiRepliesCount: Number(row.ai_replies_count),
    pendingHumanCount: Number(row.pending_human_count),
  };
}
