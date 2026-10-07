# Requerimientos y Dependencias del Proyecto Skip SJ

Este documento describe detalladamente los requerimientos del sistema, el catálogo completo de dependencias y los pasos necesarios para instalar y ejecutar el proyecto **Skip SJ**.

El repositorio está organizado como una arquitectura modular compuesta por dos aplicaciones principales:
1. **`skip-sj-dashboard`**: Panel administrativo y analítico Web (Vite + React 19 + TypeScript + Tailwind CSS v4).
2. **`skip-sj-mobile`**: Aplicación móvil cliente (React Native + Expo SDK 57 + Expo Router + NativeWind).
3. **Base de Datos / Backend**: Supabase (PostgreSQL, Autenticación y almacenamiento en tiempo real).

---

## 1. Requerimientos del Sistema y Entorno

| Componente | Versión recomendada | Descripción |
| :--- | :--- | :--- |
| **Node.js** | `>= 20.x LTS` (mínimo 18+) | Entorno de ejecución para JavaScript/TypeScript |
| **npm** | `>= 9.x` o `10.x` | Gestor de paquetes oficial |
| **Git** | `>= 2.30` | Control de versiones |
| **Expo Go / Emulador** | Expo SDK 57 compatible | Para pruebas de la app móvil (Android / iOS) |
| **Cuenta / Instancia Supabase** | Cloud o Local | Base de datos PostgreSQL y servicio de Auth |

---

## 2. Dependencias: Panel Web (`skip-sj-dashboard`)

Ubicación: `skip-sj-dashboard/package.json`

### Dependencias de Producción (`dependencies`)

| Paquete | Versión | Propósito en el proyecto |
| :--- | :--- | :--- |
| `@supabase/supabase-js` | `^2.117.2` | Cliente oficial para conexión con Supabase (Auth, consultas y Realtime). |
| `react` | `^19.2.7` | Biblioteca núcleo de interfaces de usuario. |
| `react-dom` | `^19.2.7` | Renderizador de React para la web. |
| `react-router-dom` | `^7.18.2` | Enrutamiento del panel administrativo (páginas, layouts, rutas protegidas). |
| `recharts` | `^3.10.1` | Generación de gráficos analíticos (ingresos, ventas y estadísticas). |
| `react-hook-form` | `^7.89.0` | Manejo y optimización del estado de formularios (Login, Registro, etc.). |
| `@hookform/resolvers` | `^5.9.1` | Adaptador para integrar Zod con React Hook Form. |
| `zod` | `^3.25.76` | Validación de esquemas y tipado de datos en formularios. |
| `lucide-react` | `^1.27.0` | Paquete de iconos vectoriales para la interfaz. |
| `react-is` | `^19.2.8` | Utilidad de compatibilidad de tipos de elementos React. |

### Dependencias de Desarrollo (`devDependencies`)

| Paquete | Versión | Propósito en el proyecto |
| :--- | :--- | :--- |
| `vite` | `^8.1.1` | Empaquetador y servidor de desarrollo ultrarrápido (HMR). |
| `@vitejs/plugin-react` | `^6.0.3` | Integración de Vite con React y compilación Fast Refresh. |
| `typescript` | `~6.0.2` | Compilador y tipado estático de TypeScript. |
| `tailwindcss` | `^4.3.3` | Framework de diseño utilitario CSS (Tailwind v4). |
| `@tailwindcss/vite` | `^4.3.3` | Plugin oficial de Tailwind CSS v4 para Vite. |
| `postcss` | `^8.5.23` | Procesador de estilos CSS. |
| `autoprefixer` | `^10.5.4` | Añade prefijos de navegadores a las reglas CSS. |
| `oxlint` | `^1.71.0` | Linter de código de alto rendimiento. |
| `@types/react` | `^19.2.17` | Definición de tipos TypeScript para React. |
| `@types/react-dom` | `^19.2.3` | Definición de tipos TypeScript para React DOM. |
| `@types/node` | `^24.13.2` | Tipos TypeScript para el entorno Node.js. |

---

## 3. Dependencias: Aplicación Móvil (`skip-sj-mobile`)

Ubicación: `skip-sj-mobile/package.json`

### Dependencias de Producción (`dependencies`)

| Paquete | Versión | Propósito en el proyecto |
| :--- | :--- | :--- |
| `expo` | `~57.0.8` | Plataforma base del SDK de Expo 57. |
| `react` | `19.2.3` | Núcleo de React para React Native. |
| `react-dom` | `19.2.3` | Soporte web en Expo. |
| `react-native` | `0.86.0` | Framework móvil nativo para iOS y Android. |
| `react-native-web` | `~0.21.0` | Compatibilidad para ejecutar la app en navegadores web. |
| `@supabase/supabase-js` | `^2.110.8` | Cliente Supabase para autenticación y base de datos móvil. |
| `zustand` | `^5.0.14` | Gestor de estado global (carrito de compras `cartStore` y sesión `authStore`). |
| `expo-router` | `~57.0.8` | Sistema de navegación moderno basado en estructura de archivos (`app/`). |
| `expo-secure-store` | `^57.0.1` | Almacenamiento seguro y cifrado en el dispositivo para tokens de sesión. |
| `nativewind` | `^4.2.6` | Motor de estilos tipo Tailwind CSS para componentes React Native. |
| `tailwindcss` | `^3.4.19` | Framework de utilidades CSS para NativeWind. |
| `react-native-reanimated` | `^4.5.0` | Motor de animaciones fluidas a 60/120 fps. |
| `react-native-gesture-handler` | `~2.32.0` | Reconocimiento táctil y gestos nativos avanzados. |
| `react-native-safe-area-context` | `~5.7.0` | Manejo de áreas seguras en pantallas (notches, islas dinámicas, barras). |
| `react-native-screens` | `~4.26.0` | Optimización de memoria y uso de vistas nativas en navegación. |
| `react-native-worklets` | `0.10.0` | Ejecución de funciones en el hilo de UI nativo. |
| `react-native-url-polyfill` | `^4.0.0` | Polyfill para el objeto `URL` requerido por Supabase en React Native. |
| `lucide-react-native` | `^1.27.0` | Iconografía para interfaces móviles. |
| `expo-blur` | `^57.0.2` | Efectos visuales de desenfoque tipo cristal (Glassmorphism). |
| `expo-linear-gradient` | `^57.0.1` | Gradientes de color visuales. |
| `expo-image` | `~57.0.1` | Componente optimizado para carga y caché de imágenes. |
| `expo-image-picker` | `~57.0.17` | Acceso a galería o cámara para selección de imágenes. |
| `expo-constants` | `~57.0.7` | Constantes e información sobre el dispositivo y el runtime. |
| `expo-font` / `@expo-google-fonts/inter` | `~57.0.1` / `^0.4.2` | Carga de tipografía personalizada (fuente Inter). |
| `expo-splash-screen` | `~57.0.5` | Control de pantalla de bienvenida (Splash screen). |
| `expo-status-bar` | `~57.0.1` | Control del estilo de la barra de estado superior. |
| `expo-linking` | `~57.0.4` | Deep linking y apertura de URLs externas. |
| `expo-symbols` | `~57.0.1` | Soporte para símbolos de iOS (SF Symbols). |
| `expo-system-ui` | `~57.0.1` | Control del color de fondo del sistema a nivel raíz. |
| `expo-web-browser` | `~57.0.3` | Apertura de navegador dentro de la app (OAuth / Enlaces). |
| `expo-dev-client` | `^57.0.9` | Soporte para builds de desarrollo personalizados. |
| `expo-device` | `~57.0.1` | Información sobre el hardware del dispositivo. |
| `expo-glass-effect` | `~57.0.1` | Componente de efecto vidrio translúcido. |
| `@expo/ui` | `~57.0.7` | Componentes visuales oficiales de Expo. |

### Dependencias de Desarrollo (`devDependencies`)

| Paquete | Versión | Propósito en el proyecto |
| :--- | :--- | :--- |
| `typescript` | `~6.0.3` | Compilador y tipado estático de TypeScript. |
| `@types/react` | `~19.2.2` | Definición de tipos TypeScript para React. |

---

## 4. Utilidades en Raíz

| Archivo / Recurso | Dependencias | Propósito |
| :--- | :--- | :--- |
| `xx.js` | `docx` (`^9.1.1`) | Script para compilar documentos Word estructurados (`.docx`). |
| `supabase_schema.sql` | PostgreSQL / Supabase | Definición de tablas, relaciones y políticas RLS. |
| `poblar_catalogo.sql` | PostgreSQL / Supabase | Script para insertar datos iniciales en la base de datos. |

---

## 5. Instrucciones de Instalación y Puesta en Marcha

### Paso 1: Instalar dependencias del Dashboard Web
```bash
cd skip-sj-dashboard
npm install
```

### Paso 2: Instalar dependencias de la App Móvil
```bash
cd ../skip-sj-mobile
npm install
```

### Paso 3: Configurar variables de entorno
1. En `skip-sj-dashboard/.env`, verifica las credenciales de Supabase:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anon
   ```
2. En `skip-sj-mobile/.env` (o en su configuración):
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon
   ```

### Paso 4: Ejecutar en desarrollo

- **Para iniciar el Dashboard Web:**
  ```bash
  cd skip-sj-dashboard
  npm run dev
  ```
  Acceso local: `http://localhost:5173`

- **Para iniciar la App Móvil:**
  ```bash
  cd skip-sj-mobile
  npx expo start
  ```
  Escanea el código QR desde la app **Expo Go** en tu celular o presiona `a` para emulador Android o `w` para versión Web.
