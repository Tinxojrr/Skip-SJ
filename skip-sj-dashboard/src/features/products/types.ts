export interface CategoriaMenu {
  id: string;
  locatario_id: string;
  nombre: string;
  orden: number;
}

export interface Producto {
  id: string;
  locatario_id: string;
  categoria_id: string | null;
  nombre_producto: string;
  descripcion: string | null;
  precio: number;
  imagen_url: string | null;
  disponible: boolean;
  stock_diario: number | null;
  created_at?: string;
  updated_at?: string;
  categoria?: {
    id: string;
    nombre: string;
  } | null;
}

export interface ProductoFormData {
  nombre_producto: string;
  descripcion: string;
  precio: number;
  categoria_id: string;
  stock_diario: number | string;
  imagen_url: string;
  disponible: boolean;
}

export interface Locatario {
  id: string;
  nombre: string;
  tipo: string;
}
