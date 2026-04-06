# SPRINT_05.md

## 1) Objetivo del sprint
Consolidar la operación de IA por bot, permitiendo configurarla, supervisarla y controlarla desde la UI, sin reimplementar la canalización de audio ya construida. Este sprint debe dejar lista la capa operativa para bots con IA: umbrales, fallback, estados de conversación, visibilidad de eventos y control manual.

## 2) Casos de uso

### CU17 — Configurar IA por bot
- **Actor:** Super Admin / Cliente Admin
- **Precondiciones:** Bot existente.
- **Flujo principal:**
  1. El usuario entra a la configuración de IA del bot.
  2. Visualiza si la IA está activa o no.
  3. Configura proveedor, modelo, prompt base, fallback y umbral de intención.
  4. Guarda la configuración.
- **Casos borde:**
  1. Bot sin IA habilitada.
  2. API key faltante o inválida.
  3. Prompt vacío.
  4. `intentionThreshold` fuera de rango.
  5. Cambio de configuración con conversaciones activas.
- **Criterios de aceptación:**
  - [ ] Cada bot tiene configuración IA independiente.
  - [ ] La IA puede activarse o desactivarse por bot.
  - [ ] `intentionThreshold` se guarda y se lee desde configuración real del bot.
  - [ ] La configuración queda asociada correctamente al `bot_id`.

### CU18 — Supervisar eventos y decisiones de IA
- **Actor:** Super Admin / Cliente Admin / Agente
- **Precondiciones:** Existen mensajes procesados por IA.
- **Flujo principal:**
  1. El usuario abre una conversación o panel de eventos.
  2. El sistema muestra si hubo transcripción, intención detectada, confianza y resolución aplicada.
  3. El usuario puede entender por qué el bot respondió o derivó a humano.
- **Casos borde:**
  1. Conversación sin eventos IA.
  2. Transcripción fallida.
  3. Intención detectada sin regla configurada.
  4. Confianza baja.
  5. Datos parciales por error de proveedor.
- **Criterios de aceptación:**
  - [ ] Se visualiza transcripción si existe.
  - [ ] Se visualiza intención detectada y confidence.
  - [ ] Se visualiza si la conversación fue resuelta por regla o derivada a humano.
  - [ ] El usuario puede distinguir claramente entre resolución automática y `pending_human`.

### CU19 — Responder automáticamente usando intención detectada y configuración del bot
- **Actor:** Sistema
- **Precondiciones:** Mensaje de texto libre o audio transcrito con intención clara.
- **Flujo principal:**
  1. El sistema procesa mensaje entrante.
  2. Si no hay coincidencia directa por keyword exacta/directa, interpreta intención.
  3. Busca en la configuración del bot una regla/respuesta enlazada a esa intención.
  4. Si la intención tiene suficiente confianza y existe respuesta configurada, responde automáticamente.
  5. Persiste evento y mensaje saliente.
- **Casos borde:**
  1. Confianza insuficiente.
  2. No existe respuesta configurada para la intención.
  3. Error en proveedor IA.
  4. Conversación en `manual`.
  5. Bot con IA desactivada.
- **Criterios de aceptación:**
  - [ ] La IA no inventa respuesta operativa si ya existe una respuesta configurada.
  - [ ] El sistema usa la configuración/reglas del bot para responder.
  - [ ] Si la confianza es baja o no hay respuesta configurada, deriva a `pending_human`.
  - [ ] Todo se mantiene aislado por `bot_id`.

### CU20 — Controlar el modo operativo de la conversación
- **Actor:** Super Admin / Cliente Admin / Agente
- **Precondiciones:** Conversación abierta.
- **Flujo principal:**
  1. El usuario abre una conversación.
  2. Ve su estado actual (`open`, `pending_human`, `manual`, `closed`).
  3. Puede tomar control manual o reanudar automático según permisos.
  4. El sistema guarda la transición.
- **Casos borde:**
  1. Conversación ya en `manual`.
  2. Conversación cerrada.
  3. Usuario sin permiso para cambiar estado.
  4. Reanudación con configuración IA desactivada.
  5. Cambio concurrente de estado.
- **Criterios de aceptación:**
  - [ ] Se puede pasar de `pending_human` a `manual`.
  - [ ] Se puede reanudar a `open` cuando corresponda.
  - [ ] El estado `manual` bloquea automatización e IA.
  - [ ] El estado de conversación queda persistido y visible en UI.

## 3) Entidades / Estados tocados
- `bot_ai_settings`
- `bot_configs`
- `messages`
- `message_transcriptions`
- `conversations`
- `keyword_rules`
- `external_links`
- `message_templates`
- `ai_events`
- `conversation_overrides`

## 4) Endpoints sugeridos
- `GET /bots/:botId/ai-settings`
- `PUT /bots/:botId/ai-settings`
- `GET /bots/:botId/conversations/:conversationId/ai-events`
- `PATCH /bots/:botId/conversations/:conversationId/status`
- `GET /bots/:botId/config`
- `PATCH /bots/:botId/config`

## 5) Pantallas UI exactas del sprint
### 1. Configuración IA del Bot
- **Tipo:** form
- **Componentes:** toggle IA, provider, modelo, prompt, fallback, `intentionThreshold`, guardar

### 2. Detalle de conversación con eventos IA
- **Tipo:** detalle
- **Componentes:** timeline mensajes, transcripción, intención detectada, confidence, estado de resolución

### 3. Panel de eventos IA
- **Tipo:** list/detail
- **Componentes:** lista de eventos, badges de estado, motivo de derivación, errores

### 4. Acciones operativas de conversación
- **Tipo:** panel/modal
- **Componentes:** botón tomar control manual, botón reanudar automático, badge estado, confirmaciones

## 6) Datos seed mínimos
- 1 bot con IA activa
- 1 bot con IA desactivada
- 2 conversaciones con eventos IA
- 1 conversación derivada por baja confianza
- 1 conversación reanudada a `open`

## 7) Tests mínimos sugeridos
- La configuración IA queda persistida por bot.
- `intentionThreshold` se lee desde config real y no está hardcodeado.
- En `manual` no responde ni IA ni automatización.
- Si hay intención detectada y respuesta configurada, responde correctamente.
- Si la confidence es baja, deriva a `pending_human`.
- Los eventos IA no se mezclan entre bots.