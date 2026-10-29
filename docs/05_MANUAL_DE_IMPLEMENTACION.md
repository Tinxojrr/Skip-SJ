# Manual de Implementación y Despliegue Técnico
## Sistema SKIP Duoc UC - Sede San Joaquín
**Documentación de Ingeniería, Configuración de Entornos y Puesta en Marcha**

---

## 1. Arquitectura Técnica y Stack Tecnológico

El ecosistema **SKIP Duoc UC** está construido bajo una arquitectura desacoplada y orientada a eventos en tiempo real:

```
[ Dispositivo Móvil Estudiante ]       [ Terminal Web Cocina ]
    React Native + Expo SDK 52            React 19 + Vite 8 + Tailwind
           │                                      │
           │ (HTTPS / REST)                       │ (HTTPS / REST)
           ▼                                      ▼
    ┌────────────────────────────────────────────────────────┐
    │              SUPABASE CLOUD PLATFORM                   │
    │  - PostgreSQL 15 (Tablas, RLS, Vistas, Triggers)       │
    │  - Supabase Auth (JWT, Dominios @duocuc.cl)            │
    │  - Supabase Realtime (WebSockets CDC: pedidos)         │
    └────────────────────────────────────────────────────────┘
                               │
                               ▼ (API REST)
                 ┌───────────────────────────┐
                 │   GOOGLE GEMINI 3 FLASH   │
                 │   (Analítica con IA)      │
                 └───────────────────────────┘
```

### Componentes del Sistema:
1. **Frontend Móvil (`skip-sj-mobile`):**
   * Framework: React Native con Expo Router (File-based Routing).
   * Estado Global: Zustand (`authStore`, `cartStore`, `favoritesStore`, `themeStore`).
   * Animaciones y Gestos: React Native Reanimated v3.
   * Iconografía y UI: Lucide React Native, Expo Blur.
2. **Frontend Web (`skip-sj-dashboard`):**
   * Framework: React 19 + TypeScript + Vite.
   * Estilizado: Tailwind CSS v4 con paleta Obsidian nocturna y modo claro.
   * Gráficos: Recharts.
   * Audio: Web Audio API para alertas sonoras de cocina.
3. **Backend as a Service (Supabase):**
   * Motor Relacional: PostgreSQL 15.
   * Seguridad: Row Level Security (RLS) en todas las entidades públicas.
   * Mensajería en Tiempo Real: Canales WebSocket suscritos a cambios de fila (`postgres_changes`).
4. **Motor de Inteligencia Artificial:**
   * SDK: `@google/genai` con modelo `gemini-3-flash-preview`.

---

## 2. Requisitos Previos del Sistema

### 2.1. Entorno de Desarrollo (Host Machine)
* **Sistema Operativo:** Windows 10/11 (64-bit), macOS 13+ o Linux Ubuntu 22.04 LTS.
* **Node.js:** Versión 20.x LTS o superior (recomendado Node.js 22+).
* **Gestor de Paquetes:** `npm` (v10+) o `pnpm`.
* **Control de Versiones:** `git` (v2.40+).

### 2.2. Entorno para Ejecución Android (App Móvil)
* **Android Studio:** Ladybug (2024.2.1) o superior.
* **Java Development Kit (JDK):** OpenJDK 17.
* **Android SDK:**
  * Android SDK Build-Tools 34.0.0+.
  * Plataforma SDK Android 14.0 (API 34).
  * Android Emulator con aceleración por hardware (HAXM o Hyper-V).
* **Variable de Entorno del Sistema:**
  * `ANDROID_HOME`: Ruta al SDK de Android (ej: `C:\Users\<Usuario>\AppData\Local\Android\Sdk`).
  * `PATH`: Incluir `%ANDROID_HOME%\platform-tools` y `%ANDROID_HOME%\emulator`.

---

## 3. Configuración de Variables de Entorno

Ambos proyectos requieren archivos de configuración `.env` en sus directorios raíz.

### 3.1. Variables de la App Móvil (`skip-sj-mobile/.env`)
Crea el archivo `skip-sj-mobile/.env` con la siguiente estructura:

```ini
# URL del proyecto Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xillpulfdzkntplmquez.supabase.co

# Llave pública anónima de Supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.2. Variables del Dashboard Web (`skip-sj-dashboard/.env`)
Crea el archivo `skip-sj-dashboard/.env` con la siguiente estructura:

```ini
# Conexión a Supabase
VITE_SUPABASE_URL=https://xillpulfdzkntplmquez.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Key de Google Gemini para el Copiloto Gastronómico
VITE_GEMINI_API_KEY=AIzaSy...
```

---

## 4. Inicialización y Despliegue de la Base de Datos (Supabase)

Para desplegar la base de datos completa desde cero en un nuevo proyecto de Supabase, ejecuta los siguientes scripts SQL en orden cronológico dentro del **SQL Editor** de Supabase:

### Paso 1: Creación del Esquema y Tablas Base
Ejecuta el script [`supabase_schema.sql`](file:///c:/Users/Martin/skip-sj/supabase_schema.sql):
* Crea las tablas: `usuarios`, `locatarios`, `categorias_menu`, `productos`, `pedidos`, `pedido_items` y `promociones`.
* Configura los tipos ENUM (`user_role`, `order_status`).
* Habilita Row Level Security (RLS) en todas las entidades.

### Paso 2: Poblamiento del Catálogo Gastronómico de la Sede
Ejecuta el script [`poblar_catalogo.sql`](file:///c:/Users/Martin/skip-sj/poblar_catalogo.sql):
* Registra los 5 locales comerciales de la sede: *Achoclonado, Castaño, Comedor Central, Cafetería Paradiso y Local -1*.
* Crea las categorías de menú de cada concesionario.

### Paso 3: Soporte para Notas de Personalización en Cocina
Ejecuta el script [`agregar_columna_notas.sql`](file:///c:/Users/Martin/skip-sj/agregar_columna_notas.sql):
```sql
ALTER TABLE public.pedido_items ADD COLUMN IF NOT EXISTS notas TEXT;
```

### Paso 4: Políticas de Seguridad RLS para Acceso de Cocina
Ejecuta el script [`fix_rls_admin_items.sql`](file:///c:/Users/Martin/skip-sj/fix_rls_admin_items.sql):
* Autoriza al personal del local a leer los ítems y las notas de los pedidos entrantes a su respectivo establecimiento.

### Paso 5: Sincronización Fotográfica de Alta Resolución
Ejecuta el script [`actualizar_fotos_productos.sql`](file:///c:/Users/Martin/skip-sj/actualizar_fotos_productos.sql):
* Asigna las imágenes curadas en alta resolución con concordancia fotográfica para cada uno de los 25 productos.

### Paso 6: Habilitar Supabase Realtime
En la consola de Supabase:
1. Dirígete a **Database** ➔ **Replication**.
2. Asegúrate de que la tabla `pedidos` tenga habilitada la casilla de replicación en tiempo real para que los eventos `INSERT` y `UPDATE` se transmitan por WebSockets.

---

## 5. Procedimiento de Instalación y Ejecución Local

### 5.1. Clonar el Repositorio
```bash
git clone https://github.com/Tinxojrr/Skip-SJ.git
cd Skip-SJ
```

### 5.2. Iniciar el Dashboard Web (Locatarios)
1. Abrir una terminal en el directorio del dashboard:
   ```bash
   cd skip-sj-dashboard
   npm install
   ```
2. Ejecutar el servidor de desarrollo Vite:
   ```bash
   npm run dev
   ```
3. El dashboard estará disponible en: [http://localhost:5173/](http://localhost:5173/)

### 5.3. Iniciar la Aplicación Móvil (Estudiantes)
1. Abrir una segunda terminal en el directorio de la aplicación móvil:
   ```bash
   cd skip-sj-mobile
   npm install
   ```
2. Iniciar el emulador de Android desde Android Studio (Pixel 7 Pro recomendado).
3. Levantar Metro Bundler con caché limpia:
   ```bash
   npx expo start -c
   ```
4. Presionar la tecla `a` en la terminal para abrir e instalar la app directamente en el emulador de Android conectado.

---

## 6. Procedimiento de Despliegue en Producción

### 6.1. Despliegue del Dashboard Web en Vercel
1. Conectar el repositorio de GitHub en el panel de Vercel.
2. Seleccionar como **Root Directory**: `skip-sj-dashboard`.
3. Configurar **Build Command**: `npm run build`.
4. Configurar **Output Directory**: `dist`.
5. Agregar las variables de entorno en Vercel:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
   * `VITE_GEMINI_API_KEY`
6. Presionar **Deploy**. La aplicación web quedará en línea con certificado SSL gratuito.

### 6.2. Compilación del APK Nativo de Android con Expo EAS
Para distribuir la aplicación a los estudiantes mediante enlace de descarga o archivo APK instalable:

1. Instalar el CLI de Expo Application Services:
   ```bash
   npm install -g eas-cli
   ```
2. Iniciar sesión en Expo:
   ```bash
   eas login
   ```
3. Generar el APK autónomo (*standalone*):
   ```bash
   cd skip-sj-mobile
   eas build -p android --profile preview
   ```
4. Al finalizar la compilación en la nube de Expo, se obtendrá un enlace directo y código QR para descargar el archivo `.apk` e instalarlo en cualquier dispositivo Android sin necesidad de Android Studio.

---

## 7. Mantenimiento Preventivo y Solución de Problemas (Troubleshooting)

| Síntoma o Error | Causa Probable | Solución Técnica |
| :--- | :--- | :--- |
| **El emulador no conecta con Metro (`Waiting on localhost:8081`)** | El puerto 8081 está bloqueado o Metro se inició dentro de un sandbox sin red externa. | Iniciar Metro fuera del sandbox (`npx expo start -c`) y ejecutar en la terminal de Android: `adb reverse tcp:8081 tcp:8081`. |
| **Los pedidos nuevos no suenan ni aparecen en vivo en cocina** | La tabla `pedidos` no tiene activa la replicación Realtime en Supabase. | Ir al dashboard de Supabase ➔ Database ➔ Replication ➔ Habilitar el switch para la tabla `pedidos`. |
| **Error `fetch failed` al consultar productos en local** | El firewall local de Windows o el proxy de la red institucional bloquea la conexión externa. | Verificar conectividad ejecutando `curl https://<tu-id>.supabase.co/rest/v1/` y validar que las credenciales de anon key sean válidas. |
| **El Copiloto IA arroja error al generar diagnósticos** | Cuota de la API de Gemini superada o API Key no configurada en `.env`. | Obtener una nueva API Key gratuita en [Google AI Studio](https://aistudio.google.com/) y colocarla en `VITE_GEMINI_API_KEY`. |
