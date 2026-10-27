-- ==========================================================
-- AGREGAR COLUMNA NOTAS/COMENTARIOS A PEDIDO_ITEMS
-- ==========================================================
-- Ejecuta esta consulta en el SQL Editor de tu proyecto Supabase:

ALTER TABLE pedido_items 
ADD COLUMN IF NOT EXISTS notas TEXT;

-- Notificar a la caché de esquema de PostgREST
NOTIFY pgrst, 'reload schema';

