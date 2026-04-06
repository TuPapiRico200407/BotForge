# SPRINT_03.md

## 1) Objetivo del sprint
Incorporar automatizaciones por palabras clave, links externos por bot y plantillas rápidas para resolver consultas repetitivas sin IA.

## 2) Casos de uso

### CU09 — Crear y administrar palabras clave
- **Actor:** Super Admin / Cliente Admin
- **Precondiciones:** Bot existente.
- **Flujo principal:**
  1. Entra al módulo de palabras clave.
  2. Crea regla con keyword, tipo coincidencia, prioridad y estado.
  3. Define texto y link opcional.
  4. Guarda.
- **Casos borde:**
  1. Keyword vacía.
  2. Prioridad repetida.
  3. Regla duplicada.
  4. Link inválido.
  5. Reglas similares.
- **Criterios de aceptación:**
  - [ ] CRUD completo.
  - [ ] Asociada a `bot_id`.
  - [ ] Prioridad define precedencia.

### CU10 — Ejecutar respuesta por palabra clave
- **Actor:** Sistema
- **Precondiciones:** Bot con automatizaciones activas.
- **Flujo principal:**
  1. Llega mensaje de texto.
  2. Evalúa reglas activas.
  3. Selecciona primera coincidencia por prioridad.
  4. Envía respuesta automática.
  5. Guarda evento.
- **Casos borde:**
  1. Varias coincidencias.
  2. Regla inactiva.
  3. Variaciones de texto.
  4. Link faltante.
  5. No hay coincidencia.
- **Criterios de aceptación:**
  - [ ] Ejecuta una sola regla.
  - [ ] Persistencia del evento.
  - [ ] No responde sin coincidencia.

### CU11 — Gestionar links externos genéricos
- **Actor:** Super Admin / Cliente Admin
- **Precondiciones:** Bot existente.
- **Flujo principal:**
  1. Entra a módulo de links.
  2. Registra nombre, tipo, URL y descripción opcional.
  3. Guarda.
  4. Queda reutilizable.
- **Casos borde:**
  1. URL inválida.
  2. Tipo inválido.
  3. Nombre duplicado.
  4. Link inactivo.
  5. Link sin descripción.
- **Criterios de aceptación:**
  - [ ] Se crean y reutilizan links.
  - [ ] Funciona para Kyte u otros destinos.
  - [ ] Cada link pertenece a un bot.

### CU12 — Crear plantillas / respuestas rápidas
- **Actor:** Super Admin / Cliente Admin / Agente
- **Precondiciones:** Usuario con permiso.
- **Flujo principal:**
  1. Crea plantilla con título y contenido.
  2. Puede asociar links.
  3. Guarda.
  4. La usa desde la conversación.
- **Casos borde:**
  1. Plantilla vacía.
  2. Plantilla larga.
  3. Link roto.
  4. Plantilla inactiva.
  5. Agente sin permiso de edición.
- **Criterios de aceptación:**
  - [ ] Plantillas por bot.
  - [ ] Usables desde composer.
  - [ ] No se comparten entre bots por defecto.

## 3) Entidades / Estados tocados
- `keyword_rules`
- `external_links`
- `message_templates`
- `automation_events`

## 4) Endpoints sugeridos
- `GET /bots/:botId/keyword-rules`
- `POST /bots/:botId/keyword-rules`
- `PATCH /bots/:botId/keyword-rules/:ruleId`
- `GET /bots/:botId/links`
- `POST /bots/:botId/links`
- `GET /bots/:botId/templates`
- `POST /bots/:botId/templates`

## 5) Pantallas UI exactas del sprint
### 1. Lista de Palabras Clave
- Tipo: list
- Componentes: tabla, filtros, prioridad, toggle activo

### 2. Formulario Regla
- Tipo: form
- Componentes: keyword, tipo coincidencia, prioridad, texto respuesta, selector link, toggle activo

### 3. Lista de Links
- Tipo: list
- Componentes: tabla/cards, tipo, URL, estado, crear/editar

### 4. Plantillas / Respuestas Rápidas
- Tipo: list/form
- Componentes: lista, buscador, editor simple, selector link, usar en chat

## 6) Datos seed mínimos
- keywords: anillo, cadena, ubicación, horario
- links: Kyte, maps, Instagram
- plantillas base

## 7) Tests mínimos sugeridos
- Regla de mayor prioridad gana.
- Regla inactiva no responde.
- Link inválido se rechaza.
- Plantilla se inserta en composer.