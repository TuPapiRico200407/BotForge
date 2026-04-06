# UI DIFF - Sprint 01

## Componentes agregados en `/packages/ui`
Se incorporaron componentes esenciales listos para React y Next.js adhiriendo al estándar visual minimalista global.

1. **Input**: Estilo unificado para control de formularios, manejando internamente el foco y bordes de `error: boolean` que inyecta bordes rojos.
2. **Modal**: Implementa un contenedor fijado global con un `backdrop-blur-sm` (vidrio esmerilado suave) y la estilización de base de tarjeta blanca elevada.
3. **Card**: Layout flexible `rounded-xl` y `shadow-sm` con borders suaves, ideal para contener Listados de Bots en grids.
4. **EmptyState**: Patrón estandarizado para visualización ante ausencia de datos (Ej. "No tienes bots", o "Tu Inbox está vacío"). Usa `border-dashed` sobre fondo 50/50.

## Impacto en Consistencia Global
Todos los formularios y estados vacíos del Sprint 01 de Web heredarán estos props, erradicando elementos HTML nativos o CSS duro dentro de `apps/web`. Evitamos el rediseño repetitivo de Modales o Inputs.
