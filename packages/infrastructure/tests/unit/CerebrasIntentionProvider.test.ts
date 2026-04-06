import { describe, it, expect, vi } from 'vitest';
import { CerebrasIntentionProvider } from '../../src/providers/CerebrasIntentionProvider';

describe('CerebrasIntentionProvider', () => {
  it('identifica una intencion validando el parsing manual si no hay apiKey', async () => {
    // Si no cargamos variable de entorno, opera en MOCK asumiendo fallback puro
    const provider = new CerebrasIntentionProvider();
    
    const validIntents = ['precio', 'ubicacion', 'catalogo'];
    
    // Probamos 'exact' mock bypass
    const res = await provider.classifyIntent('quiero el catalogo, amigo', validIntents);
    
    expect(res.intent).toBe('catalogo');
    expect(res.confidence).toBe(90);
  });

  it('declara unknown si la clasificacion no concuerda en modo estricto', async () => {
    const provider = new CerebrasIntentionProvider();
    
    const validIntents = ['precio', 'ubicacion'];
    const res = await provider.classifyIntent('necesito ayuda tecnica con mi televisor', validIntents);
    
    expect(res.intent).toBe('unknown');
    expect(res.confidence).toBe(0);
  });
});
