# SPRINT_01.md

## 1) Objetivo del sprint
Dejar operativa la base de la plataforma: autenticación, control de acceso por bot, lista de bots visibles según permisos, creación básica de bot y entrada al inbox por bot.

## 2) Casos de uso

### CU01 — Iniciar sesión
- **Actor:** Super Admin / Cliente Admin / Agente
- **Precondiciones:** El usuario existe y tiene acceso habilitado.
- **Flujo principal:**
  1. El usuario abre login.
  2. Ingresa credenciales.
  3. El sistema autentica.
  4. Identifica bots permitidos.
  5. Redirige según cantidad de bots visibles.
- **Casos borde:**
  1. Credenciales inválidas.
  2. Usuario deshabilitado.
  3. Usuario sin bots asignados.
  4. Error del proveedor de auth.
  5. Usuario con 1 bot vs varios bots.
- **Criterios de aceptación:**
  - [ ] Solo accede a secciones permitidas.
  - [ ] Si tiene un solo bot permitido, puede entrar directo.
  - [ ] Si tiene varios, ve lista.
  - [ ] Si no tiene bots, ve mensaje claro.
  - [ ] No se exponen bots ajenos.

### CU02 — Ver lista de bots permitidos
- **Actor:** Super Admin / Cliente Admin / Agente
- **Precondiciones:** Usuario autenticado.
- **Flujo principal:**
  1. El usuario entra a pantalla de bots.
  2. El sistema consulta bots visibles.
  3. Lista nombre, rubro, estado y accesos.
  4. El usuario selecciona un bot.
- **Casos borde:**
  1. Cero bots visibles.
  2. Bots inactivos.
  3. Intento de acceso por URL a bot no permitido.
  4. Nombre duplicado.
  5. Latencia de carga.
- **Criterios de aceptación:**
  - [ ] Solo se muestran bots autorizados.
  - [ ] Cada bot muestra nombre, rubro y estado.
  - [ ] Se puede entrar al inbox o ajustes según permiso.
  - [ ] El acceso no autorizado es bloqueado.

### CU03 — Entrar a un bot
- **Actor:** Super Admin / Cliente Admin / Agente
- **Precondiciones:** Bot asignado al usuario.
- **Flujo principal:**
  1. El usuario elige un bot.
  2. El sistema valida permiso.
  3. Carga cabecera del bot e inbox inicial.
  4. Muestra estado general.
- **Casos borde:**
  1. Bot inexistente.
  2. Bot inactivo.
  3. Acceso revocado entre sesiones.
  4. Bot sin configuración.
  5. Bot sin conversaciones.
- **Criterios de aceptación:**
  - [ ] Solo entra si tiene permiso.
  - [ ] El inbox no mezcla datos.
  - [ ] Se visualiza estado del bot.
  - [ ] La URL queda asociada al `bot_id`.

### CU04 — Crear bot
- **Actor:** Super Admin
- **Precondiciones:** Permiso de creación.
- **Flujo principal:**
  1. Abre “Crear bot”.
  2. Ingresa nombre, rubro y estado inicial.
  3. Define flags base: IA sí/no, automatización sí/no.
  4. Guarda.
  5. El bot aparece en lista.
- **Casos borde:**
  1. Nombre vacío.
  2. Nombre demasiado largo.
  3. Bot duplicado.
  4. Falta rubro.
  5. Error al guardar.
- **Criterios de aceptación:**
  - [ ] Se crea con datos mínimos válidos.
  - [ ] Queda persistido con ID único.
  - [ ] Puede quedar activo o inactivo.
  - [ ] Queda listo para configuración posterior.

## 3) Entidades / Estados tocados
- `profiles`
- `bots`
- `bot_members`
- `sessions`

## 4) Endpoints sugeridos
- `POST /auth/login`
- `POST /auth/logout`
- `GET /me`
- `GET /bots`
- `GET /bots/:botId`
- `POST /bots`
- `PATCH /bots/:botId`

## 5) Pantallas UI exactas del sprint
### 1. Login
- Tipo: form
- Componentes: email, password, botón login, error

### 2. Lista de Bots
- Tipo: list
- Componentes: cards o tabla, búsqueda, badge rubro, estado, entrar, crear bot

### 3. Crear/Editar Bot
- Tipo: form
- Componentes: nombre, rubro, estado, toggles base, guardar/cancelar

### 4. Inbox del Bot (vacío)
- Tipo: detalle
- Componentes: header bot, estado, accesos rápidos, placeholder vacío

## 6) Datos seed mínimos
- 1 Super Admin
- 1 Cliente Admin
- 1 Agente
- 2 bots demo
- membresías de prueba

## 7) Tests mínimos sugeridos
- Login exitoso y fallido.
- Usuario solo ve bots autorizados.
- Acceso no autorizado por URL se deniega.
- Crear bot con datos mínimos.