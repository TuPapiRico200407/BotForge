# UI KIT

Visual Reference Path: `/design/uikit/*` -> Implementado en `packages/ui`.

## Componentes Disponibles
- **Button**: `import { Button } from '@botforge/ui'`. Variantes: `primary`, `secondary`, `outline`, `danger`.

*(Restantes placeholders para iterar en Sprint 01 y 02)*
- Input (Pendiente)
- Modal (Pendiente)
- DataTable (Pendiente)

## Reglas de Uso
- Ningún componente de UI en `apps/web` debe contener clases `px-` si no está envuelto. Usar SIEMPRE Tailwind vía `@botforge/ui`.
- Estructuras modulares: el AppShell reside en `apps/web/app/app/layout.tsx`.
