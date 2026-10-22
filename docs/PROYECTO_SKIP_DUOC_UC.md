# Documento de Proyecto: SKIP Duoc UC
**Plataforma Omnicanal de Click & Collect y Gestión Gastronómica Inteligente con IA**  
*Sede Piloto: Duoc UC Sede San Joaquín*

---

## 1. Resumen Ejecutivo y Planteamiento del Negocio

### 1.1. Contexto y Problemática
En los recreos y bloques de almuerzo (especialmente entre las 12:30 y 14:00 hrs), los casinos y locales gastronómicos de Duoc UC Sede San Joaquín (*Achoclonados, Castaño, Cafetería Paradiso, Comedor Central*) experimentan altos niveles de congestión.

* **Impacto en los Estudiantes:** Pérdida de 15 a 25 minutos de su recreo haciendo filas solo para ordenar y pagar, reduciendo su tiempo efectivo de descanso, alimentación y llegando tarde a clases.
* **Impacto en los Locatarios:** Pérdida de ventas por filas disuasivas, saturación de los cajeros en horarios pico, descoordinación entre caja y cocina, y falta de herramientas analíticas para prever la demanda de insumos.

### 1.2. Solución Propuesta: SKIP Duoc UC
Un ecosistema tecnológico integral que digitaliza y agiliza el flujo de compras dentro del campus mediante tres componentes interconectados:
1. **App Móvil de Estudiantes:** Permite explorar la oferta de los locales de la sede, ordenar y pagar de forma anticipada (*Click & Collect*), y retirar sin filas mostrando un código alfanumérico único de 4 caracteres.
2. **Dashboard Operativo para Locales:** Terminal web táctil en cocina con tablero Kanban en tiempo real sincronizado por WebSockets, alertas auditivas (*chime bell*), control de stock/menú y reportes históricos.
3. **Copiloto Asesor con Inteligencia Artificial (Gemini 3 Flash):** Módulo de analítica gastronómica que diagnostica cuellos de botella en mesón, evalúa ritmos de cocina y sugiere combos o promociones (*upselling*) para maximizar el ticket promedio del local.

---

## 2. Registro de Stakeholders

| Nombre / Grupo de Interés | Rol en el Proyecto | Nivel de Interés | Nivel de Influencia | Expectativas Clave | Estrategia de Involucramiento |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Estudiantes de Duoc UC (Sede San Joaquín)** | Usuarios Finales (Consumidores) | **Alto** | **Alto** | Pedir comida rápido desde su teléfono, pagar sin fricción, saber el tiempo estimado de retiro y evitar filas en su recreo. | **Gestionar de cerca:** Pruebas beta cerradas con alumnos de diversas carreras, encuestas de experiencia de usuario (UX) y retroalimentación iterativa. |
| **Locatarios y Concesionarios de Comida** *(Achoclonados, Castaño, Paradiso, etc.)* | Clientes Comerciales y Operadores | **Alto** | **Alto** | Que la plataforma no entorpezca su operación en hora punta, aumente su facturación, ordene la comanda en cocina y despeje el mesón. | **Gestionar de cerca / Alianza estratégica:** Capacitación en uso del Dashboard Kanban, adaptación a sus flujos de despacho y soporte técnico directo. |
| **Cajeros y Personal de Cocina** | Operadores Directos del Dashboard | **Medio** | **Medio** | Sistema ágil y simple (operable con un toque), alertas sonoras claras de nuevas comandas y validación rápida de entregas. | **Mantener satisfecho / Capacitar:** Interfaz minimalista de alta legibilidad, botones de estado con un solo clic y código de retiro corto. |
| **Dirección de Sede / Servicios Estudiantiles Duoc UC** | Patrocinador Institucional / Autoridad del Campus | **Medio** | **Alto** | Mejorar la convivencia estudiantil, descongestionar los espacios comunes, promover hábitos de orden y proyectar innovación en la sede. | **Mantener satisfecho:** Informes periódicos de métricas de impacto, volumen de pedidos procesados y alineación con la imagen institucional. |
| **Docente Guía / Comisión Evaluadora** | Evaluadores Académicos | **Alto** | **Alto** | Rigor metodológico, arquitectura de software limpia y escalable, seguridad de datos (RLS) y cumplimiento de los entregables del curso. | **Gestionar de cerca:** Demostraciones en vivo end-to-end, trazabilidad en control de versiones (Git) y documentación técnica formal. |
| **Equipo de Desarrollo del Proyecto** | Diseñadores y Desarrolladores | **Alto** | **Alto** | Implementar una arquitectura moderna, segura, mantenible y con valor tecnológico diferencial (IA generativa en tiempo real). | **Liderar:** Planificación por fases, pruebas continuas, control de calidad y refactorización orientada a buenas prácticas. |
| **Proveedores Cloud Externos** *(Supabase, Google Cloud / Gemini, Expo)* | Socios de Infraestructura y Servicios | **Bajo** | **Medio** | Alta disponibilidad de APIs, consumo dentro de cuotas gratuitas/pro y cumplimiento de normativas de seguridad de API. | **Monitorear:** Gestión segura de variables de entorno, optimización de payloads y monitoreo de cuotas en backend. |

### Matriz de Priorización (Poder vs. Interés)
* **Gestionar de Cerca (Alto Poder / Alto Interés):** Estudiantes, Locatarios de Sede, Comisión Evaluadora.
* **Mantener Satisfecho (Alto Poder / Interés Moderado):** Dirección de Sede San Joaquín.
* **Mantener Informado (Poder Moderado / Alto Interés):** Personal operativo de cocina y cajeros.
* **Monitorear (Poder Moderado / Bajo Interés):** Proveedores de servicios Cloud e infraestructura.

---

## 3. Arquitectura y Stack Tecnológico

* **Frontend Web (Dashboard Locatario):**
  * React 19 + TypeScript + Vite.
  * Tailwind CSS v4 con paleta "Obsidian & Zinc" de alto contraste.
  * Lucide Icons, Recharts (gráficos de ingresos y flujo).
* **Frontend Móvil (App Estudiante):**
  * React Native con Expo SDK.
  * TypeScript, Expo Router, Lucide Icons.
* **Backend y Base de Datos (BaaS):**
  * Supabase (PostgreSQL 15).
  * WebSockets para Supabase Realtime (sincronización instantánea de estados de pedidos).
  * *Row Level Security (RLS)* para aislamiento de permisos por rol (`store_admin`, `super_admin`, `cliente`).
* **Inteligencia Artificial Generativa:**
  * Google GenAI SDK con modelo neuronal `gemini-3-flash-preview`.
  * Generación de respuestas JSON estructuradas (Bento Layout).
  * Motor analítico local de fallback para tolerancia a fallos offline.

---

## 4. Módulos y Funcionalidades Clave Implementadas

1. **Flujo E2E de Pedidos (End-to-End):**
   * Creación de pedidos en la App Móvil con desglose de productos y total en CLP.
   * Recepción instantánea en el Dashboard Kanban con sonido de campanilla (*Web Audio chime*).
   * Transición de estados: `Pagado (Cola)` ➔ `En Cocina` ➔ `Listo en Mesón` ➔ `Completado`.
2. **Código de Retiro Seguro de 4 Caracteres (ej. `B3MR`):**
   * Sustituye los largos UUIDs de base de datos por un identificador nemotécnico fácil de pronunciar por el alumno y validar por el cajero.
3. **Gestión de Menú en Vivo:**
   * Interruptores en tiempo real para activar o pausar disponibilidad de productos cuando se agota un ingrediente en cocina.
4. **Copiloto Asesor IA:**
   * Diagnóstico en tarjetas Bento: Ritmo de cocina, alerta de cuello de botella en mesón, producto de mayor rotación y sugerencias de combos de upselling con impacto monetario proyectado.

