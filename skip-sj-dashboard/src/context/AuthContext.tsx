import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  role: string | null;
  locatarioId: string | null;
  loading: boolean;
  changeLocatarioId: (id: string | null) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  locatarioId: null,
  loading: true,
  changeLocatarioId: () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [locatarioId, setLocatarioId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar la sesin inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escuchar cambios (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setRole(null);
        setLocatarioId(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // 1. Obtener el rol del usuario
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', userId)
        .single();
      
      if (userError) throw userError;
      setRole(userData.rol);

      // 2. Si es store_admin, buscar su local (locatario)
      if (userData.rol === 'store_admin') {
        const { data: locatarioData, error: locError } = await supabase
          .from('locatarios')
          .select('id')
          .eq('usuario_admin_id', userId)
          .single();
        
        if (locError && locError.code !== 'PGRST116') {
          console.warn('Locatario no encontrado o error:', locError.message);
        }
        
        if (locatarioData) {
          setLocatarioId(locatarioData.id);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeLocatarioId = (id: string | null) => {
    if (role === 'super_admin') {
      setLocatarioId(id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, role, locatarioId, loading, changeLocatarioId, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
