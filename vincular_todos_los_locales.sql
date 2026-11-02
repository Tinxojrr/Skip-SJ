-- ==========================================================
-- SCRIPT DE VINCULACIÓN DEFINITIVA DE TIENDAS Y ADMINISTRADORES
-- ==========================================================

-- 1. Vincular ACHOCLONADOS con su usuario real (achoclonados@skipsj.cl)
UPDATE public.locatarios 
SET usuario_admin_id = '15b3665f-6113-46b3-84d0-5cbf3408510e'
WHERE id = '044b6233-0f3d-47c1-8230-a9c9da324163' OR nombre ILIKE '%Achoclonado%';

-- 2. Vincular CAFETERÍA PARADISO con su usuario real (paradiso@skipsj.cl)
UPDATE public.locatarios 
SET usuario_admin_id = '48d92c8d-6142-4644-9efc-d58dbed3b2f6'
WHERE id = 'fcb8c9bd-96af-407e-a4ab-31700f561cab' OR nombre ILIKE '%Paradiso%';

-- 3. Crear o actualizar los usuarios de CASTAÑO, COMEDOR y LOCAL -1 con clave '123456'
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    pass_hash TEXT := crypt('123456', gen_salt('bf'));
    u_castano UUID := 'a0000000-0000-0000-0000-000000000002';
    u_comedor UUID := 'a0000000-0000-0000-0000-000000000004';
    u_local1  UUID := 'a0000000-0000-0000-0000-000000000006';
BEGIN
    -- Castaño (castano@skipsj.cl)
    DELETE FROM auth.users WHERE email = 'castano@skipsj.cl';
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (u_castano, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'castano@skipsj.cl', pass_hash, NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"p_nombre":"Encargado","apodo":"Castaño"}'::jsonb, NOW(), NOW());
    
    INSERT INTO public.usuarios (id, email, rol, p_nombre, apodo)
    VALUES (u_castano, 'castano@skipsj.cl', 'store_admin', 'Encargado', 'Castaño')
    ON CONFLICT (id) DO UPDATE SET email = 'castano@skipsj.cl', rol = 'store_admin', apodo = 'Castaño';
    
    UPDATE public.locatarios SET usuario_admin_id = u_castano WHERE id = 'ccf96a4f-2dc9-4bdf-8ac0-1ba24453962a' OR nombre ILIKE '%Castaño%';

    -- Comedor Central (comedor@skipsj.cl)
    DELETE FROM auth.users WHERE email = 'comedor@skipsj.cl';
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (u_comedor, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'comedor@skipsj.cl', pass_hash, NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"p_nombre":"Encargado","apodo":"Comedor"}'::jsonb, NOW(), NOW());
    
    INSERT INTO public.usuarios (id, email, rol, p_nombre, apodo)
    VALUES (u_comedor, 'comedor@skipsj.cl', 'store_admin', 'Encargado', 'Comedor')
    ON CONFLICT (id) DO UPDATE SET email = 'comedor@skipsj.cl', rol = 'store_admin', apodo = 'Comedor';
    
    UPDATE public.locatarios SET usuario_admin_id = u_comedor WHERE id = '14ba7459-da6a-4350-96d0-3cc0516b80b3' OR nombre ILIKE '%Comedor%';

    -- Local -1 (local1@skipsj.cl)
    DELETE FROM auth.users WHERE email = 'local1@skipsj.cl';
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (u_local1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'local1@skipsj.cl', pass_hash, NOW(), '{"provider":"email","providers":["email"]}'::jsonb, '{"p_nombre":"Encargado","apodo":"Local -1"}'::jsonb, NOW(), NOW());
    
    INSERT INTO public.usuarios (id, email, rol, p_nombre, apodo)
    VALUES (u_local1, 'local1@skipsj.cl', 'store_admin', 'Encargado', 'Local -1')
    ON CONFLICT (id) DO UPDATE SET email = 'local1@skipsj.cl', rol = 'store_admin', apodo = 'Local -1';
    
    UPDATE public.locatarios SET usuario_admin_id = u_local1 WHERE id = '6e31d04c-9f86-4e5c-9f3f-5e04229725ee' OR nombre ILIKE '%Local -1%';
END $$;

-- 4. CONSULTA DE VERIFICACIÓN
SELECT 
    l.nombre AS tienda,
    l.id AS local_id,
    u.email AS usuario_admin,
    u.rol
FROM public.locatarios l
LEFT JOIN public.usuarios u ON u.id = l.usuario_admin_id
ORDER BY l.nombre;
