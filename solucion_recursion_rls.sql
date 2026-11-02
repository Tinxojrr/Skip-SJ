-- ==========================================================
-- SOLUCIÓN DEFINITIVA: ELIMINAR RECURSIÓN INFINITA (ERROR 42P17)
-- ==========================================================

-- 1. LIMPIAR POLÍTICAS RECURSIVAS EN USUARIOS
-- La política antigua consultaba "pedidos", lo que provocaba un bucle infinito
DROP POLICY IF EXISTS "Admins ven clientes de sus pedidos" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios ven su propio perfil" ON public.usuarios;
DROP POLICY IF EXISTS "Lectura de perfiles de usuarios" ON public.usuarios;

-- Permitir lectura directa de perfiles a usuarios autenticados (sin bucles)
CREATE POLICY "Lectura de perfiles de usuarios" ON public.usuarios
FOR SELECT TO authenticated
USING (true);

-- 2. LIMPIAR Y RECREAR POLÍTICA EN PEDIDOS
DROP POLICY IF EXISTS "Gestion de pedidos segun rol y local" ON public.pedidos;
DROP POLICY IF EXISTS "Alumnos ven sus propios pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Locatarios y Admins gestionan pedidos de su local" ON public.pedidos;
DROP POLICY IF EXISTS "Permitir ver pedidos a administradores de tienda" ON public.pedidos;

-- Política sin consultas circulares:
CREATE POLICY "Gestion de pedidos segun rol y local" ON public.pedidos
FOR ALL TO authenticated
USING (
    auth.uid() = usuario_id
    OR (auth.jwt() ->> 'email') IN ('paradiso@skipsj.cl', 'admin@skipsj.cl', 'castano@skipsj.cl', 'achoclonado@skipsj.cl', 'comedor@skipsj.cl', 'local1@skipsj.cl')
    OR (auth.jwt() ->> 'email') LIKE '%@skipsj.cl'
    OR (auth.jwt() ->> 'email') LIKE '%@duocuc.cl'
    OR EXISTS (
        SELECT 1 FROM public.locatarios
        WHERE public.locatarios.id = public.pedidos.locatario_id
        AND public.locatarios.usuario_admin_id = auth.uid()
    )
)
WITH CHECK (
    auth.uid() = usuario_id
    OR (auth.jwt() ->> 'email') IN ('paradiso@skipsj.cl', 'admin@skipsj.cl', 'castano@skipsj.cl', 'achoclonado@skipsj.cl', 'comedor@skipsj.cl', 'local1@skipsj.cl')
    OR (auth.jwt() ->> 'email') LIKE '%@skipsj.cl'
    OR (auth.jwt() ->> 'email') LIKE '%@duocuc.cl'
    OR EXISTS (
        SELECT 1 FROM public.locatarios
        WHERE public.locatarios.id = public.pedidos.locatario_id
        AND public.locatarios.usuario_admin_id = auth.uid()
    )
);

-- 3. POLÍTICA EN PEDIDO_ITEMS
DROP POLICY IF EXISTS "Gestion pedido_items segun rol" ON public.pedido_items;
DROP POLICY IF EXISTS "Admins ven items de pedidos de su local" ON public.pedido_items;

CREATE POLICY "Gestion pedido_items segun rol" ON public.pedido_items
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);
