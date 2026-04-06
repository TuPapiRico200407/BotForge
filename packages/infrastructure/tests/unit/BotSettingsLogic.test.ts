import { describe, it, expect } from 'vitest';

/**
 * Mock representation de la logica inyectada en webhooks.ts
 * para validar la tabla de verdad y jerarquia operacional.
 */
function simulateWebhookCascade(state: { botActive: boolean; automationEnabled: boolean; aiEnabled: boolean; mode: string }) {
  if (!state.botActive) return 'IGNORED_INACTIVE_BOT';
  if (state.mode === 'manual' || state.mode === 'pending_human') return 'IGNORED_MANUAL_MODE';
  if (!state.aiEnabled && !state.automationEnabled) return 'FALLBACK_HUMAN_ONLY';
  if (!state.aiEnabled && state.automationEnabled) return 'DUMB_BOT_KEYWORD_MATCH';
  
  return 'FULL_AI_OPERATION';
}

describe('Jerarquia Master Switches (botConfigs)', () => {
  it('Debe ignorar el procesamiento total si botActive es falso, sin importar el modo', () => {
    const res = simulateWebhookCascade({ botActive: false, automationEnabled: true, aiEnabled: true, mode: 'open' });
    expect(res).toBe('IGNORED_INACTIVE_BOT');
  });

  it('Debe saltar al Dumb Bot si la IA esta apagada pero la automación sigue prendida', () => {
    const res = simulateWebhookCascade({ botActive: true, automationEnabled: true, aiEnabled: false, mode: 'open' });
    expect(res).toBe('DUMB_BOT_KEYWORD_MATCH');
  });

  it('Debe ignorar automatización y IA si un agente tiene tomada manual la sala', () => {
    const res = simulateWebhookCascade({ botActive: true, automationEnabled: true, aiEnabled: true, mode: 'manual' });
    expect(res).toBe('IGNORED_MANUAL_MODE');
  });

  it('Si no hay AI ni Automación, el bot solo registra y delega a humano orgánico', () => {
    const res = simulateWebhookCascade({ botActive: true, automationEnabled: false, aiEnabled: false, mode: 'open' });
    expect(res).toBe('FALLBACK_HUMAN_ONLY');
  });
});
