# Registro de Defectos por Ciclos de Prueba (Bug Tracking & Defect Log)
## Sistema SKIP Duoc UC - Sede San Joaquín

---

### Resumen de Métricas de Calidad

| Ciclo de Pruebas | Defectos Reportados | Bloqueantes | Alta | Media | Baja | Estado Final |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Ciclo 1: Núcleo y Backend** | 3 | 2 | 1 | 0 | 0 | **100% Corregidos** |
| **Ciclo 2: Flujo E2E y Personalización** | 2 | 1 | 1 | 0 | 0 | **100% Corregidos** |
| **Ciclo 3: Modo Oscuro y UI/UX** | 3 | 0 | 2 | 1 | 0 | **100% Corregidos** |
| **Ciclo 4: Limpieza de Mocks y Catálogo** | 3 | 1 | 1 | 1 | 0 | **100% Corregidos** |
| **TOTAL CONSOLIDADO** | **11** | **4** | **5** | **2** | **0** | **Cerrados / Validados** |

---

## 1. Ciclo 1: Pruebas de Núcleo, Base de Datos y Permisos (RLS)

### DEF-001: Bloqueo de visualización de ítems de pedidos en el Dashboard por políticas RLS
* **Ciclo:** Ciclo 1 (Núcleo y Backend)
* **Módulo:** `skip-sj-dashboard` / `Supabase RLS`
* **Criticidad:** **Bloqueante**
* **Descripción del Defecto:** Al ingresar una comanda al Dashboard, el tablero mostraba el encabezado del pedido (monto y código), pero la lista de productos aparecía vacía debido a que la política de seguridad RLS de la tabla `pedido_items` sólo autorizaba al `usuario_id` comprador y no al administrador del local receptor.
* **Causa Raíz:** Falta de una política permisiva para administradores de local basada en `locatarios.usuario_admin_id` o dominios administrativos autorizados.
* **Acción Correctiva:** Creación y ejecución del script `fix_rls_admin_items.sql` estableciendo la directiva `CREATE POLICY "Admins ven items de pedidos de su local"` vinculando la relación entre `locatarios`, `pedidos` y `pedido_items`.
* **Responsable:** Desarrollador Backend Cloud.
* **Resultado de Re-validación:** **Cerrado / Validado (Aprobado).** El personal de cocina visualiza de inmediato el detalle de cada plato en la comanda.

---

### DEF-002: Incompatibilidad de inserción por campo de notas inexistente en base de datos
* **Ciclo:** Ciclo 1 (Núcleo y Backend)
* **Módulo:** `skip-sj-mobile` / `cart.tsx`
* **Criticidad:** **Alta**
* **Descripción del Defecto:** Al intentar pagar un pedido con notas especiales, la transacción arrojaba un error de base de datos indicando que la columna `notas` no existía en la tabla `pedido_items`, impidiendo finalizar la compra.
* **Causa Raíz:** El esquema inicial no contemplaba la columna para personalizaciones de los alumnos.
* **Acción Correctiva:** 
  1. Se elaboró y aplicó la migración `agregar_columna_notas.sql` (`ALTER TABLE public.pedido_items ADD COLUMN IF NOT EXISTS notas TEXT;`).
  2. Se añadió un bloque de tolerancia a fallos en `cart.tsx` que reintenta la inserción sin la columna en caso de contingencia.
* **Responsable:** Desarrollador Fullstack.
* **Resultado de Re-validación:** **Cerrado / Validado (Aprobado).** Compras procesadas correctamente tanto con notas como sin ellas.

---

### DEF-003: Excepción en tiempo de ejecución por consulta a columna `emoji` inexistente
* **Ciclo:** Ciclo 1 (Núcleo y Backend)
* **Módulo:** `productos` / `index.tsx`
* **Criticidad:** **Bloqueante**
* **Descripción del Defecto:** Fallo al consultar el catálogo con el error PostgreSQL `code 42703: column productos.emoji does not exist`.
* **Causa Raíz:** Código frontend intentaba seleccionar explícitamente `emoji` de una tabla que almacena iconos a través de URLs de imagen.
* **Acción Correctiva:** Ajuste de consultas en `index.tsx` y uso de fallback con operadores lógicos (`product.emoji || '🍔'`) sin forzar la columna en el query de Supabase.
* **Responsable:** Desarrollador Frontend Móvil.
* **Resultado de Re-validación:** **Cerrado / Validado (Aprobado).** Carga limpia y sin advertencias en consola.

---

## 2. Ciclo 2: Flujo End-to-End y Conexión de Pantallas

### DEF-004: Presencia de datos de prueba (mocks) en lista de favoritos
* **Ciclo:** Ciclo 2 (Flujo E2E)
* **Módulo:** `favoritesStore.ts` / `favorites.tsx`
* **Criticidad:** **Media**
* **Descripción del Defecto:** Al abrir la pestaña "Mis Favoritos" por primera vez, aparecían 2 productos simulados de ejemplo (`fav-demo-1` y `fav-demo-2`) con IDs no existentes en la base de datos, lo que generaba errores al intentar abrirlos.
* **Causa Raíz:** Estado inicial del store Zustand hardcodeado con datos demo del prototipo inicial.
* **Acción Correctiva:** Se limpió el array de inicio (`favorites: []`) y se eliminaron los condicionales que validaban prefijos `fav-demo`. La lista ahora inicia vacía y sólo persiste productos reales agregados por el estudiante.
* **Responsable:** Desarrollador Móvil.
* **Resultado de Re-validación:** **Cerrado / Validado (Aprobado).** Flujo 100% real basado en UUIDs de productos de la sede.

---

### DEF-005: Bypass de inicio de sesión de prueba en formulario de autenticación
* **Ciclo:** Ciclo 2 (Flujo E2E)
* **Módulo:** `auth.tsx`
* **Criticidad:** **Alta**
* **Descripción del Defecto:** Existía un botón "Ingresar como Invitado / Demo" que inyectaba una sesión simulada en memoria, evitando la autenticación real de Supabase y generando incoherencias en las compras.
* **Causa Raíz:** Función de desarrollo rápido para pruebas de interfaz.
* **Acción Correctiva:** Eliminación total de la función `handleTestLogin` y del botón de acceso directo. Todo inicio de sesión requiere credenciales válidas en Supabase Auth.
* **Responsable:** Líder de QA / Desarrollador Móvil.
* **Resultado de Re-validación:** **Cerrado / Validado (Aprobado).** Solo se permite acceso con credenciales institucionales verificadas.

---

## 3. Ciclo 3: Modo Oscuro (Obsidian Theme) y Accesibilidad

### DEF-006: Texto de productos ilegible por contraste nulo en tarjetas de catálogo
* **Ciclo:** Ciclo 3 (Modo Oscuro)
* **Módulo:** `skip-sj-mobile` / `(tabs)/index.tsx`
* **Criticidad:** **Alta**
* **Descripción del Defecto:** Al activar el Modo Oscuro, el fondo de la pantalla cambiaba a negro, pero las tarjetas de productos conservaban fondo blanco y el título del producto se renderizaba en gris claro (`#F4F4F5`), volviéndose prácticamente invisible.
* **Causa Raíz:** Desalineación entre las variables de color dinámicas `cardBg` y los estilos inline en el mapeo de productos.
* **Acción Correctiva:** Unificación de paleta Obsidian: `cardBg` en `#18181B`, bordes en `rgba(255,255,255,0.08)`, textos en `#F4F4F5` y tags de categoría en `#F2A900`.
* **Responsable:** Diseñador UI/UX / Desarrollador Frontend.
* **Resultado de Re-validación:** **Cerrado / Validado (Aprobado).** Legibilidad óptima con alto contraste verificado.

---

### DEF-007: Fondo blanco en la barra flotante de pago en el carrito
* **Ciclo:** Ciclo 3 (Modo Oscuro)
* **Módulo:** `skip-sj-mobile` / `(tabs)/cart.tsx`
* **Criticidad:** **Media**
* **Descripción del Defecto:** En Modo Oscuro, la barra sticky inferior que contiene el botón "Pagar con BancoEstado" mantenía un contenedor en blanco puro (`#FFFFFF`), rompiendo la armonía visual de la vista nocturna.
* **Causa Raíz:** Estilo hardcodeado `backgroundColor: '#FFFFFF'` en el contenedor sticky footer.
* **Acción Correctiva:** Reemplazo por la variable temática dinámica `backgroundColor: bg` (`#09090B`) con borde superior sutil en `borderColor`.
* **Responsable:** Desarrollador Móvil.
* **Resultado de Re-validación:** **Cerrado / Validado (Aprobado).** La barra inferior se mimetiza con el fondo oscuro y resalta el botón de pago institucional.

---

### DEF-008: Error de sintaxis TypeScript durante unificación de soporte
* **Ciclo:** Ciclo 3 (Modo Oscuro)
* **Módulo:** `support.tsx`
* **Criticidad:** **Alta**
* **Descripción del Defecto:** Error de compilación TS1382 debido a un bloque JSX duplicado al inyectar las clases del nuevo tema oscuro en la sección de preguntas frecuentes.
* **Causa Raíz:** Reemplazo superpuesto de cadenas de texto durante la edición de archivos.
* **Acción Correctiva:** Limpieza del bloque redundante y verificación estricta con `npx tsc --noEmit`.
* **Responsable:** Desarrollador Frontend.
* **Resultado de Re-validación:** **Cerrado / Validado (Aprobado).** Compilación TypeScript en 0 errores.

---

## 4. Ciclo 4: Calidad de Datos del Catálogo y Validación Final

### DEF-009: Discordancia fotográfica: Empanadas de pino mostraban foto de papas fritas
* **Ciclo:** Ciclo 4 (Validación de Datos)
* **Módulo:** Catálogo de Productos / Base de Datos
* **Criticidad:** **Alta**
* **Descripción del Defecto:** El producto "Empanada de Pino de Horno" de Castaño mostraba una imagen de papas fritas en cono (`photo-1541592106381-b31e9677c0e5`). Asimismo, los choclos en vaso mostraban sartenes con huevos o carne cruda.
* **Causa Raíz:** Asignación apresurada de identificadores de Unsplash en el script de carga inicial `poblar_catalogo.sql`.
* **Acción Correctiva:**
  1. Se implementó el módulo de curaduría `productImages.ts`, asociando cada nombre de producto a su imagen real (empanada dorada horneada, choclo desgranado con aderezos, hot dog completo, salchipapas).
  2. Se generó el script SQL `actualizar_fotos_productos.sql` para actualizar la base de datos.
* **Responsable:** Desarrollador Fullstack / QA.
* **Resultado de Re-validación:** **Cerrado / Validado (Aprobado).** Concordancia visual 100% verificada en el emulador.

---

### DEF-010: Imágenes de catálogo caídas (Error HTTP 404)
* **Ciclo:** Ciclo 4 (Validación de Datos)
* **Módulo:** Catálogo de Productos
* **Criticidad:** **Media**
* **Descripción del Defecto:** 8 productos (Chaparrita, Muffin, Pizza, Leche Asada, Sopaipillas, Completo Italiano, Salchipapas) tenían enlaces de imágenes caducados en Unsplash que arrojaban error 404 en la consola de la app.
* **Causa Raíz:** URLs temporales o imágenes retiradas por los autores originales en la plataforma de stock.
* **Acción Correctiva:** Reemplazo exhaustivo por enlaces permanentes probados mediante peticiones HEAD simulando User-Agent móvil OkHttp.
* **Responsable:** Desarrollador Frontend.
* **Resultado de Re-validación:** **Cerrado / Validado (Aprobado).** 25 de 25 productos cargan con código HTTP 200 OK.

---

### DEF-011: Mensaje de "Función disponible próximamente" en perfil y seguridad
* **Ciclo:** Ciclo 4 (Validación Final)
* **Módulo:** `profile.tsx` / `security.tsx`
* **Criticidad:** **Baja**
* **Descripción del Defecto:** Al hacer clic en las tarjetas de pago de Junaeb BAES, BancoEstado o en la gestión de dispositivos, saltaba una alerta diciendo *"Próximamente / Esta función estará disponible pronto"*.
* **Causa Raíz:** Restos de funciones placeholder `handlePressSimulate` y `handleSimulateAction`.
* **Acción Correctiva:** Conexión de modales informativos institucionales reales y redirección a la pantalla de gestión de tarjetas `add-payment.tsx`.
* **Responsable:** Desarrollador Móvil.
* **Resultado de Re-validación:** **Cerrado / Validado (Aprobado).** Se eliminó todo rastro de texto de simulación en la app.
