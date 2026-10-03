-- ====================================================
-- SCRIPT DE POBLAMIENTO DE CATÁLOGO EXTENDIDO: Skip Duoc UC
-- ====================================================

-- 1. Primero limpiamos categorías y productos (por si acaso quedaron restos)
DELETE FROM public.categorias_menu;
DELETE FROM public.productos;

-- 2. Declaramos las categorías extendidas para cada local
INSERT INTO public.categorias_menu (locatario_id, nombre, orden)
SELECT id, 'Choclos en Vaso', 1 FROM public.locatarios WHERE nombre = 'Achoclonado';
INSERT INTO public.categorias_menu (locatario_id, nombre, orden)
SELECT id, 'Para compartir', 2 FROM public.locatarios WHERE nombre = 'Achoclonado';
INSERT INTO public.categorias_menu (locatario_id, nombre, orden)
SELECT id, 'Bebidas Frías', 3 FROM public.locatarios WHERE nombre = 'Achoclonado';

INSERT INTO public.categorias_menu (locatario_id, nombre, orden)
SELECT id, 'Empanadas y Chaparritas', 1 FROM public.locatarios WHERE nombre = 'Castaño';
INSERT INTO public.categorias_menu (locatario_id, nombre, orden)
SELECT id, 'Bollería y Dulces', 2 FROM public.locatarios WHERE nombre = 'Castaño';
INSERT INTO public.categorias_menu (locatario_id, nombre, orden)
SELECT id, 'Sándwiches Envasados', 3 FROM public.locatarios WHERE nombre = 'Castaño';
INSERT INTO public.categorias_menu (locatario_id, nombre, orden)
SELECT id, 'Cafetería', 4 FROM public.locatarios WHERE nombre = 'Castaño';

INSERT INTO public.categorias_menu (locatario_id, nombre, orden)
SELECT id, 'Menú Junaeb (Almuerzos)', 1 FROM public.locatarios WHERE nombre = 'Comedor';
INSERT INTO public.categorias_menu (locatario_id, nombre, orden)
SELECT id, 'Ensaladas Frescas', 2 FROM public.locatarios WHERE nombre = 'Comedor';
INSERT INTO public.categorias_menu (locatario_id, nombre, orden)
SELECT id, 'Postres', 3 FROM public.locatarios WHERE nombre = 'Comedor';

INSERT INTO public.categorias_menu (locatario_id, nombre, orden)
SELECT id, 'Desayuno y Cafetería', 1 FROM public.locatarios WHERE nombre = 'Paradiso';
INSERT INTO public.categorias_menu (locatario_id, nombre, orden)
SELECT id, 'Sándwiches y Pizzas', 2 FROM public.locatarios WHERE nombre = 'Paradiso';
INSERT INTO public.categorias_menu (locatario_id, nombre, orden)
SELECT id, 'Snacks y Energéticas', 3 FROM public.locatarios WHERE nombre = 'Paradiso';

INSERT INTO public.categorias_menu (locatario_id, nombre, orden)
SELECT id, 'Sopaipillas y Frituras', 1 FROM public.locatarios WHERE nombre = 'Local -1';
INSERT INTO public.categorias_menu (locatario_id, nombre, orden)
SELECT id, 'Completos y Hamburguesas', 2 FROM public.locatarios WHERE nombre = 'Local -1';


-- ====================================================
-- 3. PRODUCTOS ACHOCLONADO (Choclo al Paso)
-- ====================================================
INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Choclo Mediano Tradicional', 'Choclo desgranado con mantequilla, mayonesa y ciboulette.', 3200, 'https://images.unsplash.com/photo-1574783756547-258b3c720fe9?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Achoclonado' AND c.nombre = 'Choclos en Vaso';

INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Choclo Grande Premium Carne', 'Choclo desgranado con carne picada, queso fundido, tocino y ciboulette.', 4500, 'https://images.unsplash.com/photo-1628268909376-e8c44bb3153f?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Achoclonado' AND c.nombre = 'Choclos en Vaso';

INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Choclo Vegetariano Champiñón', 'Choclo desgranado, mantequilla, champiñones salteados y queso.', 4200, 'https://images.unsplash.com/photo-1574783756547-258b3c720fe9?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Achoclonado' AND c.nombre = 'Choclos en Vaso';

INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Porción de Nachos con Queso', 'Nachos crujientes bañados en abundante salsa de queso cheddar.', 2500, 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Achoclonado' AND c.nombre = 'Para compartir';

INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Coca-Cola Zero Lata 350ml', 'Bebida en lata bien helada.', 1200, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Achoclonado' AND c.nombre = 'Bebidas Frías';


-- ====================================================
-- 4. PRODUCTOS CASTAÑO (Panadería / Dulces)
-- ====================================================
INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Empanada de Pino de Horno', 'Clásica empanada de pino con aceituna y huevo duro.', 2400, 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Castaño' AND c.nombre = 'Empanadas y Chaparritas';

INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Empanada Napolitana', 'Empanada de horno rellena de queso, jamón, tomate y orégano.', 2600, 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Castaño' AND c.nombre = 'Empanadas y Chaparritas';

INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Chaparrita Salchicha Queso', 'Masa de empanada enrollada con salchicha y queso fundido.', 2200, 'https://images.unsplash.com/photo-1627308595229-7830f5c92f83?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Castaño' AND c.nombre = 'Empanadas y Chaparritas';

INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Muffin de Arándanos', 'Muffin esponjoso relleno de arándanos frescos.', 1600, 'https://images.unsplash.com/photo-1557925923-33b251d5b9d2?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Castaño' AND c.nombre = 'Bollería y Dulces';

INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Porción Torta Milhojas', 'Torta de milhojas tradicional chilena con mucho manjar.', 2800, 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Castaño' AND c.nombre = 'Bollería y Dulces';

INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Sándwich Miga Jamón Queso', 'Sándwich frío en pan de miga, ideal para comer rápido.', 1900, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Castaño' AND c.nombre = 'Sándwiches Envasados';

INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Café Latte Mediano', 'Café espresso con leche espumada.', 1800, 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Castaño' AND c.nombre = 'Cafetería';


-- ====================================================
-- 5. PRODUCTOS COMEDOR (Menús de Almuerzo)
-- ====================================================
INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Menú Junaeb: Lasaña Boloñesa', 'Lasaña casera + ensalada chica + pan + jugo.', 3800, 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Comedor' AND c.nombre = 'Menú Junaeb (Almuerzos)';

INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Menú Junaeb: Pollo con Arroz', '1/4 de pollo asado con arroz graneado + ensalada + jugo.', 3800, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Comedor' AND c.nombre = 'Menú Junaeb (Almuerzos)';

INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Ensalada César con Pollo', 'Lechuga, pollo a la plancha, crutones, queso parmesano y aderezo.', 3500, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Comedor' AND c.nombre = 'Ensaladas Frescas';

INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Leche Asada Casera', 'Postre tradicional chileno de leche horneada y caramelo.', 1200, 'https://images.unsplash.com/photo-1590218731173-05b10eefbda1?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Comedor' AND c.nombre = 'Postres';


-- ====================================================
-- 6. PRODUCTOS PARADISO (Cafetería / Sándwiches)
-- ====================================================
INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Promo 2x1 Café Americano', 'Dos cafés americanos tamaño normal al precio de uno.', 2000, 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Paradiso' AND c.nombre = 'Desayuno y Cafetería';

INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Sándwich Barros Luco', 'Carne de vacuno a la plancha y abundante queso fundido en pan frica.', 4200, 'https://images.unsplash.com/photo-1619860860774-1e2e17343432?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Paradiso' AND c.nombre = 'Sándwiches y Pizzas';

INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Pizza Pepperoni Individual', 'Pizza masa a la piedra tamaño personal con queso y pepperoni.', 3500, 'https://images.unsplash.com/photo-1513104890f38-7c7f476f4c71?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Paradiso' AND c.nombre = 'Sándwiches y Pizzas';

INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'RedBull Energy Drink 250ml', 'Bebida energética fría para las clases de la tarde.', 1800, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Paradiso' AND c.nombre = 'Snacks y Energéticas';


-- ====================================================
-- 7. PRODUCTOS LOCAL -1 (Bajón Universitario)
-- ====================================================
INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Sopaipilla Sola', 'Sopaipilla frita clásica con zapallo.', 300, 'https://images.unsplash.com/photo-1626074964464-967a57a5cda6?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Local -1' AND c.nombre = 'Sopaipillas y Frituras';

INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Promo 3 Sopaipillas con Palta', 'Tres sopaipillas calientes con palta recién molida.', 1800, 'https://images.unsplash.com/photo-1626074964464-967a57a5cda6?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Local -1' AND c.nombre = 'Sopaipillas y Frituras';

INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Completo Italiano', 'Vienesa, tomate, palta, y mayonesa casera en pan lengua.', 2200, 'https://images.unsplash.com/photo-1599599811450-2c5940ebbdf0?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Local -1' AND c.nombre = 'Completos y Hamburguesas';

INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Hamburguesa Casera Completa', 'Hamburguesa de carne 120g, queso, lechuga, tomate y mayo.', 3800, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Local -1' AND c.nombre = 'Completos y Hamburguesas';

INSERT INTO public.productos (locatario_id, categoria_id, nombre_producto, descripcion, precio, imagen_url, disponible)
SELECT l.id, c.id, 'Salchipapas Grandes', 'Porción abundante de papas fritas con vienesas cortadas y aderezos.', 2500, 'https://images.unsplash.com/photo-1625937751876-4515cd8e78bf?q=80&w=2000', true
FROM public.locatarios l JOIN public.categorias_menu c ON c.locatario_id = l.id WHERE l.nombre = 'Local -1' AND c.nombre = 'Sopaipillas y Frituras';

SELECT '¡Catálogo gigante y realista importado exitosamente!' as status;
