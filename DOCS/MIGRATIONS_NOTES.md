# MIGRATION NOTES - Sprint 04

## Modificaciones Estructurales (`schema.ts`)
Durante este sprint la tabla de mensajes y la conversación crecieron sustancialmente para apoyar el procesamiento de Media y Delegación Humana.

### `messages` Table
**Nuevas Columnas**:
- `storagePath` (text): Ruta interna segura del nodo del bucket donde quedó almacenado el audio.
- `mediaType` (text): Guardado típicamente como 'audio/ogg' para instanciar en tags HTML.
- `transcriptionText` (text): Frase transcrita por Whisper de principio a fin.
- `transcriptionStatus` (text): Flag asíncrono para UX (`completed`, `failed`).
- `intentionDetected` (text): La palabra mágica mapeada o `unknown` emitida por Cerebras.
- `intentionConfidence` (integer): Certeza 0 a 100 de la inferencia.

**Enum Changes**:
- `message_type`: Antes solo tenía text/system/template, incorporamos dinámicamente `audio`, `image`, `document`.

### `conversations` Table
**Enum Changes**:
- `conversation_status`: Se introdujo el estado `pending_human`. Sirve como semáforo rojo cuando al bot se le "escapan" cosas de control y requiere asistencia a gritos.

### `bot_configs` Table
**Nuevas Columnas**:
- `intentionThreshold` (integer): Establece la flexibilidad del cliente a equivocarse. Por defecto `75`. Si el Cerebras confía en un 70%, por políticas conservadoras ahora cortará a Humano. ¡Dejó de estar hardcodeado!
