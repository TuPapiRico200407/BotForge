# CAMBIOS APLICADOS (Sprint 04)

### Cero Hardcoding y Nuevas Vías
- **Threshold Variable**: Hemos retirado la barrera dura de `75%` explícita en Webhooks. Ahora consume directamente el query de `botConfigs.intentionThreshold`. El umbral puede ser ajustado comercialmente por cada cliente.
- **`pending_human`**: Resuelve la petición de separar las derivaciones de la IA de intervenciones directas de usuarios (`manual`).
- **Nuevos Flujos Endpoint**:
  - `GET /api/media?path=XYZ`: Este es la nueva gema proxy. En lugar de darle las Signed URL con TTL directo al cliente donde se puede volver tedioso parsear vigencias en React, nuestro Proxy encapsula en back-end la petición al nodo seguro usando una "Signed URL en vuelo" bajo las credenciales Root de tu entorno. El `<audio/>` es totalmente stateless.
- **Provider Injection**: Tres Adapters blindados conviviendo por vez primera. `SupabaseStorageProvider`, `OpenAIWhisperProvider` y `CerebrasIntentionProvider`. Todos orquestan dentro del macro-loop del Payload Meta en el Webhook.

# CAMBIOS APLICADOS (Sprint 05)

### Consolidación de IA y Front-End
- **Tres Master Switches Persistidos**: Añadidas las columnas booleanas `botActive`, `automationEnabled`, y `aiEnabled` a la tabla `botConfigs`. Desaparece la abstracción teórica y ahora se editan vía API Hono `PATCH /api/bots/:id/config`.
- **Nuevo Endpoint Híbrido**: `GET /api/conversations/:id/feed`. Este nuevo orquestador junta la tabla nativa `messages` junto con...
- **Tabla Analítica `conversation_events`**: Nueva tabla que documenta sub-procesos del bot (como `intent_detected` o `pending_human_triggered`). Se guarda con su `payload` encriptado JsonB limitando el contexto a estricta auditoría.
- **Jerarquía Webhook Comprobada**: El enrutador `webhooks.ts` se blindó para priorizar la bandera de "Humano". Si la sala vale `manual`, jamás se encenderá el `AutoReplyService`. Si `aiEnabled` muere, decae al Motor exacto de String Parsing.
- **Inspector Técnico Angular**: La Bandeja UI absorbe componentes paralelos mapeándolo en el Timeline pero expone todo Json Crudo referenciado hacia `eventLabel` mediante un clic lateral, eximiendo a los devs de tener que entrar a Drizzle Studio para hacer troubleshooting.

# CAMBIOS APLICADOS (Sprint 06)

### Métricas Diarias Reales (Sin Mocks)
- **Zona Horaria Explícita**: `getTodayUTC()` en `MetricsService.ts` siempre normaliza a `00:00:00.000Z` (medianoche UTC). Ningún contador puede aterrizar en el día equivocado por offset del servidor.
- **Upsert Idempotente**: `INSERT ... ON CONFLICT (bot_id, date) DO NOTHING` + `UPDATE` atómico separado. Múltiples webhooks del mismo mensaje (reintentos de Meta) solo incrementan una vez.
- **`pendingHumanCount`**: Nuevo contador expuesto en el Dashboard (no estaba antes).
- **Endpoint**: `GET /api/bots/:botId/metrics/daily?date=YYYY-MM-DD` — acepta fecha opcional en UTC. Por defecto hoy UTC.

### Filtros de Bandeja
- **Endpoint Actualizado**: `GET /api/bots/:botId/conversations?status=open,pending_human&messageType=audio` — filtros opcionales, siempre aislados por `bot_id`.
- **UI Inbox**: Selectores de estado y tipo de mensaje en la sidebar. Se limpian automáticamente al cambiar de bot.

### Gestión de Accesos (Multitenant Fuerte)
- **`botMemberGuard` middleware**: Valida `bot_members` en DB antes de cualquier ruta `/api/bots/:id/*`. Devuelve `403` si el usuario no tiene membresía activa.
- **Protección del último admin**: El endpoint `DELETE /members/:memberId` rechaza eliminar al único `CLIENT_ADMIN` de un bot.
- **Endpoints**: `GET/POST/DELETE /api/bots/:id/members`
- **Pantalla**: `/app/bots/[botId]/members` con tabla de miembros y modal de invitación por email.

### Tests Nuevos
- `MetricsUpsert.test.ts`: Normalizaón UTC, idempotencia de clave.
- `BotMemberGuard.test.ts`: Aislamiento 403, bypass SUPER_ADMIN.
- `InboxFilters.test.ts`: Filtros sin cruce entre bots, combinaciones status+tipo.
