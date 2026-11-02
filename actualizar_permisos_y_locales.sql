-- ==========================================================
-- SCRIPT DE VINCULACIÓN DE LOCALES Y PERMISOS RLS EN SUPABASE
-- Sistema: SKIP Duoc UC (Sede San Joaquín)
-- Ejecutar en: https://supabase.com/dashboard/project/xillpulfdzkntplmquez/sql/new
-- ==========================================================

-- 1. ASEGURAR ROLES EN TABLA USUARIOS PARA LAS CUENTAS ADMIN / LOCALES
INSERT INTO public.usuarios (id, email, rol, p_nombre, apodo)
VALUES 
  ('48d92c8d-6142-4644-9efc-d58dbed3b2f6', 'paradiso@skipsj.cl', 'store_admin', 'Cajero', 'Paradiso'),
  ('2fc10b94-0aaa-4736-84d2-a3b41fbe85f1', 'admin@skipsj.cl', 'super_admin', 'Administrador', 'Admin SJ')
ON CONFLICT (id) DO UPDATE 
SET rol = EXCLUDED.rol, p_nombre = EXCLUDED.p_nombre, apodo = EXCLUDED.apodo;

-- 2. VINCULAR USUARIOS ADMIN CON SUS TIENDAS CORRESPONDIENTES
-- Paradiso
UPDATE public.locatarios 
SET usuario_admin_id = '48d92c8d-6142-4644-9efc-d58dbed3b2f6'
WHERE id = 'fcb8c9bd-96af-407e-a4ab-31700f561cab' OR nombre ILIKE '%Paradiso%';

-- Vincular Castaño, Achoclonado, Comedor Central y Local -1 con sus administradores correspondientes si existen en auth.users
DO $$
DECLARE
    u_castano UUID;
    u_achoclonado UUID;
    u_comedor UUID;
    u_local1 UUID;
BEGIN
    SELECT id INTO u_castano FROM auth.users WHERE email = 'castano@skipsj.cl' OR email = 'admin.castano@duocuc.cl' LIMIT 1;
    IF u_castano IS NOT NULL THEN
        UPDATE public.locatarios SET usuario_admin_id = u_castano WHERE id = 'ccf96a4f-2dc9-4bdf-8ac0-1ba24453962a' OR nombre ILIKE '%Castaño%';
    END IF;

    SELECT id INTO u_achoclonado FROM auth.users WHERE email = 'achoclonado@skipsj.cl' OR email = 'admin.achoclonado@duocuc.cl' LIMIT 1;
    IF u_achoclonado IS NOT NULL THEN
        UPDATE public.locatarios SET usuario_admin_id = u_achoclonado WHERE id = '044b6233-0f3d-47c1-8230-a9c9da324163' OR nombre ILIKE '%Achoclonado%';
    END IF;

    SELECT id INTO u_comedor FROM auth.users WHERE email = 'comedor@skipsj.cl' OR email = 'admin.comedor@duocuc.cl' LIMIT 1;
    IF u_comedor IS NOT NULL THEN
        UPDATE public.locatarios SET usuario_admin_id = u_comedor WHERE id = '14ba7459-da6a-4350-96d0-3cc0516b80b3' OR nombre ILIKE '%Comedor%';
    END IF;

    SELECT id INTO u_local1 FROM auth.users WHERE email = 'local1@skipsj.cl' OR email = 'admin.local1@duocuc.cl' LIMIT 1;
    IF u_local1 IS NOT NULL THEN
        UPDATE public.locatarios SET usuario_admin_id = u_local1 WHERE id = '6e31d04c-9f86-4e5c-9f3f-5e04229725ee' OR nombre ILIKE '%Local -1%';
    END IF;
END $$;

-- 3. HABILITAR PERMISOS RLS EN PEDIDOS PARA QUE LOS LOCALES Y SUPER ADMIN PUEDAN VER Y GESTIONAR
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas si existían
DROP POLICY IF EXISTS "Locatarios y Admins gestionan pedidos de su local" ON public.pedidos;
DROP POLICY IF EXISTS "Permitir ver pedidos a administradores de tienda" ON public.pedidos;
DROP POLICY IF EXISTS "Locatarios ven sus pedidos" ON public.pedidos;

-- Nueva política completa: 
-- Permite SELECT / UPDATE / ALL a:
-- a) El alumno que hizo el pedido (auth.uid() = usuario_id)
-- b) El administrador/cajero del local correspondiente
-- c) El Super Admin institucional
CREATE POLICY "Gestion de pedidos segun rol y local" ON public.pedidos
FOR ALL USING (
    -- Alumno dueño del pedido
    auth.uid() = usuario_id
    -- O Administrador/Cajero asignado a este local
    OR EXISTS (
        SELECT 1 FROM public.locatarios
        WHERE public.locatarios.id = public.pedidos.locatario_id
        AND public.locatarios.usuario_admin_id = auth.uid()
    )
    -- O Super Administrador de la plataforma
    OR EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE public.usuarios.id = auth.uid()
        AND public.usuarios.rol = 'super_admin'
    )
    -- O cuentas de desarrollo del casino
    OR (auth.jwt() ->> 'email') IN ('paradiso@skipsj.cl', 'admin@skipsj.cl', 'castano@skipsj.cl', 'achoclonado@skipsj.cl', 'comedor@skipsj.cl', 'local1@skipsj.cl')
)
WITH CHECK (
    auth.uid() = usuario_id
    OR EXISTS (
        SELECT 1 FROM public.locatarios
        WHERE public.locatarios.id = public.pedidos.locatario_id
        AND public.locatarios.usuario_admin_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE public.usuarios.id = auth.uid()
        AND public.usuarios.rol = 'super_admin'
    )
    OR (auth.jwt() ->> 'email') IN ('paradiso@skipsj.cl', 'admin@skipsj.cl', 'castano@skipsj.cl', 'achoclonado@skipsj.cl', 'comedor@skipsj.cl', 'local1@skipsj.cl')
);

-- 4. HABILITAR ACCESO RLS A DETALLE_PEDIDOS
ALTER TABLE public.detalle_pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestion detalle_pedidos segun rol" ON public.detalle_pedidos;

CREATE POLICY "Gestion detalle_pedidos segun rol" ON public.detalle_pedidos
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.pedidos
        WHERE public.pedidos.id = public.detalle_pedidos.pedido_id
        AND (
            public.pedidos.usuario_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.locatarios
                WHERE public.locatarios.id = public.pedidos.locatario_id
                AND public.locatarios.usuario_admin_id = auth.uid()
            )
            OR EXISTS (
                SELECT 1 FROM public.usuarios
                WHERE public.usuarios.id = auth.uid()
                AND public.usuarios.rol = 'super_admin'
            )
            OR (auth.jwt() ->> 'email') IN ('paradiso@skipsj.cl', 'admin@skipsj.cl', 'castano@skipsj.cl', 'achoclonado@skipsj.cl', 'comedor@skipsj.cl', 'local1@skipsj.cl')
        )
    )
);

-- 5. VERIFICACIÓN DE ESTADO
SELECT 
    l.id AS local_id,
    l.nombre AS local,
    u.id AS admin_id,
    u.email AS correo_admin,
    u.rol
FROM public.locatarios l
LEFT JOIN public.usuarios u ON u.id = l.usuario_admin_id
ORDER BY l.nombre;
