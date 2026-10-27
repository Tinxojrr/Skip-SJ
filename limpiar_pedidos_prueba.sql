-- ==============================================================
-- LIMPIEZA DE PEDIDOS DE PRUEBA - SKIP DUOC UC
-- Ejecutar en Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xillpulfdzkntplmquez/sql/new
-- ==============================================================

-- OPCIÓN 1: ELIMINAR COMPLETAMENTE TODOS LOS PEDIDOS DE PRUEBA
-- (Deja el sistema en blanco como recién instalado)
DELETE FROM pedido_items;
DELETE FROM pedidos;

-- --------------------------------------------------------------
-- OPCIÓN 2 (Alternativa): Marcar todos los pedidos como COMPLETADOS
-- Si no quieres borrar los datos pero quieres que en la app móvil
-- ya no salgan como "Esperando al local...", descomenta esta línea:
-- UPDATE pedidos SET estado = 'completado' WHERE estado != 'completado';

