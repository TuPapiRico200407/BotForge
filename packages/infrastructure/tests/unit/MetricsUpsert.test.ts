import { describe, it, expect } from 'vitest';
import { getTodayUTC } from '../../src/services/MetricsService';

describe('MetricsService — Zona Horaria y Normalización', () => {
  it('getTodayUTC devuelve medianoche exacta en UTC (sin horas/minutos)', () => {
    const d = getTodayUTC();
    expect(d.getUTCHours()).toBe(0);
    expect(d.getUTCMinutes()).toBe(0);
    expect(d.getUTCSeconds()).toBe(0);
    expect(d.getUTCMilliseconds()).toBe(0);
  });

  it('dos llamadas consecutivas en el mismo día devuelven la misma fecha UTC', () => {
    const d1 = getTodayUTC();
    const d2 = getTodayUTC();
    expect(d1.toISOString()).toBe(d2.toISOString());
  });

  it('la fecha normalizada no se ve afectada por el offset local del servidor', () => {
    // Simular que el servidor tiene un offset: si el ISO string siempre acaba en T00:00:00.000Z
    // la fecha es 100% UTC independientemente de la zona local.
    const d = getTodayUTC();
    expect(d.toISOString()).toMatch(/T00:00:00\.000Z$/);
  });
});

describe('MetricsService — Idempotencia conceptual', () => {
  it('la misma fecha UTC normalizada sirve como clave única (bot_id, date)', () => {
    // El constraint unique(bot_id, date) sobre la fecha UTC normalizada
    // garantiza que múltiples webhooks del mismo día usen el mismo registro.
    const day1 = getTodayUTC().toISOString();
    const day2 = getTodayUTC().toISOString();
    // No importa cuántas veces se llame: la clave es idéntica dentro del mismo día UTC
    expect(day1).toBe(day2);
  });
});
