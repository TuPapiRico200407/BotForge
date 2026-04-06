# OBJETIVO (Sprint 05)

## Objetivo Central
Consolidar la operación de IA por bot permitiendo configurarla, supervisarla y controlarla de manera 100% gráfica desde nuestra Interfaz de Plataforma sin reimplementar el core resuelto en el Sprint 04.

## Alcance
Este sprint dotará al **Admin** del poder para:
1. Activar o desactivar al Bot y su IA a placer (`bot_active`, `automation_enabled`, `ai_enabled`).
2. Configurar mediante formularios la temperatura/límites con la que la IA clasifica (`intentionThreshold`), sus prompts y sus fallbacks directamente en los settings del Bot.
3. Observar visualmente en la bandeja del `Inbox` qué ocurrió dentro del `Audio Pipeline`: Ver claramente insignias de "Resuelto por IA", "Derivación a Humano por baja confianza (40% vs 75%)", etc.
