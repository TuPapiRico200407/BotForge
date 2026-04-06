# Fix Log - Sprint 04

### Fixes Aplicados Post-Gate
- **`packages/infrastructure/src/providers/OpenAIWhisperProvider.ts`**: Corregido problema de casteo Node/DOM donde `Blob` rechazaba un genérico de `Buffer` al crear el form multipart. Ahora utiliza `new Uint8Array(audioBuffer)` satisfaciendo las firmas web standard soportadas por node18+.
- **`packages/infrastructure/src/providers/WhatsAppProvider.ts`**: Creado un helper `downloadMedia` asíncrono puro de Fetch que extrae correctamente el content-type real provisto por los servidores de meta en vez de hardcodear OGG.
- **`packages/ui/src/components/ChatBubble.tsx`**: Inyección segura de proxy interno `http://localhost:3001/api/media?path=` para by-passear CORS y JWT de la API al solicitar audios desde etiquetas `<audio>` puras de HTML5.
