export interface ConfigTarget {
  botId?: string;
  conversationId?: string;
}

export interface ConfigProvider {
  get(key: string, target?: ConfigTarget): Promise<any>;
}

/**
 * ConfigResolver
 * Resuelve configuración operativa priorizando:
 * 1. Nivel global
 * 2. Nivel bot (sobrescribe global)
 * 3. Nivel conversación (sobrescribe bot)
 */
export class ConfigResolver {
  constructor(private provider: ConfigProvider) {}

  async get<T>(key: string, target?: ConfigTarget, defaultValue?: T): Promise<T> {
    const rawValue = await this.provider.get(key, target);
    if (rawValue !== undefined && rawValue !== null) {
      return rawValue as T;
    }
    return defaultValue as T;
  }
}
