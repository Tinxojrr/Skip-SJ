# Plan de Pruebas de Software (Master Test Plan)
## Sistema SKIP Duoc UC - Sede San Joaquín
**Plataforma de Click & Collect y Gestión Gastronómica Inteligente con IA**

---

### Control del Documento

| Versión | Fecha | Autor / Rol | Descripción del Cambio |
| :--- | :--- | :--- | :--- |
| **1.0** | 28/10/2026 | Equipo de Desarrollo SKIP | Versión inicial integral para cierre de proyecto y evaluación de título |

---

## 1. Introducción y Objetivos

### 1.1. Propósito
El presente Plan de Pruebas establece la estrategia, alcance, recursos, entorno, responsabilidades y criterios de aceptación para verificar y validar integralmente el ecosistema de software **SKIP Duoc UC (Sede San Joaquín)**. Su propósito es garantizar que la aplicación móvil de los estudiantes, el dashboard web táctil de los locatarios y el servicio de inteligencia artificial generativa operen con los más altos estándares de calidad, seguridad, reactividad y usabilidad.

### 1.2. Objetivos de Calidad
1. **Verificación Funcional:** Comprobar que el 100% de los requerimientos funcionales del flujo *End-to-End* (registro, exploración de catálogo, personalización de pedidos, pago por Open Banking, sincronización WebSocket en cocina y retiro por código) se ejecuten sin errores.
2. **Rendimiento y Tiempo Real:** Validar que los eventos de cambio de estado en cocina se propaguen a la aplicación móvil con una latencia inferior a **500 ms** mediante canales PostgreSQL Realtime.
3. **Seguridad y Aislamiento de Datos:** Asegurar que las políticas de *Row Level Security (RLS)* impidan accesos cruzados entre concesionarios y protejan la privacidad de los datos institucionales de los alumnos.
4. **Experiencia de Usuario (UX/UI):** Confirmar la correcta ergonomía visual en Modo Claro y Modo Oscuro (*Obsidian Dark Mode*), garantizando contrastes WCAG AA y concordancia fotográfica de los productos.

---

## 2. Alcance de las Pruebas

### 2.1. Elementos en Alcance (In-Scope)
* **Aplicación Móvil Estudiantes (`skip-sj-mobile`):**
  * Autenticación institucional con dominio `@duocuc.cl` y `@profesor.duoc.cl`.
  * Catálogo de locales (Castaño, Achoclonado, Comedor Central, Paradiso, Local -1).
  * Ficha de producto con selector de cantidad, notas de preparación y favoritos interactivos.
  * Carrito de compras y pasarela bancaria simulada bajo estándar Open Banking (BancoEstado / BAES).
  * Generación y visualización del código nemotécnico de retiro de 4 caracteres.
  * Notificaciones locales y en bandeja de avisos.
  * Configuración de usuario, cambio de contraseña institucional y conmutador de Modo Oscuro.
* **Dashboard Web Locatarios (`skip-sj-dashboard`):**
  * Tablero Kanban en tiempo real con 4 columnas (`Pendiente`, `En Cocina`, `Listo en Mesón`, `Entregado`).
  * Desglose de comandas con notas de personalización del alumno destacadas.
  * Alerta auditiva (*chime sound*) al ingresar un nuevo pedido.
  * Módulo de Copiloto IA con Gemini 3 Flash para análisis de cuellos de botella y sugerencias de upselling.
  * Control de disponibilidad y stock de productos en vivo.
  * Historial analítico de ventas y métricas de facturación.
* **Infraestructura Cloud y Base de Datos (Supabase BaaS):**
  * Integridad referencial de tablas (`usuarios`, `locatarios`, `categorias_menu`, `productos`, `pedidos`, `pedido_items`).
  * Mecanismos de seguridad RLS por rol (`alumno`, `store_admin`, `super_admin`).
  * Canales de transmisión de cambios por WebSockets (*Postgres CDC*).

### 2.2. Elementos Fuera de Alcance (Out-of-Scope)
* Integración real con la API financiera productiva de Transbank / Webpay Plus (se implementa el flujo directo Open Banking conforme al requerimiento académico).
* Pruebas de compatibilidad con sistemas operativos móviles iOS inferiores a la versión 14.

---

## 3. Estrategia y Niveles de Prueba

El aseguramiento de calidad del proyecto se estructuró siguiendo la pirámide de pruebas:

```
          / \
         / E2E \       -> Flujo completo Estudiante -> Cocina -> Retiro
        /-------\
       / Integr. \     -> Conexión Supabase, WebSockets, Supabase Auth
      /-----------\
     /   Módulos   \   -> Stores Zustand, Hooks, Utilidades de Formato
    /---------------\
   /    Estáticas    \ -> TypeScript Compiler (tsc --noEmit), Linters
  /-------------------\
```

### 3.1. Pruebas de Tipado y Sintaxis Estática
* **Herramienta:** Compilador de TypeScript (`tsc --noEmit`).
* **Frecuencia:** Ejecutado antes de cada commit en ambos subproyectos (`skip-sj-mobile` y `skip-sj-dashboard`).
* **Criterio:** Cero errores de tipado o interfaces desalineadas con el esquema de base de datos.

### 3.2. Pruebas de Integración y Servicios
* Validación de clientes Supabase (`@supabase/supabase-js`), comprobando que las consultas SELECT, INSERT y UPDATE respeten las reglas de RLS.
* Comprobación de suscripciones Realtime a la tabla `pedidos` asegurando reconexión automática ante microcortes de red.
* Validación del SDK de Google GenAI (`gemini-3-flash-preview`) verificando la estructura JSON de las tarjetas de diagnóstico Bento.

### 3.3. Pruebas de Sistema y Flujo End-to-End (E2E)
* Simulación de pedidos simultáneos desde emuladores Android hacia terminales web abiertos en Chrome.
* Verificación de la consistencia del código alfanumérico generado en el móvil frente al visualizado en la pantalla de cocina.

### 3.4. Pruebas de Concurrencia y Carga de Hora Punta
* Simulación de carga típica de recreo universitario (12:45 hrs): inserción de múltiples pedidos en ráfaga para verificar que el tablero Kanban no sufra duplicidad de tarjetas ni pérdida de alertas sonoras.

### 3.5. Pruebas de Usabilidad y Accesibilidad (UI/UX)
* Verificación de contrastes de color en Modo Oscuro (`#09090B` fondo, `#18181B` tarjetas, `#F4F4F5` textos principales, `#F2A900` acento dorado institucional).
* Verificación de concordancia visual de fotografías de alimentos en el catálogo.

---

## 4. Recursos y Entorno de Pruebas

### 4.1. Recursos de Hardware
* **Estación de Pruebas:** PC Intel Core i7 / AMD Ryzen, 16 GB RAM, Windows 11.
* **Dispositivo de Emulación:** Android Virtual Device (AVD) Pixel 7 Pro ejecutando Android 14 (API 34) vía Android Studio.
* **Dispositivos Físicos de Apoyo:** Smartphone Android (Xiaomi / Samsung) con depuración USB habilitada.

### 4.2. Recursos de Software y Herramientas
* **Runtime Móvil:** React Native 0.76+ con Expo SDK 52 / Expo Router.
* **Bundler Móvil:** Metro Bundler sobre Node.js v24+.
* **Servidor de Dashboard:** Vite v8.1+ con Hot Module Replacement (HMR).
* **Navegadores Soportados:** Google Chrome v120+, Microsoft Edge.
* **Gestor de Base de Datos:** Supabase Cloud Studio y CLI.

### 4.3. Roles y Responsables

| Rol en el Plan | Responsable | Funciones Principales |
| :--- | :--- | :--- |
| **Líder de QA / Pruebas** | Martin (Equipo SKIP) | Definición del plan, priorización de casos y aprobación final de versiones. |
| **Desarrollador Frontend Móvil** | Equipo SKIP | Corrección de interfaces, reactividad en React Native y ajustes de modo oscuro. |
| **Desarrollador Backend / Cloud** | Equipo SKIP | Mantenimiento de políticas RLS, esquemas SQL y canales WebSocket. |
| **Validador de Negocio (Locatario)** | Concesionario Piloto | Validación de ergonomía en cocina y legibilidad de códigos de retiro. |

---

## 5. Criterios de Aceptación, Suspensión y Reanudación

### 5.1. Criterios de Aprobación de la Entrega (Exit Criteria)
1. **100% de Casos Críticos Aprobados:** Ningún caso de prueba catalogado como de severidad *Bloqueante* o *Alta* puede permanecer abierto.
2. **Cero Mocks en Flujos Principales:** Eliminación total de datos ficticios o botones de bypass en producción/entrega final.
3. **Concordancia de Datos:** Las fotos, precios y descripciones deben coincidir exactamente con los productos de la sede.
4. **Compilación Limpia:** `npx tsc --noEmit` debe finalizar con código 0 sin excepciones.

### 5.2. Criterios de Suspensión
Las pruebas se suspenderán temporalmente si:
* El servicio de base de datos Supabase o la red institucional no está disponible.
* Se produce un error que impida iniciar sesión o que bloquee el renderizado de la pantalla de inicio (*White Screen of Death*).

### 5.3. Criterios de Reanudación
Las pruebas se reanudarán una vez desplegado el hotfix correspondiente y validada la restauración del servicio mediante una prueba de humo (*Smoke Test*).
