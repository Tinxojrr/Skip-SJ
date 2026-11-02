-- ==========================================================
-- SCRIPT SEGURO: VINCULAR TIENDAS MEDIANTE UPDATE (SIN DUPLICADOS)
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    pass_hash TEXT := crypt('123456', gen_salt('bf'));
BEGIN
    -- 1. Vincular ACHOCLONADOS con su usuario real (achoclonados@skipsj.cl)
    UPDATE public.locatarios 
    SET usuario_admin_id = '15b3665f-6113-46b3-84d0-5cbf3408510e'
    WHERE id = '044b6233-0f3d-47c1-8230-a9c9da324163' OR nombre ILIKE '%Achoclonado%';

    -- 2. Vincular CAFETERÍA PARADISO con su usuario real (paradiso@skipsj.cl)
    UPDATE public.locatarios 
    SET usuario_admin_id = '48d92c8d-6142-4644-9efc-d58dbed3b2f6'
    WHERE id = 'fcb8c9bd-96af-407e-a4ab-31700f561cab' OR nombre ILIKE '%Paradiso%';

    -- 3. Actualizar Castaño a castano@skipsj.cl (clave 123456)
    UPDATE auth.users 
    SET email = 'castano@skipsj.cl', encrypted_password = pass_hash, email_confirmed_at = NOW()
    WHERE id = 'a0000000-0000-0000-0000-000000000002';
    
    UPDATE public.usuarios 
    SET email = 'castano@skipsj.cl', rol = 'store_admin', p_nombre = 'Encargado', apodo = 'Castaño'
    WHERE id = 'a0000000-0000-0000-0000-000000000002';

    UPDATE public.locatarios 
    SET usuario_admin_id = 'a0000000-0000-0000-0000-000000000002'
    WHERE id = 'ccf96a4f-2dc9-4bdf-8ac0-1ba24453962a' OR nombre ILIKE '%Castaño%';

    -- 4. Actualizar Comedor Central a comedor@skipsj.cl (clave 123456)
    UPDATE auth.users 
    SET email = 'comedor@skipsj.cl', encrypted_password = pass_hash, email_confirmed_at = NOW()
    WHERE id = 'a0000000-0000-0000-0000-000000000004';
    
    UPDATE public.usuarios 
    SET email = 'comedor@skipsj.cl', rol = 'store_admin', p_nombre = 'Encargado', apodo = 'Comedor'
    WHERE id = 'a0000000-0000-0000-0000-000000000004';

    UPDATE public.locatarios 
    SET usuario_admin_id = 'a0000000-0000-0000-0000-000000000004'
    WHERE id = '14ba7459-da6a-4350-96d0-3cc0516b80b3' OR nombre ILIKE '%Comedor%';

    -- 5. Actualizar Local -1 a local1@skipsj.cl (clave 123456)
    UPDATE auth.users 
    SET email = 'local1@skipsj.cl', encrypted_password = pass_hash, email_confirmed_at = NOW()
    WHERE id = 'a0000000-0000-0000-0000-000000000006';
    
    UPDATE public.usuarios 
    SET email = 'local1@skipsj.cl', rol = 'store_admin', p_nombre = 'Encargado', apodo = 'Local -1'
    WHERE id = 'a0000000-0000-0000-0000-000000000006';

    UPDATE public.locatarios 
    SET usuario_admin_id = 'a0000000-0000-0000-0000-000000000006'
    WHERE id = '6e31d04c-9f86-4e5c-9f3f-5e04229725ee' OR nombre ILIKE '%Local -1%';
END $$;

-- Verificación final
SELECT 
    l.nombre AS tienda,
    l.id AS local_id,
    u.email AS correo_admin,
    u.rol
FROM public.locatarios l
LEFT JOIN public.usuarios u ON u.id = l.usuario_admin_id
ORDER BY l.nombre;
