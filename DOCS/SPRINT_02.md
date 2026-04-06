# SPRINT_02.md

## 1) Objetivo del sprint
Conectar WhatsApp Cloud API al sistema para almacenar mensajes por bot y operar una bandeja básica con conversaciones y respuesta manual.

## 2) Casos de uso

### CU05 — Recibir mensaje de WhatsApp por webhook
- **Actor:** Sistema
- **Precondiciones:** Bot configurado con número/identificador válido.
- **Flujo principal:**
  1. WhatsApp envía evento al webhook.
  2. El backend valida estructura.
  3. Identifica bot por número/config.
  4. Upsert del contacto.
  5. Crea/actualiza conversación.
  6. Guarda mensaje entrante.
- **Casos borde:**
  1. Bot no reconocido.
  2. Payload inválido.
  3. Mensaje duplicado.
  4. Bot inactivo.
  5. Contacto nuevo sin nombre.
- **Criterios de aceptación:**
  - [ ] Cada mensaje queda asociado a `bot_id`.
  - [ ] No se mezclan mensajes.
  - [ ] No se duplican por `provider_message_id`.
  - [ ] Se crea conversación si no existe.

### CU06 — Listar conversaciones del bot
- **Actor:** Super Admin / Cliente Admin / Agente
- **Precondiciones:** Existen conversaciones.
- **Flujo principal:**
  1. Entra al inbox.
  2. Carga conversaciones recientes.
  3. Muestra contacto, último mensaje, fecha y estado.
  4. Elige conversación.
- **Casos borde:**
  1. No hay conversaciones.
  2. Contactos sin nombre.
  3. Conversaciones cerradas.
  4. Orden incorrecto.
  5. Volumen inicial alto.
- **Criterios de aceptación:**
  - [ ] Lista solo conversaciones del bot.
  - [ ] Muestra último mensaje y actividad.
  - [ ] Ordena por actividad reciente.

### CU07 — Ver detalle de conversación
- **Actor:** Super Admin / Cliente Admin / Agente
- **Precondiciones:** Conversación existente.
- **Flujo principal:**
  1. Abre conversación.
  2. Carga historial.
  3. Muestra dirección del mensaje y hora.
  4. Muestra datos básicos del contacto.
- **Casos borde:**
  1. Sin mensajes válidos.
  2. Mensajes largos.
  3. Historial con links.
  4. Mensajes de sistema.
  5. Conversación borrada al abrir.
- **Criterios de aceptación:**
  - [ ] Historial ordenado.
  - [ ] Entrantes y salientes diferenciados.
  - [ ] No aparece contenido de otro bot.

### CU08 — Responder manualmente
- **Actor:** Super Admin / Cliente Admin / Agente
- **Precondiciones:** Conversación abierta.
- **Flujo principal:**
  1. Redacta respuesta.
  2. Envía.
  3. Backend manda mensaje por WhatsApp.
  4. Se persiste saliente.
  5. Aparece en historial.
- **Casos borde:**
  1. Texto vacío.
  2. Error de envío.
  3. Conversación cerrada.
  4. Permiso insuficiente.
  5. Doble envío.
- **Criterios de aceptación:**
  - [ ] Se responde desde UI.
  - [ ] El mensaje queda guardado.
  - [ ] Error se muestra claramente.
  - [ ] No se duplica.

## 3) Entidades / Estados tocados
- `contacts`
- `conversations`
- `messages`
- `bot_whatsapp_configs`

## 4) Endpoints sugeridos
- `GET /bots/:botId/conversations`
- `GET /bots/:botId/conversations/:conversationId`
- `POST /bots/:botId/conversations/:conversationId/messages`
- `POST /webhooks/whatsapp`
- `GET /webhooks/whatsapp/verify`

## 5) Pantallas UI exactas del sprint
### 1. Inbox del Bot
- Tipo: list/detail
- Componentes: lista conversaciones, búsqueda, badges, timestamps

### 2. Detalle de Conversación
- Tipo: detalle
- Componentes: timeline/chat bubbles, cabecera contacto, panel lateral básico

### 3. Composer Manual
- Tipo: form embebido
- Componentes: textarea, botón enviar, loading/error

### 4. Config WhatsApp básica
- Tipo: form
- Componentes: campos mínimos por bot, estado conexión

## 6) Datos seed mínimos
- 1 bot configurado
- 2 contactos demo
- 3 conversaciones demo
- 8 mensajes demo

## 7) Tests mínimos sugeridos
- Webhook crea contacto/conversación/mensaje.
- Mapping correcto número↔bot.
- Inbox no mezcla bots.
- Respuesta manual exitosa y fallida.