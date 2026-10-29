# Matriz Detallada de Casos de Prueba (Test Cases Specification)
## Sistema SKIP Duoc UC - Sede San Joaquín

---

### Resumen Ejecutivo de Ejecución

| Total Casos | Aprobados (Pass) | Fallidos (Fail) | Bloqueados | Cobertura Funcional |
| :---: | :---: | :---: | :---: | :---: |
| **16** | **16 (100%)** | **0 (0%)** | **0** | **100% de Requerimientos** |

---

## 1. Módulo: Autenticación y Perfil de Usuario

### CP-AUTH-001: Inicio de Sesión con Correo Institucional Válido
* **Objetivo:** Verificar que un estudiante pueda ingresar al sistema con su correo `@duocuc.cl` y contraseña registradas.
* **Precondiciones:** Cuenta creada y confirmada en Supabase Auth; conexión a internet activa.
* **Pasos de Ejecución:**
  1. Abrir la aplicación móvil SKIP SJ.
  2. En el formulario de acceso, ingresar el correo institucional.
  3. Ingresar la contraseña correspondiente.
  4. Presionar el botón "Ingresar a mi cuenta".
* **Datos de Entrada:** Email: `alumno.duoc@duocuc.cl` / Contraseña: `Password123!`
* **Resultado Esperado:** Autenticación exitosa, almacenamiento de tokens JWT en el dispositivo y redirección inmediata a la pantalla principal (Inicio).
* **Resultado Obtenido:** El usuario ingresa de forma fluida a la pantalla de inicio con su nombre institucional cargado.
* **Estado:** **Aprobado**

---

### CP-AUTH-002: Rechazo de Correo No Institucional
* **Objetivo:** Comprobar que el sistema rechace dominios externos (ej. `@gmail.com`, `@hotmail.com`) garantizando exclusividad para la comunidad Duoc UC.
* **Precondiciones:** Pantalla de autenticación visible.
* **Pasos de Ejecución:**
  1. Ingresar un correo personal estándar.
  2. Ingresar una contraseña de 6+ caracteres.
  3. Presionar "Ingresar".
* **Datos de Entrada:** Email: `usuario.comun@gmail.com`
* **Resultado Esperado:** Mensaje de error visible en pantalla: *"Debe ser un correo institucional (@duocuc.cl)"* y bloqueo del envío.
* **Resultado Obtenido:** Validación interceptada en cliente con texto en rojo indicando la restricción institucional.
* **Estado:** **Aprobado**

---

### CP-AUTH-003: Restablecimiento Real de Contraseña Institucional
* **Objetivo:** Comprobar que la opción "Cambiar contraseña" en la sección de Seguridad despache un enlace real al correo del estudiante.
* **Precondiciones:** Usuario con sesión iniciada en la app móvil.
* **Pasos de Ejecución:**
  1. Navegar a la pestaña "Perfil" (`/profile`).
  2. Seleccionar la opción "Seguridad" (`/security`).
  3. Tocar "Cambiar contraseña".
  4. Confirmar en el diálogo de alerta el envío del enlace.
* **Datos de Entrada:** Sesión del usuario autenticado actual.
* **Resultado Esperado:** Disparo de `supabase.auth.resetPasswordForEmail`, alerta de confirmación en la app y recepción del email en bandeja de entrada.
* **Resultado Obtenido:** Alerta desplegada: *"Revisa tu bandeja de entrada en tu correo Duoc UC para continuar"*. Correo recibido exitosamente.
* **Estado:** **Aprobado**

---

## 2. Módulo: Catálogo, Locales y Productos

### CP-CAT-001: Filtrado Dinámico por Locales de la Sede
* **Objetivo:** Verificar que el selector horizontal de locales filtre los productos correspondientes a la tienda seleccionada.
* **Precondiciones:** Base de datos con locales activos (`Achoclonado`, `Castaño`, `Comedor`, `Paradiso`, `Local -1`).
* **Pasos de Ejecución:**
  1. En la pantalla de inicio, visualizar la lista con selector "Todos".
  2. Presionar el botón del local "Castaño".
  3. Verificar los ítems listados.
* **Datos de Entrada:** Clic en botón "Castaño".
* **Resultado Esperado:** La lista muestra exclusivamente productos de Castaño (empanadas, chaparritas, café, bollería).
* **Resultado Obtenido:** El catálogo se filtra al instante sin recarga completa de página.
* **Estado:** **Aprobado**

---

### CP-CAT-002: Concordancia Fotográfica y Enlaces Activos
* **Objetivo:** Verificar que cada producto exhiba su fotografía correspondiente (empanadas con masa dorada, choclos con granos de maíz, bebidas con su respectiva lata).
* **Precondiciones:** Módulo `productImages.ts` integrado.
* **Pasos de Ejecución:**
  1. Navegar por el feed general de productos.
  2. Inspeccionar la foto de "Empanada de Pino de Horno".
  3. Inspeccionar la foto de "Choclo Mediano Tradicional".
  4. Inspeccionar la foto de "Completo Italiano" y "Salchipapas".
* **Datos de Entrada:** Exploración visual del catálogo.
* **Resultado Esperado:** Ninguna foto rota (404), ninguna foto errónea (sin papas fritas en empanadas ni bifes crudos en choclos).
* **Resultado Obtenido:** 100% de las imágenes cargan con alta resolución y concordancia exacta con la descripción del plato.
* **Estado:** **Aprobado**

---

### CP-CAT-003: Personalización de Producto con Notas Especiales
* **Objetivo:** Verificar que el estudiante pueda agregar instrucciones de cocina al pedir un producto.
* **Precondiciones:** Navegar al detalle de un producto (`/product/[id]`).
* **Pasos de Ejecución:**
  1. Abrir la ficha de "Empanada de Pino de Horno".
  2. En el campo de texto "Instrucciones especiales", escribir una preferencia.
  3. Presionar "Agregar al Carrito".
* **Datos de Entrada:** Texto: *"Bien caliente, por favor"*
* **Resultado Esperado:** El ítem se agrega al store del carrito conservando la nota asignada.
* **Resultado Obtenido:** El carrito recibe el producto con su nota; se muestra el resumen en la vista de pedido.
* **Estado:** **Aprobado**

---

## 3. Módulo: Favoritos y Persistencia

### CP-FAV-001: Marcado y Desmarcado Interactivo con Ícono de Corazón
* **Objetivo:** Comprobar que el botón de corazón cambie de estado visual y actualice la lista de favoritos en tiempo real.
* **Precondiciones:** Usuario en pantalla de inicio o en ficha de producto.
* **Pasos de Ejecución:**
  1. Presionar el ícono de corazón sobre un producto no marcado.
  2. Verificar que se llene de color rojo (`#EF4444`).
  3. Navegar a la pantalla "Mis Favoritos" (`/favorites`).
  4. Verificar la presencia del producto.
  5. Desmarcar el producto tocando nuevamente el corazón.
* **Datos de Entrada:** Producto: `Choclo Vegetariano Champiñón`.
* **Resultado Esperado:** El producto se agrega a la lista de favoritos de forma reactiva y desaparece al ser desmarcado.
* **Resultado Obtenido:** Estado sincronizado inmediatamente mediante `favoritesStore.ts`.
* **Estado:** **Aprobado**

---

## 4. Módulo: Carrito, Checkout y Pagos

### CP-CHK-001: Validación de Pedido y Desglose de Totales
* **Objetivo:** Verificar que el carrito calcule correctamente el subtotal, el cargo de servicio institucional ($300) y el total general en CLP.
* **Precondiciones:** Al menos un producto agregado al carrito.
* **Pasos de Ejecución:**
  1. Abrir la pestaña "Carrito" (`/cart`).
  2. Aumentar la cantidad del producto a 2 unidades.
  3. Observar la sección "Resumen".
* **Datos de Entrada:** 2x Empanada de Pino ($2.400 c/u = $4.800).
* **Resultado Esperado:** Subtotal: $4.800 / Cargo por servicio: $300 / Total a pagar: $5.100.
* **Resultado Obtenido:** Cálculo exacto y formateado en moneda local `$5.100`.
* **Estado:** **Aprobado**

---

### CP-CHK-002: Ejecución de Compra con Open Banking y Generación de Código
* **Objetivo:** Simular la autorización bancaria, crear el registro del pedido en Supabase e informar el código nemotécnico de retiro.
* **Precondiciones:** Usuario autenticado con carrito activo.
* **Pasos de Ejecución:**
  1. Presionar el botón "Pagar con BancoEstado".
  2. Esperar el procesamiento bancario (1.3 s).
  3. Observar el modal de comprobante de compra exitosa.
* **Datos de Entrada:** Pago autorizado mediante BancoEstado CuentaRUT.
* **Resultado Esperado:** Inserción en tabla `pedidos` (estado: `pagado`), inserción en `pedido_items` con sus notas, y generación de código de 4 caracteres (ej. `K9X2`).
* **Resultado Obtenido:** Pedido insertado en base de datos; código visible en pantalla y carrito vaciado automáticamente.
* **Estado:** **Aprobado**

---

## 5. Módulo: Dashboard Kanban en Tiempo Real (Cocina / Locatario)

### CP-DASH-001: Recepción de Nueva Comanda por WebSockets y Alerta Sonora
* **Objetivo:** Verificar que un nuevo pedido pagado desde la app móvil ingrese de inmediato a la columna "Pendiente" del dashboard web sin recargar la página.
* **Precondiciones:** Dashboard abierto en el navegador (`http://localhost:5173/ordering/kanban`) con el local correspondiente seleccionado.
* **Pasos de Ejecución:**
  1. Realizar una compra desde la app móvil.
  2. Observar la pantalla del Dashboard de cocina.
* **Datos de Entrada:** Pedido emitido desde móvil para el local "Castaño".
* **Resultado Esperado:** La tarjeta aparece en la columna "Pendiente" en < 500 ms, acompañada por el sonido de campanilla (*chime sound*).
* **Resultado Obtenido:** Tarjeta recibida instantáneamente; audio reproducido y contador actualizado.
* **Estado:** **Aprobado**

---

### CP-DASH-002: Visualización de Notas Especiales en la Comanda
* **Objetivo:** Comprobar que las notas ingresadas por el alumno sean claramente visibles para los operarios de cocina.
* **Precondiciones:** Pedido creado con la nota *"Sin mayonesa, bien tostado"*.
* **Pasos de Ejecución:**
  1. Localizar la comanda en la columna de pedidos del Kanban.
  2. Verificar la sección de notas de los ítems.
* **Datos de Entrada:** Comanda con notas de preparación.
* **Resultado Esperado:** Caja destacada en color ámbar/dorado con ícono de comentario mostrando el texto exacto ingresado por el alumno.
* **Resultado Obtenido:** Visualización nítida y destacada bajo el nombre del producto.
* **Estado:** **Aprobado**

---

### CP-DASH-003: Transición de Estados del Pedido y Notificación al Alumno
* **Objetivo:** Verificar que al avanzar el pedido a "Listo en Mesón", el estudiante reciba la actualización en tiempo real en su teléfono.
* **Precondiciones:** Pedido visible en el Dashboard y alumno observando su pantalla de inicio o historial.
* **Pasos de Ejecución:**
  1. En el Dashboard, presionar el botón "Pasar a Preparación".
  2. Luego, presionar "Listo para Retiro".
  3. Observar la tarjeta flotante de pedido activo en la app del estudiante.
* **Datos de Entrada:** Clics en botones de estado en el Kanban.
* **Resultado Esperado:** El estado cambia a *"Listo para retirar"* en la app móvil del alumno con el banner verde de retiro.
* **Resultado Obtenido:** Sincronización bidireccional exitosa vía canales Realtime de Supabase.
* **Estado:** **Aprobado**

---

## 6. Módulo: Copiloto Asesor con IA (Gemini 3 Flash)

### CP-IA-001: Generación de Diagnóstico Gastronómico y Recomendaciones
* **Objetivo:** Verificar que el Copiloto IA evalúe las ventas del turno y emita diagnósticos en formato Bento Card.
* **Precondiciones:** Pedidos registrados en la jornada; API Key de Gemini configurada.
* **Pasos de Ejecución:**
  1. En el Dashboard, navegar a la sección de analítica / Copiloto IA.
  2. Presionar el botón "Generar Diagnóstico de Turno".
* **Datos de Entrada:** Métricas de ventas y tiempos de cocina del local.
* **Resultado Esperado:** Respuesta generada en menos de 3 segundos con análisis de ritmo de cocina, alerta de cuellos de botella y sugerencia de combos.
* **Resultado Obtenido:** Diagnóstico desplegado con tarjetas estilizadas y cálculos de impacto de facturación.
* **Estado:** **Aprobado**

---

## 7. Módulo: Modo Oscuro (Obsidian Dark Mode)

### CP-UX-001: Conmutación Dinámica de Tema y Contraste Visual
* **Objetivo:** Comprobar que el conmutador de Modo Oscuro en "Mi Cuenta" invierta los colores globales de forma consistente sin alterar la legibilidad.
* **Precondiciones:** Aplicación abierta en cualquier pantalla.
* **Pasos de Ejecución:**
  1. Ir a la pestaña "Perfil" (`/profile`).
  2. Activar el switch "Modo Oscuro".
  3. Navegar por Inicio, Carrito, Historial, Favoritos y Soporte.
* **Datos de Entrada:** Toggle switch en perfil.
* **Resultado Esperado:** Fondo `#09090B`, tarjetas `#18181B`, textos nítidos `#F4F4F5`, acentos dorados `#F2A900`, e íconos del sistema (batería, reloj) adaptados automáticamente.
* **Resultado Obtenido:** Contraste perfecto en todas las pantallas sin parpadeos ni textos ilegibles.
* **Estado:** **Aprobado**

---

## 8. Módulo: Control de Stock y Disponibilidad en Vivo

### CP-STK-001: Desactivación Inmediata de Producto Agotado
* **Objetivo:** Verificar que al pausar un producto en el dashboard, este desaparezca inmediatamente de la oferta en la app móvil.
* **Precondiciones:** Producto "Porción de Nachos con Queso" disponible.
* **Pasos de Ejecución:**
  1. En el Dashboard, ir a la sección "Productos" (`/products`).
  2. Cambiar el interruptor de "Disponible" a "Agotado" para los Nachos.
  3. Actualizar la app móvil.
* **Datos de Entrada:** Switch de disponibilidad en Dashboard.
* **Resultado Esperado:** El producto no se muestra en el catálogo de los estudiantes, evitando ventas de productos sin inventario en cocina.
* **Resultado Obtenido:** Producto retirado al instante del listado de la app.
* **Estado:** **Aprobado**

