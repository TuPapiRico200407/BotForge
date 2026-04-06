# CONTRATO DE INTEGRACIÓN (Sprint 04)

### Flujo del Webhook (`type: 'audio'`)
1. Payload entrante trae `messages[0].audio.id`.
2. Backend solicita GET API de Meta para adquirir la URL temporal de descarga.
3. Backend llama GET a URL temporal y descarga el binario `audio/ogg`.
4. Upload a Bucket Storage -> `<Public URL>`.
5. Transcripción IA (`Whisper`) -> `TranscriptionText`.
6. Intent Classifier IA recibe `[TranscriptionText] + [KeywordsArray]`.
7. Si clasificador escoge `<Keyword>`, inyectar en `AutoReplyService`.
8. Si clasificador devuelve `<Ambigua>`, ejecutar actualización de bd `conversations` a status `manual`.
9. Persistir mensaje original marcando: `mediaUrl` y `transcription`.
