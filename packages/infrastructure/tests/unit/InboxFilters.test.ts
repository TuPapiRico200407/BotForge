import { describe, it, expect } from 'vitest';

/**
 * Simula el filtrado de conversaciones del ConversationRepository
 * para validar que los filtros no cruzan bots y funcionan correctamente.
 */
interface MockConv {
  id: string;
  botId: string;
  status: string;
  lastMessageType?: string;
}

function simulateFilter(
  conversations: MockConv[],
  botId: string,
  filters?: { status?: string[]; messageType?: string }
): MockConv[] {
  // Siempre aislar por botId primero
  let result = conversations.filter((c) => c.botId === botId);

  if (filters?.status && filters.status.length > 0) {
    result = result.filter((c) => filters.status!.includes(c.status));
  }

  if (filters?.messageType) {
    result = result.filter((c) => c.lastMessageType === filters.messageType);
  }

  return result;
}

const mockConversations: MockConv[] = [
  { id: 'c1', botId: 'bot-A', status: 'open', lastMessageType: 'text' },
  { id: 'c2', botId: 'bot-A', status: 'pending_human', lastMessageType: 'audio' },
  { id: 'c3', botId: 'bot-A', status: 'manual', lastMessageType: 'text' },
  { id: 'c4', botId: 'bot-B', status: 'open', lastMessageType: 'audio' },
  { id: 'c5', botId: 'bot-B', status: 'pending_human', lastMessageType: 'text' },
];

describe('InboxFilters — Aislamiento y Filtrado', () => {
  it('sin filtros retorna solo conversaciones del bot solicitado', () => {
    const r = simulateFilter(mockConversations, 'bot-A');
    expect(r).toHaveLength(3);
    expect(r.every((c) => c.botId === 'bot-A')).toBe(true);
  });

  it('nunca retorna conversaciones de otro bot aunque coincida el status', () => {
    const r = simulateFilter(mockConversations, 'bot-A', { status: ['open'] });
    expect(r.every((c) => c.botId === 'bot-A')).toBe(true);
    expect(r.some((c) => c.botId === 'bot-B')).toBe(false);
    expect(r).toHaveLength(1);
  });

  it('filtra por múltiples status correctamente', () => {
    const r = simulateFilter(mockConversations, 'bot-A', {
      status: ['open', 'pending_human'],
    });
    expect(r).toHaveLength(2);
    expect(r.map((c) => c.status)).toEqual(expect.arrayContaining(['open', 'pending_human']));
  });

  it('filtra por messageType audio en el bot correcto', () => {
    const r = simulateFilter(mockConversations, 'bot-A', { messageType: 'audio' });
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe('c2');
  });

  it('combinar status + messageType funciona y no cruza bots', () => {
    // bot-B tiene status open + audio, pero pedimos bot-A
    const r = simulateFilter(mockConversations, 'bot-A', {
      status: ['open'],
      messageType: 'audio',
    });
    // bot-A tiene c1 (open+text) y c2 (pending_human+audio), ninguno combina open+audio
    expect(r).toHaveLength(0);
  });
});
