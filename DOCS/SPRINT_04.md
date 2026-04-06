# SPRINT_04.md

## 1) Objetivo del sprint
Agregar soporte de media en la bandeja: visualizar imágenes/documentos, reproducir audios y derivar automáticamente a humano cuando llegue un archivo no textual.

## 2) Casos de uso

### CU13 — Procesar media entrante
- **Actor:** Sistema
- **Precondiciones:** Llega mensaje tipo image/audio/document.
- **Flujo principal:**
  1. WhatsApp envía webhook con media.
  2. El sistema identifica tipo de media.
  3. Recupera referencia del archivo.
  4. Guarda metadata y vínculo al mensaje.
  5. Si corresponde, marca conversación para humano.
- **Casos borde:**
  1. Media corrupta.
  2. URL temporal expirada.
  3. Tipo no soportado.
  4. Duplicado.
  5. Error al guardar metadata.
- **Criterios de aceptación:**
  - [ ] El mensaje media queda asociado a la conversación.
  - [ ] Se persiste tipo y referencia.
  - [ ] La conversación puede cambiar a estado humano.

### CU14 — Ver imagen/documento en bandeja
- **Actor:** Super Admin / Cliente Admin / Agente
- **Precondiciones:** Existe media asociada.
- **Flujo principal:**
  1. El usuario abre conversación.
  2. Ve thumbnail o enlace visual del archivo.
  3. Abre vista previa o documento.
- **Casos borde:**
  1. Archivo no disponible.
  2. Imagen muy pesada.
  3. Documento sin preview.
  4. Permisos de acceso al archivo.
  5. Archivo eliminado.
- **Criterios de aceptación:**
  - [ ] Las imágenes se ven desde la bandeja.
  - [ ] Los documentos se pueden abrir/visualizar según soporte.
  - [ ] No hace falta salir del sistema para identificar que llegó.

### CU15 — Reproducir audio en bandeja
- **Actor:** Super Admin / Cliente Admin / Agente
- **Precondiciones:** Existe audio asociado a conversación.
- **Flujo principal:**
  1. El usuario abre conversación.
  2. Ve componente de audio.
  3. Reproduce/pausa.
- **Casos borde:**
  1. Audio no disponible.
  2. Error de carga.
  3. Audio largo.
  4. Permisos de acceso.
  5. Reproducción fallida en navegador.
- **Criterios de aceptación:**
  - [ ] El audio se puede escuchar desde la bandeja.
  - [ ] Se identifica claramente como nota de voz.

### CU16 — Derivación automática a humano por archivo
- **Actor:** Sistema
- **Precondiciones:** Llega imagen, documento u otro archivo según política.
- **Flujo principal:**
  1. Se detecta mensaje media no textual.
  2. El sistema cambia estado de conversación.
  3. Se registra evento de handoff.
  4. La conversación queda visible para atención humana.
- **Casos borde:**
  1. Ya estaba en humano.
  2. Cambio concurrente.
  3. Media de audio que seguirá otra ruta.
  4. Bot sin agentes asignados.
  5. Error al registrar evento.
- **Criterios de aceptación:**
  - [ ] Imagen/documento derivan a humano automáticamente.
  - [ ] El evento queda auditado.
  - [ ] El estado se refleja en inbox.

## 3) Entidades / Estados tocados
- `messages`
- `message_media`
- `conversations`
- `handoff_events`

## 4) Endpoints sugeridos
- `POST /webhooks/whatsapp`
- `GET /bots/:botId/conversations/:conversationId/media/:mediaId`
- `POST /bots/:botId/conversations/:conversationId/mark-human`

## 5) Pantallas UI exactas del sprint
### 1. Detalle de conversación con media
- Tipo: detalle
- Componentes: timeline con textos, imágenes, documentos y audios

### 2. Visor de imagen/documento
- Tipo: modal/detalle
- Componentes: preview, metadatos básicos, abrir/cerrar

### 3. Reproductor de audio
- Tipo: componente embebido
- Componentes: play/pause, duración, estado carga

### 4. Estado y handoff en conversación
- Tipo: detalle
- Componentes: badge estado, evento handoff, indicador “requiere humano”

## 6) Datos seed mínimos
- 1 imagen demo
- 1 documento demo
- 1 audio demo
- 3 conversaciones con media

## 7) Tests mínimos sugeridos
- Media se guarda asociada al mensaje.
- Imagen se visualiza en bandeja.
- Audio se reproduce.
- Imagen/documento cambian conversación a humano.