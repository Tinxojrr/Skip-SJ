-- ==============================================================================
-- ACTUALIZACIÓN DE FOTOS DE PRODUCTOS CON CONCORDANCIA REAL (Skip Duoc UC)
-- ==============================================================================
-- Ejecuta este script en el SQL Editor de tu Dashboard de Supabase para
-- corregir las fotos que tenían imágenes equivocadas (ej. papas fritas en empanadas)
-- o enlaces caídos.

UPDATE public.productos
SET imagen_url = 'https://images.unsplash.com/photo-1608039783021-6116a558f0c5?q=80&w=1200'
WHERE nombre_producto = 'Empanada de Pino de Horno';

UPDATE public.productos
SET imagen_url = 'https://images.unsplash.com/photo-1521732670659-b8c918da61dc?q=80&w=1200'
WHERE nombre_producto = 'Empanada Napolitana';

UPDATE public.productos
SET imagen_url = 'https://images.unsplash.com/photo-1635843107983-264f83647ba3?q=80&w=1200'
WHERE nombre_producto = 'Choclo Mediano Tradicional';

UPDATE public.productos
SET imagen_url = 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=1200'
WHERE nombre_producto = 'Choclo Grande Premium Carne';

UPDATE public.productos
SET imagen_url = 'https://images.unsplash.com/photo-1641914086759-6f76fae98cd9?q=80&w=1200'
WHERE nombre_producto = 'Choclo Vegetariano Champiñón';

UPDATE public.productos
SET imagen_url = 'https://images.unsplash.com/photo-1783196736270-4902f85f06f7?q=80&w=1200'
WHERE nombre_producto = 'Chaparrita Salchicha Queso';

UPDATE public.productos
SET imagen_url = 'https://images.unsplash.com/photo-1722251172903-cc8774501df7?q=80&w=1200'
WHERE nombre_producto = 'Muffin de Arándanos';

UPDATE public.productos
SET imagen_url = 'https://images.unsplash.com/photo-1718939043329-b956bee61dbb?q=80&w=1200'
WHERE nombre_producto = 'Leche Asada Casera';

UPDATE public.productos
SET imagen_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1200'
WHERE nombre_producto = 'Pizza Pepperoni Individual';

UPDATE public.productos
SET imagen_url = 'https://images.unsplash.com/photo-1632763358154-6780449d2313?q=80&w=1200'
WHERE nombre_producto = 'RedBull Energy Drink 250ml';

UPDATE public.productos
SET imagen_url = 'https://images.unsplash.com/photo-1769030470963-f821c4c1ab76?q=80&w=1200'
WHERE nombre_producto = 'Sopaipilla Sola';

UPDATE public.productos
SET imagen_url = 'https://images.unsplash.com/photo-1769030470963-f821c4c1ab76?q=80&w=1200'
WHERE nombre_producto = 'Promo 3 Sopaipillas con Palta';

UPDATE public.productos
SET imagen_url = 'https://images.unsplash.com/photo-1515875976234-9d59c3ef288d?q=80&w=1200'
WHERE nombre_producto = 'Completo Italiano';

UPDATE public.productos
SET imagen_url = 'https://images.unsplash.com/photo-1615535248348-0457731f2dc2?q=80&w=1200'
WHERE nombre_producto = 'Salchipapas Grandes';
