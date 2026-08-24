import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

type UsuarioProfile = Database['public']['Tables']['usuarios']['Row'];

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UsuarioProfile | null;
  setSession: (session: Session | null) => void;
  fetchProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  setSession: (session) => {
    set({ session, user: session?.user || null });
    if (session?.user) {
      get().fetchProfile();
    } else {
      set({ profile: null });
    }
  },
  fetchProfile: async () => {
    const user = get().user;
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (!error && data) {
        set({ profile: data });
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },
}));
