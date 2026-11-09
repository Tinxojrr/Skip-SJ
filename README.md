# SKIP Duoc UC - Sistema de Gestion y Optimizacion de Pedidos Gastronomicos

## Informacion del Proyecto
- **Institucion:** Duoc UC - Sede San Joaquin
- **Escuela:** Informatica y Telecomunicaciones
- **Carrera:** Ingenieria en Informatica
- **Proyecto:** SKIP Duoc UC (Click & Collect Campus San Joaquin)
- **Version:** 2.0.0 (Release de Cierre - Fase 3)
- **Estado:** Finalizado y Homologado

---

## Descripcion General
SKIP Duoc UC es una solucion tecnologica integral disenada para resolver la congestion, los tiempos de espera criticos y las filas en los locales gastronomicos del Campus San Joaquin de Duoc UC (Casino Central, Castaño, Paradiso, Comedor Junaeb y Local -1). 

El sistema implementa una arquitectura desacoplada basada en el paradigma Backend as a Service (BaaS) sobre Supabase, vinculando dos aplicaciones clientes en tiempo real:
1. **Aplicacion Movil (Estudiantes):** Permite a los alumnos explorar la oferta gastronomica del campus, personalizar productos, pagar de forma anticipada mediante pasarelas sandbox oficiales y retirar su orden en meson dictando o escaneando un codigo unico alfanumerico de 4 caracteres.
2. **Terminal Web de Local (Cajero y Cocina):** Consola operativa en tiempo real que implementa un tablero Kanban para la gestion de estados de comanda (Por Preparar, En Cocina, Listo para Retiro), impresion de comandas termicas de 80mm e indicadores operativos (SLA, hora punta, desglose de recaudacion por pasarela).

---

## Estructura del Repositorio

El repositorio se encuentra estructurado en modulos independientes y carpetas de evidencia formal:

```text
skip-sj/
|-- evidencias/                               Documentacion formal del ciclo de vida del proyecto
|   |-- Fase 1/                               Definicion inicial y aprobacion de proyecto
|   |-- Fase 2/
|   |   `-- Evidencias Proyecto/              Especificaciones tecnicas y de gestion
|   |       |-- 01_PLAN_DE_PRUEBAS.docx       Estrategia de QA y Matriz de Trazabilidad RTM (100% requisitos)
|   |       |-- 02_CASOS_DE_PRUEBA.docx       Ejecucion detallada de casos de prueba CP-01 a CP-20
|   |       |-- 03_REGISTRO_DEFECTOS.docx     Control de incidencias por ciclos de prueba
|   |       |-- 04_MANUAL_USUARIO.docx        Guia de operacion para alumnos y administradores
|   |       |-- 05_MANUAL_IMPLEMENTACION.docx Guia tecnica de despliegue y puesta en marcha
|   |       |-- 06_CHECKLIST_TERMINO.docx     Verificacion de criterios de aceptacion de termino
|   |       |-- 8. Requisitos Funcionales.docx
|   |       |-- 10. Historias de Usuario.docx
|   |       |-- 14. Arquitectura Software.docx
|   |       `-- 16. Diagramas UML.docx
|   `-- Fase 3/
|       |-- Evidencias Grupales/              Autoevaluacion grupal y presentacion final PPTX
|       `-- Evidencias Individuales/          Diarios de reflexion individual de los integrantes
|
|-- skip-sj-dashboard/                        Terminal Web de Administracion y Cocina
|   |-- src/
|   |   |-- components/Layout/                Estructura de navegacion, barra lateral y telemetria
|   |   |-- context/                          Contexto global de autenticacion y estado de sesion
|   |   |-- features/
|   |   |   |-- auth/                         Formularios de inicio de sesion institucional
|   |   |   |-- dashboard/                    Metricas, graficos de venta y tablero Kanban de pedidos
|   |   |   |   |-- components/               Widgets de SLA, recaudacion, top productos y ticket termico
|   |   |   |   `-- kanban-pedidos.tsx        Gestion operativa de estados de cocina con WebSockets
|   |   |   |-- pedidos/                      Historial transversal de pedidos de la sede
|   |   |   `-- productos/                    Mantenedor de catalogo, precios y disponibilidad
|   |   `-- lib/                              Cliente de conexion a Supabase y asistentes de IA
|   |-- package.json                          Dependencias del frontend web
|   `-- vite.config.ts                        Configuracion de compilacion Vite
|
|-- skip-sj-mobile/                           Aplicacion Movil para Estudiantes
|   |-- src/
|   |   |-- app/
|   |   |   |-- (tabs)/                       Navegacion principal por pestanas (Inicio, Carrito, Perfil)
|   |   |   |-- auth.tsx                      Flujo de autenticacion de alumnos
|   |   |   |-- history.tsx                   Historial y seguimiento de pedidos en curso
|   |   |   `-- notifications.tsx             Bandeja de notificaciones y avisos institucionales
|   |   |-- components/
|   |   |   `-- GlobalOrderNotifications.tsx  Escuchador de eventos de cocina y alertas en tiempo real
|   |   |-- services/
|   |   |   `-- paymentGateway.ts             Integracion de pasarelas de pago Webpay Plus y BancoEstado
|   |   |-- store/                            Manejadores de estado global con Zustand (carrito, auth, tema)
|   |   `-- lib/supabase.ts                   Cliente Supabase con adaptador de almacenamiento seguro
|   |-- app.json                              Manifiesto de configuracion de Expo
|   `-- package.json                          Dependencias de la aplicacion movil
|
|-- .gitignore                                Exclusion de dependencias, artefactos de build y logs
`-- README.md                                 Documentacion tecnica principal del repositorio
```

---

## Arquitectura de Software

El sistema opera bajo un esquema desacoplado compuesto por cuatro capas:

### 1. Capa de Clientes (Frontend)
- **App Movil:** Desarrollada con **React Native** y el ecosistema **Expo** bajo TypeScript. Utiliza **NativeWind** para la maquetacion basada en Tailwind CSS y **Zustand** para la gestion reactiva de estado (autenticacion y carrito de compras multiproducto).
- **Consola Web:** Desarrollada con **React 19** y empaquetada mediante **Vite 8**. Utiliza **Tailwind CSS 4** para diseno responsivo con soporte de modo oscuro, **Lucide React** para iconografia tecnica y **Recharts** para graficos operativos de recaudacion y SLA de preparacion.

### 2. Capa Backend y Servicios (Supabase BaaS)
- **GoTrue Auth:** Proveedor de identidad que emite tokens JWT seguros, gestionando perfiles segun roles (`alumno`, `store_admin`, `super_admin`).
- **Realtime Engine:** Capa de publicacion/suscripcion basada en WebSockets conectada al Replication Log de PostgreSQL (`postgres_changes`), permitiendo que el tablero Kanban del casino reciba pedidos nuevos en menos de 500 milisegundos sin necesidad de sondeo continuo (polling).
- **Storage:** Almacenamiento distribuido (CDN) para imagenes de catalogo y logos de los locales del campus.

### 3. Capa de Persistencia y Seguridad (PostgreSQL 15)
- **Row Level Security (RLS):** Politicas de seguridad activas a nivel de fila que garantizan aislamiento estricto entre tiendas (*multitenancy*). Ningun locatario puede acceder a comandas o registros financieros de otro local de la sede.
- **Tipado Fuerte:** Tipos ENUM personalizados (`pedido_estado`, `user_role`, `metodo_pago_enum`, `transaccion_estado`) que garantizan la consistencia de datos.
- **Integridad y Rendimiento:** Indices B-Tree sobre llaves foraneas criticas (`pedidos.locatario_id`, `pedidos.usuario_id`, `pedido_items.pedido_id`).

### 4. Capa de Pagos e Integracion Bancaria (Modo Desarrollo / Sandbox)
- **Transbank Webpay Plus:** Integracion contra el ambiente oficial de pruebas (Sandbox de desarrolladores, codigo de comercio `597055555532`), soportando transacciones simuladas de debito Redcompra y credito bancario.
- **BancoEstado CuentaRUT:** Implementacion de pasarela directa sin comision POS mediante simulacion de autenticacion bancaria (Clave Pass / Transferencia directa).

---

## Requisitos de Entorno y Dependencias

Para la instalacion y ejecucion local del proyecto se requiere:
- **Node.js:** Version 20.x o superior LTS.
- **npm:** Version 10.x o superior.
- **Git:** Control de versiones.
- **Expo Go (Opcional para pruebas en hardware real):** Instalado en dispositivo movil Android o iOS, o emulador Android Studio / Simulador iOS configurado.
- **Navegador Web Moderno:** Google Chrome, Microsoft Edge o Mozilla Firefox con soporte para WebSockets.

---

## Guia de Instalacion y Ejecucion Local

### 1. Clonar el Repositorio
```bash
git clone https://github.com/<organizacion-o-usuario>/skip-sj.git
cd skip-sj
```

### 2. Configuracion del Terminal Web (Dashboard)
1. Navegar a la carpeta del dashboard e instalar dependencias:
   ```bash
   cd skip-sj-dashboard
   npm install
   ```
2. Verificar las variables de entorno en el archivo `.env`:
   ```env
   VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
   VITE_SUPABASE_ANON_KEY=<tu-anon-key>
   ```
3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   El dashboard estara disponible por defecto en: `http://localhost:5173/`

### 3. Configuracion de la Aplicacion Movil (Mobile)
1. Abrir una nueva terminal, navegar al directorio movil e instalar dependencias:
   ```bash
   cd skip-sj-mobile
   npm install
   ```
2. Verificar las variables de entorno en el archivo `.env`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
   ```
3. Iniciar el empaquetador Metro:
   ```bash
   npx expo start -c
   ```
4. Opciones de ejecucion:
   - Presionar `a` para abrir en emulador de Android.
   - Escanear el codigo QR generado en la terminal con la camara (iOS) o la aplicacion Expo Go (Android).
   - Presionar `w` para depuracion en navegador web.

---

## Cuentas de Acceso para Pruebas (Ambiente Sandbox)

| Rol de Usuario | Correo Institucional | Perfil y Alcance |
| :--- | :--- | :--- |
| **Alumno** | `mar.aburtom@duocuc.cl` | Exploracion de menu, realizacion de pedidos y consulta de QR de retiro |
| **Locatario (Achoclonado)** | `achoclonados@skipsj.cl` | Administracion de cocina de Achoclonado, tablero Kanban y cuadratura |
| **Locatario (Castaño)** | `castano@skipsj.cl` | Administracion y preparacion de pedidos para local Castaño |
| **Locatario (Comedor)** | `comedor@skipsj.cl` | Gestion de casino y atencion de colaciones Junaeb |
| **Locatario (Paradiso)** | `paradiso@skipsj.cl` | Gestion de pedidos para cafeteria Paradiso |
| **Locatario (Local -1)** | `local1@skipsj.cl` | Atencion de pedidos para punto de venta Local -1 |
| **Super Administrador** | `admin@skipsj.cl` | Metricas globales consolidadas de la sede San Joaquin y monitoreo multi-local |

---

## Verificacion y Ciclos de Pruebas

El software cuenta con un Plan de Pruebas formal que cubre el 100% de los Requisitos Funcionales comprometidos (`RF-01` a `RF-14`) respaldados en una Matriz de Trazabilidad de Requisitos (RTM).

Se ejecutaron 4 ciclos de aseguramiento de calidad:
- **Ciclo 1:** Autenticacion institucional, validacion de sesiones JWT y control de acceso RBAC.
- **Ciclo 2:** Catalogo dinamico, personalizacion de productos e inclusion de notas para cocina.
- **Ciclo 3:** Procesamiento de pagos sandbox (Transbank Webpay y BancoEstado) y generacion de codigo alfanumerico de retiro.
- **Ciclo 4:** Sincronizacion bidireccional en tiempo real entre cliente movil y tablero Kanban del meson, incluyendo alertas sonoras y modal de impresion termica.

Los resultados detallados de la ejecucion y los 20 casos de prueba (`CP-01` a `CP-20`) se encuentran documentados en `evidencias/Fase 2/Evidencias Proyecto/01_PLAN_DE_PRUEBAS.docx` y `02_CASOS_DE_PRUEBA.docx`.

---

## Licencia y Propiedad Intelectual
Proyecto desarrollado con fines academicos para la asignatura de Taller de Proyecto de Software (APT122), Escuela de Informatica y Telecomunicaciones, Duoc UC San Joaquin. Prohibida su reproduccion o distribucion comercial sin autorizacion previa del equipo autor y de la institucion.
