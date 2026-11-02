-- ==========================================================
-- SCRIPT INTEGRAL: METODOS DE PAGO REALES Y FIX DE RLS (SIN BUCLES)
-- ==========================================================

-- 1. AGREGAR MÉTODOS DE PAGO REALES AL ENUM DE SUPABASE (Webpay y BancoEstado)
ALTER TYPE metodo_pago_enum ADD VALUE IF NOT EXISTS 'webpay';
ALTER TYPE metodo_pago_enum ADD VALUE IF NOT EXISTS 'bancoestado';

-- 2. ACTUALIZAR PEDIDOS ANTIGUOS QUE DECÍAN 'mercadopago' A 'webpay'
UPDATE public.pedidos 
SET metodo_pago = 'webpay' 
WHERE metodo_pago = 'mercadopago';

-- 3. ACTIVAR PEDIDOS QUE QUEDARON EN 'pendiente_pago' PARA QUE SE VEAN EN COCINA
UPDATE public.pedidos 
SET estado = 'pagado' 
WHERE estado = 'pendiente_pago';

-- 4. ELIMINAR POLÍTICAS CON BUCLES RECURSIVOS EN USUARIOS (Evita error 42P17)
DROP POLICY IF EXISTS "Admins ven clientes de sus pedidos" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios ven su propio perfil" ON public.usuarios;
DROP POLICY IF EXISTS "Lectura de perfiles de usuarios" ON public.usuarios;

CREATE POLICY "Lectura de perfiles de usuarios" ON public.usuarios
FOR SELECT TO authenticated
USING (true);

-- 5. POLÍTICA LIMPIA EN PEDIDOS (Para que alumnos, cajeros y admins gestionen)
DROP POLICY IF EXISTS "Gestion de pedidos segun rol y local" ON public.pedidos;
DROP POLICY IF EXISTS "Alumnos ven sus propios pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Alumnos insertan sus pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Locatarios y Admins gestionan pedidos de su local" ON public.pedidos;
DROP POLICY IF EXISTS "Permitir ver pedidos a administradores de tienda" ON public.pedidos;

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

-- 6. POLÍTICA LIMPIA EN PEDIDO_ITEMS
DROP POLICY IF EXISTS "Gestion pedido_items segun rol" ON public.pedido_items;
DROP POLICY IF EXISTS "Admins ven items de pedidos de su local" ON public.pedido_items;

CREATE POLICY "Gestion pedido_items segun rol" ON public.pedido_items
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);
