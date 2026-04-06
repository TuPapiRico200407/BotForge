# BotForge MVP — Cierre Formal de Ciclo

> **Período**: Sprint 01 → Sprint 06  
> **Fecha de cierre**: 2026-04-06  
> **Estado**: ✅ MVP Funcional — Listo para prueba controlada

---

## 1. Qué Quedó Implementado

### Infraestructura y Arquitectura
| Componente | Estado |
|---|---|
| Monorepo Turborepo + pnpm | ✅ Operativo |
| Frontend Next.js en Cloudflare Pages | ✅ Listo para despliegue |
| API Hono + Node en Cloudflare Workers/Pages Functions | ✅ Listo para despliegue |
| Base de datos PostgreSQL via Supabase + Drizzle ORM | ✅ Schema completo |
| 17 tablas con relaciones, índices y constraints | ✅ Aplicadas |
| 8 Enums PostgreSQL tipados | ✅ Aplicados |

### Autenticación y Control de Acceso
| Feature | Estado |
|---|---|
| Auth JWT (login/registro) | ✅ |
| Roles: `SUPER_ADMIN`, `CLIENT_ADMIN`, `AGENT` | ✅ |
| `botMemberGuard` — validación de membresía por bot | ✅ |
| Aislamiento multitenant: ningún usuario ve datos de bots ajenos | ✅ |
| Gestión de miembros (invite, revocar, protección último admin) | ✅ |

### WhatsApp Cloud API (Integración Real)
| Feature | Estado |
|---|---|
| Webhook entrante verificado por Meta (`GET /webhooks`) | ✅ |
| Recepción de mensajes de texto y audio reales | ✅ |
| Envío de mensajes desde UI a través de Graph API real | ✅ |
| Configuración de credenciales WA por bot (`phoneNumberId`, `token`) | ✅ |
| Descarga de media (`downloadMedia`) desde URLs privadas de Meta | ✅ |

### Pipeline de Audio e IA (Sprint 04–05)
| Feature | Estado |
|---|---|
| Descarga y almacenamiento de audio en Supabase Storage (bucket real) | ✅ |
| Signed URLs de acceso temporal via proxy `/api/media/proxy` | ✅ |
| Transcripción de voz con OpenAI Whisper | ✅ |
| Clasificación de intención con Cerebras (Llama-3, zero-shot) | ✅ |
| Derivación a `pending_human` por baja confianza | ✅ |
| Umbral `intentionThreshold` configurable por bot (no hardcodeado) | ✅ |
| Respeto estricto de estado `manual` (suspende todo el pipeline) | ✅ |
| `conversation_events` — auditoría híbrida con 6 tipos de evento | ✅ |

### Motor de Automatizaciones (Sprint 03)
| Feature | Estado |
|---|---|
| Keyword rules con `matchType` (`exact` / `includes`) | ✅ |
| Respuesta automática con texto/link/template preparado | ✅ |
| Suspensión automática si conversación está en `manual` | ✅ |
| `automation_enabled` independiente del switch de IA | ✅ |

### Configuración Operativa por Bot (Sprint 05–06)
| Feature | Estado |
|---|---|
| `bot_active` — kill switch global del bot | ✅ |
| `automation_enabled` — activa/desactiva respuestas por keyword | ✅ |
| `ai_enabled` — activa/desactiva pipeline Whisper + Cerebras | ✅ |
| `intentionThreshold` — slider 0–100% desde UI | ✅ |
| Cascada aisla correctamente cada capa sin ambigüedad | ✅ |

### Métricas y Dashboard (Sprint 06)
| Feature | Estado |
|---|---|
| Métricas diarias reales (no mock) por bot | ✅ |
| Zona horaria UTC explícita, normalizada a `T00:00:00.000Z` | ✅ |
| Upsert idempotente con constraint `UNIQUE(bot_id, date)` | ✅ |
| Contadores: entrantes, salientes, IA, handoffs, `pending_human` | ✅ |
| Dashboard `/bots/[botId]/dashboard` con 5 KPIs | ✅ |

### Bandeja de Conversaciones (Sprint 02–06)
| Feature | Estado |
|---|---|
| Lista de conversaciones por bot con datos de contacto | ✅ |
| Filtros por `status` y `messageType` (no cruzan bots) | ✅ |
| Filtros se limpian al cambiar de bot | ✅ |
| Timeline híbrido (mensajes + event pills de IA) | ✅ |
| Panel lateral de auditoría (raw JSON por evento) | ✅ |
| Reproductor de audio + transcripción inline | ✅ |
| Banners de acción para `manual` y `pending_human` | ✅ |
| Botones "Tomar control" / "Reanudar automático" | ✅ |
| Envío de mensajes salientes desde UI | ✅ |

### Pruebas Automatizadas
| Suite | Cubre |
|---|---|
| `AutoReplyService.test.ts` | Instanciación del servicio |
| `CerebrasIntentionProvider.test.ts` | Parsing de intención y fallback |
| `BotSettingsLogic.test.ts` | Tabla de verdad 3 switches + modo manual |
| `InboxFilters.test.ts` | 5 casos de filtrado sin cruce de bots |
| `BotMemberGuard.test.ts` | 5 casos de aislamiento 403 / bypass SUPER_ADMIN |
| `MetricsUpsert.test.ts` | Normalización UTC, idempotencia de clave |

---

## 2. Qué Quedó Pendiente / Fuera de Alcance

Estas funcionalidades fueron conscientemente excluidas del MVP o diferidas:

| Item | Motivo |
|---|---|
| **Tests E2E visuales** (Cypress/Playwright) | Fuera de alcance MVP. Definido como post-MVP. |
| **Notificaciones push / WebSockets** | El polling actual (5s/3s) es suficiente para Beta. Real-time diferido. |
| **Envío de templates oficiales de Meta** | La infraestructura tiene `templateId` preparado, pero el alta de templates en Meta requiere aprobación externa. |
| **IA generativa conversacional** (respuestas libres) | Diseño deliberado: la IA clasifica, no genera texto libre. Evita respuestas incorrectas. |
| **Panel de analytics histórico** (gráficas de semanas/meses) | Solo se implementaron métricas del día. Histórico es post-MVP. |
| **Gestión de usuarios desde UI** (crear cuentas nuevas) | El registro existe como endpoint, pero no hay pantalla de administración de usuarios globales. |
| **Borrado/restauración de bots** | No implementado. Solo `active`/`inactive` como estado. |
| **Flujos de automatización por tiempo** (inactividad N minutos) | La tabla `automation_flows` fue creada con estructura base, pero sin ejecutor de disparadores. |
| **Búsqueda de conversaciones** (campo de búsqueda) | El input de búsqueda en el inbox está visualmente pero sin lógica de filtrado por texto. |

---

## 3. Deuda Técnica Abierta

| Deuda | Severidad | Descripción |
|---|---|---|
| **Token en `/api/media/proxy`** | 🟠 Media | El `?token=dummyAuth123` no está ligado criptográficamente al usuario ni al botId. Válido para beta controlada, riesgo para producción pública. Ver `TECH_DEBT.md`. |
| **Sin paginación en conversaciones** | 🟡 Baja | A volumen alto (> 500 conversaciones), la lista se degrada. Se debe añadir `?page=N&limit=50`. |
| **Retención de audio en Supabase** | 🟡 Baja | Los archivos `.ogg` se acumulan indefinidamente. Requiere TTL/purga. Ver `TECH_DEBT.md`. |
| **Auth de usuario anémico** | 🟠 Media | El `passwordHash` es un campo simple sin Argon2/bcrypt real. Para producción se debe migrar a Supabase Auth nativo o equivalente. |
| **`require()` dinámicos en rutas** | 🟡 Baja | Varios endpoints usan `require('@botforge/infrastructure')` en tiempo de ejecución. Funciona pero no es idiomático en ESM. Refactor progresivo recomendado. |
| **Lint persistente** `@botforge/typescript-config/base.json` | 🟢 Cosmético | Error de tsconfig en `packages/core`. No bloquea compilación ni ejecución. |

---

## 4. Riesgos Conocidos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| **Token de acceso a media expuesto** | Media | Alto | No exponer URL de medios en fuentes públicas. Migrar a tokens JWT firmados a corto plazo. |
| **Timeout de Cloudflare Workers en pipeline de audio** | Media | Alto | El pipeline download→upload→Whisper→Cerebras puede superar 30s. Refactorizar a queue/worker asíncrono antes de carga alta. |
| **Reintentos de Meta duplican eventos** | Baja | Medio | El upsert idempotente en métricas mitiga parcialmente. Los mensajes duplicados aún podrían insertarse. Considerar deduplicar por `messageId` de Meta. |
| **Credenciales en `.env` sin rotación** | Baja | Alto | `OPENAI_API_KEY`, `CEREBRAS_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` nunca han rotado. Configurar rotación y alertas en producción. |
| **Sin rate limiting** | Media | Medio | El webhook no tiene protección contra flood. Poner límite de requests por IP en el edge antes de producción. |

---

## 5. Decisiones Técnicas Importantes

| Decisión | Razonamiento |
|---|---|
| **Drizzle ORM sobre Prisma** | Mejor compatibilidad con Edge/Cloudflare Workers sin runtime de Node puro. |
| **Hono sobre Express/Fastify** | Ultra-liviano, Edge-native, excelente para Cloudflare Workers. |
| **IA clasifica → no genera** | La IA detecta intención y mapea contra reglas configuradas. Evita que el bot invente respuestas operativas (precios, horarios) incorrectos. Decisión de diseño core. |
| **3 switches maestros separados** | `bot_active`, `automation_enabled`, `ai_enabled` son mutuamente independientes por diseño. Apagar IA no apaga el dumb-bot. |
| **`pending_human` ≠ `manual`** | `pending_human` = sistema derivó por ambigüedad. `manual` = humano tomó control activo. Esta distinción semántica es clave para el flujo de trabajo de agentes. |
| **Métricas UTC explícitas** | Todos los contadores se normalizan a `T00:00:00.000Z`. Elimina ambigüedad de zona horaria en equipos distribuidos. |
| **Timeline híbrido (mensajes + eventos)** | Los `conversation_events` se mezclan cronológicamente con mensajes en el feed. Los agentes ven el razonamiento de la IA sin salir de la conversación. |
| **Supabase Storage como bucket principal** | Centraliza almacenamiento en el mismo proveedor que la DB. Las signed URLs permiten acceso temporal sin exponer credenciales al frontend. |

---

## 6. Estado de Preparación para Producción

### ✅ Listo para prueba controlada (Beta privada)
- Flujo completo WhatsApp → Webhook → Pipeline → Respuesta/Derivación funcionando end-to-end.
- Aislamiento multitenant por `bot_id` implementado en backend y validado con guard.
- Variables de entorno documentadas y separadas del código.
- Funciona con número de prueba de WhatsApp Business.

### ⚠️ Requiere acción antes de producción pública
1. **Token de media**: Migrar de `?token=dummy` a JWT firmado con TTL corto vinculado a `userId + botId + path`.
2. **Auth de contraseñas**: Integrar Supabase Auth nativo o agregar bcrypt/Argon2 real al endpoint de registro.
3. **Rate limiting**: Configurar límites en el edge de Cloudflare (Workers Rate Limiting o WAF Rule).
4. **Pipeline asíncrono**: Mover la transcripción + clasificación a una Cola (Cloudflare Queues / Upstash QStash) para liberar el webhook de la latencia de IA.
5. **Paginación**: Implementar antes de llegar a > 200 conversaciones por bot.

### 🔑 Variables de Entorno Requeridas
```
DATABASE_URL=
JWT_SECRET=
WHATSAPP_VERIFY_TOKEN=
OPENAI_API_KEY=
CEREBRAS_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STORAGE_BUCKET_NAME=whatsapp-media
NEXT_PUBLIC_API_URL=https://tu-api.workers.dev
```

---

## 7. Validación E2E del Flujo Completo

El siguiente flujo representa el recorrido completo del sistema:

```
Cliente WhatsApp
  │
  │  [Envía mensaje de texto o nota de voz]
  ▼
Meta Cloud API  ──→  POST /api/webhooks/whatsapp
                          │
                          ├─ Verificar bot propietario (botWhatsappConfigs)
                          ├─ Leer bot_configs: {botActive, automationEnabled, aiEnabled}
                          │
                          ╔═[AUDIO]══════════════════════════════════╗
                          ║ Descargar media (WhatsAppProvider)       ║
                          ║ Subir a Supabase Storage (storagePath)   ║
                          ║ if aiEnabled:                            ║
                          ║   Transcribir (OpenAI Whisper)           ║
                          ║   Clasificar (Cerebras → intent+score)   ║
                          ║   Insertar conversation_event            ║
                          ║   if score < intentionThreshold:         ║
                          ║     → status = pending_human             ║
                          ╚══════════════════════════════════════════╝
                          │
                          ├─ Guardar mensaje en DB (messages)
                          ├─ Incrementar métricas (MetricsService)
                          │
                          ├─[status == manual/pending_human] → PARAR
                          │
                          ╔═[AUTOMATION]══════════════════════════╗
                          ║ if automationEnabled:                  ║
                          ║   AutoReplyService.process(text/intent)║
                          ║   if rule found:                       ║
                          ║     → Enviar respuesta (Graph API)     ║
                          ║     → Guardar mensaje saliente         ║
                          ║     → Insertar auto_reply_sent event   ║
                          ║   else:                                ║
                          ║     → status = pending_human           ║
                          ╚═══════════════════════════════════════╝
                          │
                          ▼
Agente en Inbox (/bots/[botId]/inbox)
  │
  ├─ Ve conversación con audio + transcripción
  ├─ Ve event pills inline ("Intención: precio 95%")
  ├─ Ve banner "Derivado a Humano"
  ├─ Toma control manual → PATCH /conversations/:id/status {manual}
  ├─ Responde desde UI → POST /conversations/:id/messages
  └─ Reanuda automático → PATCH {open}
```

**Resultado**: Todos los nodos de este flujo tienen implementación real. El sistema puede usarse con un número de prueba de WhatsApp Business de forma inmediata, configurando las variables de entorno requeridas.

---

## 8. Archivos de Referencia

| Documento | Ubicación |
|---|---|
| Plan de Sprints | `DOCS/SPRINT_PLAN.md` |
| Notas de Migración | `DOCS/MIGRATIONS_NOTES.md` |
| Deuda Técnica | `DOCS/TECH_DEBT.md` |
| Registro de Cambios | `DOCS/cambios.md` |
| Hardening Report | `DOCS/HARDENING_REPORT.md` |
| Schema DB | `packages/infrastructure/src/db/schema.ts` |
| Tests Unitarios | `packages/infrastructure/tests/unit/` |

---

*Este documento constituye el cierre formal del ciclo MVP de BotForge (Sprint 01–06).*  
*Para continuar el desarrollo, abrir un nuevo ciclo de iteración con base en los riesgos y deuda técnica documentados aquí.*
