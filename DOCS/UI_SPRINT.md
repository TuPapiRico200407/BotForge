# UI SPRINT (Sprint 05)

## Pantallas Claves a Construir/Enriquecer:

### 1. Panel de Configuración IA (`/app/bots/[botId]/ai-settings`)
- Formulario de tarjetas donde hay tres Bloques principales:
  - Toggle Principal: "Activar Inteligencia Artificial" (Bloquea/Desbloquea resto).
  - Slider/Input de `intentionThreshold` (Umbral de Inteligencia - 0% a 100%).
  - Textarea de "System Prompt" (Reservado para cuando liberemos IA Generativa conversacional en sprints futuros).
  
### 2. Panel de Inbox Avanzado (`/app/bots/[botId]/inbox`)
- Cada `ChatBubble` ahora renderizará los metadatos generados:
  - Label con icono cerebro: *"Intención: Comprar (Confianza: 98%)"*.
  - Renderizado mejorado de las Transcripciones.
- Indicador visual claro del estado macro de la sala:
  - Botón: "Tomar Control Manual" o "Reactivar Autómata".
  - Alert/Banner diferenciando si está en modo `pending_human` o cerrado.
