export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          rut: string | null;
          p_nombre: string | null;
          s_nombre: string | null;
          apellido_p: string | null;
          apellido_m: string | null;
          email: string;
          rol: string;
          push_token: string | null;
          apodo: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          rut?: string | null;
          p_nombre?: string | null;
          s_nombre?: string | null;
          apellido_p?: string | null;
          apellido_m?: string | null;
          email: string;
          rol: string;
          push_token?: string | null;
          apodo?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          rut?: string | null;
          p_nombre?: string | null;
          s_nombre?: string | null;
          apellido_p?: string | null;
          apellido_m?: string | null;
          email?: string;
          rol?: string;
          push_token?: string | null;
          apodo?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      locatarios: {
        Row: {
          id: string;
          nombre: string;
          tipo: string;
          usuario_admin_id: string | null;
          activo: boolean;
          capacidad_max_hora: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          tipo: string;
          usuario_admin_id?: string | null;
          activo: boolean;
          capacidad_max_hora: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          tipo?: string;
          usuario_admin_id?: string | null;
          activo?: boolean;
          capacidad_max_hora?: number;
          created_at?: string;
        };
      };
      pedidos: {
        Row: {
          id: string;
          usuario_id: string;
          locatario_id: string;
          franja_horaria_id: string;
          estado: string;
          metodo_pago: string;
          monto_total: number;
          hora_retiro_estimada: string | null;
          codigo_retiro: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          locatario_id: string;
          franja_horaria_id: string;
          estado: string;
          metodo_pago: string;
          monto_total: number;
          hora_retiro_estimada?: string | null;
          codigo_retiro?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          locatario_id?: string;
          franja_horaria_id?: string;
          estado?: string;
          metodo_pago?: string;
          monto_total?: number;
          hora_retiro_estimada?: string | null;
          codigo_retiro?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pedido_items: {
        Row: {
          id: string;
          pedido_id: string;
          producto_id: string;
          cantidad: number;
          precio_unitario: number;
          subtotal: number;
          modificadores_seleccionados: Json | null;
        };
        Insert: {
          id?: string;
          pedido_id: string;
          producto_id: string;
          cantidad: number;
          precio_unitario: number;
          subtotal: number;
          modificadores_seleccionados?: Json | null;
        };
        Update: {
          id?: string;
          pedido_id?: string;
          producto_id?: string;
          cantidad?: number;
          precio_unitario?: number;
          subtotal?: number;
          modificadores_seleccionados?: Json | null;
        };
      };
      productos: {
        Row: {
          id: string;
          locatario_id: string;
          categoria_id: string;
          nombre_producto: string;
          descripcion: string | null;
          precio: number;
          imagen_url: string | null;
          disponible: boolean;
          stock_diario: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          locatario_id: string;
          categoria_id: string;
          nombre_producto: string;
          descripcion?: string | null;
          precio: number;
          imagen_url?: string | null;
          disponible: boolean;
          stock_diario?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          locatario_id?: string;
          categoria_id?: string;
          nombre_producto?: string;
          descripcion?: string | null;
          precio?: number;
          imagen_url?: string | null;
          disponible?: boolean;
          stock_diario?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categorias_menu: {
        Row: {
          id: string;
          locatario_id: string;
          nombre: string;
          orden: number;
        };
        Insert: {
          id?: string;
          locatario_id: string;
          nombre: string;
          orden: number;
        };
        Update: {
          id?: string;
          locatario_id?: string;
          nombre?: string;
          orden?: number;
        };
      };
      franjas_horarias: {
        Row: {
          id: string;
          locatario_id: string;
          hora_inicio: string;
          hora_fin: string;
          capacidad_pedidos: number;
        };
        Insert: {
          id?: string;
          locatario_id: string;
          hora_inicio: string;
          hora_fin: string;
          capacidad_pedidos: number;
        };
        Update: {
          id?: string;
          locatario_id?: string;
          hora_inicio?: string;
          hora_fin?: string;
          capacidad_pedidos?: number;
        };
      };
      favoritos: {
        Row: {
          id: string;
          usuario_id: string;
          producto_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          producto_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          producto_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
