# SPRINT_06.md

## 1) Objetivo del sprint
Cerrar el MVP operativo con métricas por bot, filtros útiles de bandeja, gestión de accesos y controles de activación/desactivación de automatizaciones y modos operativos del bot.

## 2) Casos de uso

### CU21 — Ver métricas diarias por bot
- **Actor:** Super Admin / Cliente Admin
- **Precondiciones:** Existen eventos/mensajes del bot.
- **Flujo principal:**
  1. El usuario entra al dashboard del bot.
  2. El sistema muestra métricas del día.
  3. Visualiza entrantes, salientes, conversaciones nuevas, abiertas, `pending_human`, manuales y resueltas.
- **Casos borde:**
  1. Sin datos del día.
  2. Zona horaria mal interpretada.
  3. Datos parciales por errores previos.
  4. Métricas lentas.
  5. Bot sin actividad reciente.
- **Criterios de aceptación:**
  - [ ] Métricas por bot.
  - [ ] Día actual claramente identificado.
  - [ ] Cifras basadas en datos persistidos.
  - [ ] No se mezclan métricas entre bots.

### CU22 — Filtrar bandeja por estado y tipo de mensaje
- **Actor:** Super Admin / Cliente Admin / Agente
- **Precondiciones:** Existen conversaciones en diferentes estados/tipos.
- **Flujo principal:**
  1. El usuario abre el inbox del bot.
  2. Usa filtros por estado y tipo.
  3. La lista se actualiza.
  4. Abre una conversación filtrada.
- **Casos borde:**
  1. Cero resultados.
  2. Combinación inválida.
  3. Persistencia de filtros al cambiar de bot.
  4. Conversación cambia de estado mientras está filtrada.
  5. Paginación con resultados grandes.
- **Criterios de aceptación:**
  - [ ] Filtra por `open`, `pending_human`, `manual`, `closed`.
  - [ ] Filtra por texto, audio, imagen/documento.
  - [ ] Respeta siempre el `bot_id` actual.
  - [ ] No muestra conversaciones de otros bots.

### CU23 — Activar o desactivar automatizaciones y modos operativos del bot
- **Actor:** Super Admin / Cliente Admin
- **Precondiciones:** Existen reglas/config del bot.
- **Flujo principal:**
  1. El usuario entra a configuración operativa del bot.
  2. Activa o desactiva:
     - bot activo,
     - automatización activa,
     - IA activa.
  3. Guarda cambios.
  4. El sistema aplica el comportamiento.
- **Casos borde:**
  1. Regla crítica desactivada por error.
  2. IA activa pero automatización apagada.
  3. Bot activo en falso pero mensajes siguen entrando.
  4. Cambio concurrente.
  5. Estado visual desactualizado.
- **Criterios de aceptación:**
  - [ ] El sistema diferencia entre `bot_active`, `automation_enabled` y `ai_enabled`.
  - [ ] El estado queda persistido.
  - [ ] El bot puede operar en modos:
    - manual only
    - keyword-only
    - IA + keyword
    - híbrido con fallback
  - [ ] Las reglas específicas siguen pudiendo activarse/desactivarse por separado.

### CU24 — Gestionar acceso cliente/agente a bots
- **Actor:** Super Admin
- **Precondiciones:** Usuarios y bots existentes.
- **Flujo principal:**
  1. El admin abre gestión de accesos del bot.
  2. Asigna o revoca usuarios.
  3. Define rol.
  4. Guarda cambios.
  5. Cambia la visibilidad efectiva del bot.
- **Casos borde:**
  1. Usuario inexistente.
  2. Rol inválido.
  3. Revocar último admin de un bot/cliente.
  4. Asignación duplicada.
  5. Usuario con sesión abierta al momento del cambio.
- **Criterios de aceptación:**
  - [ ] Cliente ve solo su(s) bot(s).
  - [ ] Agente ve solo lo asignado.
  - [ ] El cambio de permisos se refleja correctamente.
  - [ ] No hay acceso cruzado entre bots.

## 3) Entidades / Estados tocados
- `daily_bot_metrics`
- `bot_members`
- `bots`
- `bot_configs`
- `keyword_rules`
- `conversations`
- `messages`

## 4) Endpoints sugeridos
- `GET /bots/:botId/metrics/daily`
- `GET /bots/:botId/conversations?status=...&messageType=...`
- `PATCH /bots/:botId/config`
- `GET /bots/:botId/members`
- `POST /bots/:botId/members`
- `PATCH /bots/:botId/members/:memberId`
- `DELETE /bots/:botId/members/:memberId`

## 5) Pantallas UI exactas del sprint
### 1. Dashboard del Bot
- **Tipo:** dashboard
- **Componentes:** cards KPI, resumen diario, accesos rápidos, estados del bot

### 2. Inbox con filtros
- **Tipo:** list/detail
- **Componentes:** filtros por estado/tipo, contadores, lista filtrada, badges de estado

### 3. Configuración operativa del Bot
- **Tipo:** form
- **Componentes:** toggles `bot_active`, `automation_enabled`, `ai_enabled`, guardar, mensajes de ayuda

### 4. Gestión de accesos
- **Tipo:** list/form
- **Componentes:** tabla usuarios, rol, estado, modal asignar/revocar

## 6) Datos seed mínimos
- métricas demo para 2 bots
- 3 usuarios con roles distintos
- conversaciones en distintos estados
- configuraciones activas/inactivas
- miembros de bot con distintos roles

## 7) Tests mínimos sugeridos
- Métricas se calculan por bot.
- Filtros no cruzan bots.
- Cambio de permisos altera visibilidad.
- Desactivar automatización cambia comportamiento.
- Desactivar IA no rompe keyword rules.
- `bot_active`, `automation_enabled` y `ai_enabled` funcionan de forma independiente.