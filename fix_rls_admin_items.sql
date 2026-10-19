-- ==========================================================
-- POLÍTICAS RLS PARA QUE EL LOCAL VEA ITEMS, CLIENTES Y EDITE PRODUCTOS
-- ==========================================================

-- 1. Permitir que los administradores de locales vean los ítems de los pedidos de su local
DROP POLICY IF EXISTS "Admins ven items de pedidos de su local" ON pedido_items;
CREATE POLICY "Admins ven items de pedidos de su local" ON pedido_items
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM pedidos
        JOIN locatarios ON locatarios.id = pedidos.locatario_id
        WHERE pedidos.id = pedido_items.pedido_id
        AND (locatarios.usuario_admin_id = auth.uid() OR auth.jwt() ->> 'email' LIKE '%@skipsj.cl')
    )
);

-- 2. Permitir que los administradores vean los datos básicos de los clientes que compraron en su local
DROP POLICY IF EXISTS "Admins ven clientes de sus pedidos" ON usuarios;
CREATE POLICY "Admins ven clientes de sus pedidos" ON usuarios
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM pedidos
        JOIN locatarios ON locatarios.id = pedidos.locatario_id
        WHERE pedidos.usuario_id = usuarios.id
        AND (locatarios.usuario_admin_id = auth.uid() OR auth.jwt() ->> 'email' LIKE '%@skipsj.cl')
    )
    OR auth.uid() = id
);

-- 3. Permitir que los administradores actualicen el stock y disponibilidad de sus productos
DROP POLICY IF EXISTS "Admins actualizan productos de su local" ON productos;
CREATE POLICY "Admins actualizan productos de su local" ON productos
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM locatarios
        WHERE locatarios.id = productos.locatario_id
        AND (locatarios.usuario_admin_id = auth.uid() OR auth.jwt() ->> 'email' LIKE '%@skipsj.cl')
    )
);
