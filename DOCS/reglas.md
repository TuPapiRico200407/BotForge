# REGLAS Y POLÍTICAS (Sprint 04)

### Política Estricta de Audios Impuesta por el Cliente:
1. Toda nota de voz debe almacenarse y poder reproducirse en la bandeja del Inbox.
2. Toda nota de voz debe transcribirse visualmente.
3. La IA debe interpretar la transcripción para detectar intención.
4. Si la intención detectada coincide con una palabra clave, automatización, link o plantilla configurada del bot, el sistema debe responder automáticamente con esa respuesta pre-configurada (Acoplándose al `AutoReplyService`).
5. Si la transcripción es ambigua, incompleta, de baja confianza o no entendible, la conversación debe derivarse *automáticamente* a un administrador/agente (Cambiando el estado de la convo a `manual`).
6. **PROHIBIDO INVENTAR**: La IA no debe inventar respuestas operativas libres; solo actúa como proxy de enrutamiento hacia respuestas estructuradas o hacia el humano.
