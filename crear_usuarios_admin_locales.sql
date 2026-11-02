-- ==========================================================
-- SCRIPT SQL: CREACIÓN DE ADMINISTRADORES DE TIENDA Y SUPER ADMIN
-- Sistema: SKIP Duoc UC (Sede San Joaquín)
-- Ejecutar en: Supabase SQL Editor (https://supabase.com/dashboard/project/xillpulfdzkntplmquez/sql/new)
-- ==========================================================

-- Habilitar extensión criptográfica para contraseñas
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    -- IDs fijos para consistencia
    id_super_admin UUID := 'a0000000-0000-0000-0000-000000000001';
    id_castano     UUID := 'a0000000-0000-0000-0000-000000000002';
    id_achoclonado UUID := 'a0000000-0000-0000-0000-000000000003';
    id_comedor     UUID := 'a0000000-0000-0000-0000-000000000004';
    id_paradiso    UUID := 'a0000000-0000-0000-0000-000000000005';
    id_local1      UUID := 'a0000000-0000-0000-0000-000000000006';

    -- Contraseña por defecto para todos: Duoc2026!
    pass_hash TEXT := crypt('Duoc2026!', gen_salt('bf'));
BEGIN

    -- ======================================================
    -- 1. SUPER ADMIN (Administración General Sede San Joaquín)
    -- ======================================================
    DELETE FROM auth.users WHERE email = 'admin.general@duocuc.cl';
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, 
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        id_super_admin, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'admin.general@duocuc.cl', pass_hash, NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"p_nombre":"Admin","apellido_p":"General Sede"}'::jsonb,
        NOW(), NOW()
    );

    INSERT INTO public.usuarios (id, email, rol, p_nombre, apellido_p, apodo)
    VALUES (id_super_admin, 'admin.general@duocuc.cl', 'super_admin'::user_role, 'Administrador', 'General', 'Admin SJ')
    ON CONFLICT (id) DO UPDATE 
    SET rol = 'super_admin'::user_role, p_nombre = 'Administrador', apellido_p = 'General';

    -- ======================================================
    -- 2. ADMIN TIENDA: CASTAÑO
    -- ======================================================
    DELETE FROM auth.users WHERE email = 'admin.castano@duocuc.cl';
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, 
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        id_castano, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'admin.castano@duocuc.cl', pass_hash, NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"p_nombre":"Encargado","apellido_p":"Castaño"}'::jsonb,
        NOW(), NOW()
    );

    INSERT INTO public.usuarios (id, email, rol, p_nombre, apellido_p, apodo)
    VALUES (id_castano, 'admin.castano@duocuc.cl', 'store_admin'::user_role, 'Encargado', 'Castaño', 'Castaño')
    ON CONFLICT (id) DO UPDATE 
    SET rol = 'store_admin'::user_role, p_nombre = 'Encargado', apellido_p = 'Castaño';

    UPDATE public.locatarios 
    SET usuario_admin_id = id_castano 
    WHERE id = 'ccf96a4f-2dc9-4bdf-8ac0-1ba24453962a' OR nombre ILIKE '%Castaño%';

    -- ======================================================
    -- 3. ADMIN TIENDA: ACHOCLONADO
    -- ======================================================
    DELETE FROM auth.users WHERE email = 'admin.achoclonado@duocuc.cl';
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, 
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        id_achoclonado, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'admin.achoclonado@duocuc.cl', pass_hash, NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"p_nombre":"Encargado","apellido_p":"Achoclonado"}'::jsonb,
        NOW(), NOW()
    );

    INSERT INTO public.usuarios (id, email, rol, p_nombre, apellido_p, apodo)
    VALUES (id_achoclonado, 'admin.achoclonado@duocuc.cl', 'store_admin'::user_role, 'Encargado', 'Achoclonado', 'Achoclonado')
    ON CONFLICT (id) DO UPDATE 
    SET rol = 'store_admin'::user_role, p_nombre = 'Encargado', apellido_p = 'Achoclonado';

    UPDATE public.locatarios 
    SET usuario_admin_id = id_achoclonado 
    WHERE id = '044b6233-0f3d-47c1-8230-a9c9da324163' OR nombre ILIKE '%Achoclonado%';

    -- ======================================================
    -- 4. ADMIN TIENDA: COMEDOR CENTRAL (CASINO)
    -- ======================================================
    DELETE FROM auth.users WHERE email = 'admin.comedor@duocuc.cl';
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, 
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        id_comedor, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'admin.comedor@duocuc.cl', pass_hash, NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"p_nombre":"Encargado","apellido_p":"Comedor"}'::jsonb,
        NOW(), NOW()
    );

    INSERT INTO public.usuarios (id, email, rol, p_nombre, apellido_p, apodo)
    VALUES (id_comedor, 'admin.comedor@duocuc.cl', 'store_admin'::user_role, 'Encargado', 'Comedor', 'Comedor')
    ON CONFLICT (id) DO UPDATE 
    SET rol = 'store_admin'::user_role, p_nombre = 'Encargado', apellido_p = 'Comedor';

    UPDATE public.locatarios 
    SET usuario_admin_id = id_comedor 
    WHERE id = '14ba7459-da6a-4350-96d0-3cc0516b80b3' OR nombre ILIKE '%Comedor%';

    -- ======================================================
    -- 5. ADMIN TIENDA: CAFETERÍA PARADISO
    -- ======================================================
    DELETE FROM auth.users WHERE email = 'admin.paradiso@duocuc.cl';
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, 
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        id_paradiso, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'admin.paradiso@duocuc.cl', pass_hash, NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"p_nombre":"Encargado","apellido_p":"Paradiso"}'::jsonb,
        NOW(), NOW()
    );

    INSERT INTO public.usuarios (id, email, rol, p_nombre, apellido_p, apodo)
    VALUES (id_paradiso, 'admin.paradiso@duocuc.cl', 'store_admin'::user_role, 'Encargado', 'Paradiso', 'Paradiso')
    ON CONFLICT (id) DO UPDATE 
    SET rol = 'store_admin'::user_role, p_nombre = 'Encargado', apellido_p = 'Paradiso';

    UPDATE public.locatarios 
    SET usuario_admin_id = id_paradiso 
    WHERE id = 'fcb8c9bd-96af-407e-a4ab-31700f561cab' OR nombre ILIKE '%Paradiso%';

    -- ======================================================
    -- 6. ADMIN TIENDA: LOCAL -1
    -- ======================================================
    DELETE FROM auth.users WHERE email = 'admin.local1@duocuc.cl';
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, 
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        id_local1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'admin.local1@duocuc.cl', pass_hash, NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"p_nombre":"Encargado","apellido_p":"Local -1"}'::jsonb,
        NOW(), NOW()
    );

    INSERT INTO public.usuarios (id, email, rol, p_nombre, apellido_p, apodo)
    VALUES (id_local1, 'admin.local1@duocuc.cl', 'store_admin'::user_role, 'Encargado', 'Local -1', 'Local -1')
    ON CONFLICT (id) DO UPDATE 
    SET rol = 'store_admin'::user_role, p_nombre = 'Encargado', apellido_p = 'Local -1';

    UPDATE public.locatarios 
    SET usuario_admin_id = id_local1 
    WHERE id = '6e31d04c-9f86-4e5c-9f3f-5e04229725ee' OR nombre ILIKE '%Local -1%';

END $$;

-- Verificación final de los administradores y sus locales asignados
SELECT 
    l.id AS local_id,
    l.nombre AS nombre_tienda,
    l.tipo,
    u.id AS usuario_id,
    u.email AS correo_admin,
    u.rol
FROM public.locatarios l
LEFT JOIN public.usuarios u ON u.id = l.usuario_admin_id
ORDER BY l.nombre;
