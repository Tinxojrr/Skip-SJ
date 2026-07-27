-- ==========================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS (Supabase)
-- Proyecto: Skip SJ (Esquema Completo v2)
-- ==========================================

-- 1. ENUMS (Tipos Personalizados)
CREATE TYPE user_role AS ENUM ('student', 'store_admin', 'super_admin');
CREATE TYPE locatario_tipo AS ENUM ('casino', 'foodtruck', 'kiosco');
CREATE TYPE pedido_estado AS ENUM ('pendiente_pago', 'pagado', 'en_preparacion', 'listo_retiro', 'completado', 'cancelado');
CREATE TYPE metodo_pago_enum AS ENUM ('mercadopago', 'junaeb', 'otro');
CREATE TYPE transaccion_estado AS ENUM ('aprobada', 'rechazada', 'pendiente');

-- 2. USUARIOS (Conectado a auth.users de Supabase)
CREATE TABLE usuarios (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    rut VARCHAR(12),
    p_nombre VARCHAR(50),
    s_nombre VARCHAR(50),
    apellido_p VARCHAR(50),
    apellido_m VARCHAR(50),
    email VARCHAR(255) UNIQUE NOT NULL,
    rol user_role DEFAULT 'student'::user_role,
    push_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. LOCATARIOS
CREATE TABLE locatarios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo locatario_tipo NOT NULL,
    usuario_admin_id UUID REFERENCES usuarios(id) ON DELETE SET NULL, -- FK a usuarios
    activo BOOLEAN DEFAULT true, -- Corregido a boolean
    capacidad_max_hora INT NOT NULL DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. FRANJAS HORARIAS
CREATE TABLE franjas_horarias (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    locatario_id UUID REFERENCES locatarios(id) ON DELETE CASCADE,
    hora_inicio TIME NOT NULL, -- Corregido a TIME
    hora_fin TIME NOT NULL,    -- Corregido a TIME
    capacidad_pedidos INT NOT NULL
);

-- 5. CATEGORÍAS MENÚ
CREATE TABLE categorias_menu (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    locatario_id UUID REFERENCES locatarios(id) ON DELETE CASCADE,
    nombre VARCHAR(50) NOT NULL,
    orden INT DEFAULT 0
);

-- 6. PRODUCTOS
CREATE TABLE productos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    locatario_id UUID REFERENCES locatarios(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES categorias_menu(id) ON DELETE SET NULL,
    nombre_producto VARCHAR(150) NOT NULL,
    descripcion VARCHAR(255),
    precio INT NOT NULL, -- Corregido a INT (CLP)
    imagen_url VARCHAR(500),
    disponible BOOLEAN DEFAULT true, -- Corregido a boolean
    stock_diario INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. MENU DEL DÍA
CREATE TABLE menu_del_dia (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
    locatario_id UUID REFERENCES locatarios(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    disponible BOOLEAN DEFAULT true, -- Corregido a boolean
    stock_restante INT NOT NULL
);

-- 8. PROMOCIONES
CREATE TABLE promociones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    locatario_id UUID REFERENCES locatarios(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
    descuento_porcentaje INT NOT NULL, -- Ej: 15 para 15%
    hora_inicio TIME,
    hora_fin TIME,
    activa BOOLEAN DEFAULT true -- Corregido a boolean
);

-- 9. PEDIDOS
CREATE TABLE pedidos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    locatario_id UUID REFERENCES locatarios(id) ON DELETE CASCADE,
    franja_horaria_id UUID REFERENCES franjas_horarias(id) ON DELETE SET NULL,
    estado pedido_estado DEFAULT 'pendiente_pago'::pedido_estado,
    metodo_pago metodo_pago_enum,
    monto_total INT NOT NULL, -- Corregido a INT
    hora_retiro_estimada TIMESTAMP WITH TIME ZONE,
    codigo_retiro VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. PEDIDO ITEMS (Detalle)
CREATE TABLE pedido_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario INT NOT NULL, -- Corregido a INT
    subtotal INT NOT NULL -- Corregido a INT
);

-- 11. TRANSACCIONES PAGO
CREATE TABLE transacciones_pago (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
    proveedor VARCHAR(50) NOT NULL, -- Ej: 'MercadoPago', 'Edenred'
    transaccion_externa_id VARCHAR(255),
    estado transaccion_estado DEFAULT 'pendiente'::transaccion_estado,
    monto INT NOT NULL, -- Corregido a INT
    payload_respuesta JSONB, -- JSONB es ideal para guardar respuestas completas de la API de pago
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 12. NOTIFICACIONES
CREATE TABLE notificaciones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, -- Ej: 'pedido_listo', 'promo_activa'
    enviado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================
-- INDEXES DE RENDIMIENTO (Performance)
-- Basados en las sugerencias de su diagrama
-- ==========================================
CREATE INDEX idx_productos_locatario ON productos(locatario_id);
CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_pedidos_locatario ON pedidos(locatario_id);
CREATE INDEX idx_pedidos_franja ON pedidos(franja_horaria_id);
CREATE INDEX idx_pedido_items_pedido ON pedido_items(pedido_id);
CREATE INDEX idx_transacciones_pedido ON transacciones_pago(pedido_id);

-- ==========================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security - RLS)
-- ==========================================
-- Como activamos "Automatic RLS", TODAS las tablas están bloqueadas. 
-- Estas políticas permiten que la app móvil funcione.

-- 1. Tablas Públicas (Todos pueden ver el menú y los locales)
CREATE POLICY "Locatarios visibles para todos" ON locatarios FOR SELECT USING (true);
CREATE POLICY "Franjas visibles para todos" ON franjas_horarias FOR SELECT USING (true);
CREATE POLICY "Categorias visibles para todos" ON categorias_menu FOR SELECT USING (true);
CREATE POLICY "Productos visibles para todos" ON productos FOR SELECT USING (true);
CREATE POLICY "Menu dia visible para todos" ON menu_del_dia FOR SELECT USING (true);
CREATE POLICY "Promociones visibles para todos" ON promociones FOR SELECT USING (true);

-- 2. Usuarios (Solo ven y editan su propio perfil)
CREATE POLICY "Usuarios ven su propio perfil" ON usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuarios actualizan su propio perfil" ON usuarios FOR UPDATE USING (auth.uid() = id);

-- 3. Pedidos y Transacciones (Alumnos solo ven lo suyo)
CREATE POLICY "Alumnos ven sus propios pedidos" ON pedidos FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Alumnos crean sus pedidos" ON pedidos FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Alumnos ven detalles de su pedido" ON pedido_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM pedidos WHERE pedidos.id = pedido_items.pedido_id AND pedidos.usuario_id = auth.uid())
);
CREATE POLICY "Alumnos agregan detalles a su pedido" ON pedido_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM pedidos WHERE pedidos.id = pedido_items.pedido_id AND pedidos.usuario_id = auth.uid())
);

CREATE POLICY "Alumnos ven sus transacciones" ON transacciones_pago FOR SELECT USING (
    EXISTS (SELECT 1 FROM pedidos WHERE pedidos.id = transacciones_pago.pedido_id AND pedidos.usuario_id = auth.uid())
);
CREATE POLICY "Alumnos crean transacciones" ON transacciones_pago FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM pedidos WHERE pedidos.id = transacciones_pago.pedido_id AND pedidos.usuario_id = auth.uid())
);
