import { Role } from '@botforge/core';

export interface AuthContext {
  userId: string;
  role: Role;
  botId?: string; // Si está contextualizado
}

export class RBACService {
  /**
   * Verifica si el usuario tiene permiso para acceder a un recurso del bot.
   */
  async canAccessBot(context: AuthContext, resourceBotId: string): Promise<boolean> {
    if (context.role === 'SUPER_ADMIN') return true;
    
    // TODO: En implementación real, checar DB bot_members si context.userId pertenece a resourceBotId
    if (context.botId === resourceBotId) {
      return true;
    }
    return false;
  }
}
