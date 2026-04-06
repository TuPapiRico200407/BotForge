# DOMINIO Y ENDPOINTS (Sprint 05)

## Estructuras y Entidades Implicadas
1. **`bot_ai_settings`**: Tabla a revivir para almacenar los Proveedores Elegidos (Whisper vs Custom), el prompt de fallback (si aplica en un futuro generativo).
2. **`bot_configs`**: Ya activamos `intentionThreshold`, pero conectaremos endpoints HTTP para que el Frontend lo mute.
3. **`ai_events` / `message_transcriptions`**: Trazabilidad gráfica de por qué se resolvió algo (`Botón IA details`).

## API Endpoints a Desarrollar/Refactorizar
- `GET /api/bots/:botId/ai-settings`: Para inicializar el form frontal.
- `PATCH /api/bots/:botId/ai-settings`: Para guardar la config `intentionThreshold`, `ai_enabled`.
- `GET /api/bots/:botId/conversations/:conversationId/ai-events`: Trazabilidad auditable de qué pensó Cerebras en cada mensaje (O simplemente inyectar la confidence en el endpoint de mensajes base actual).
