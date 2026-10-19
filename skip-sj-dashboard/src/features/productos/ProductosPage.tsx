import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Package, Search, RefreshCw } from 'lucide-react';

interface Producto {
  id: string;
  nombre_producto: string;
  descripcion?: string;
  precio: number;
  disponible: boolean;
  stock_diario?: number;
  categoria_id?: string;
  categorias_menu?: {
    nombre: string;
  } | null;
}

export const ProductosPage = () => {
  const { locatarioId, nombreLocal, role } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchProductos = useCallback(async () => {
    if (!locatarioId && role !== 'super_admin') return;
    setLoading(true);

    try {
      let query = supabase
        .from('productos')
        .select(`
          id,
          nombre_producto,
          descripcion,
          precio,
          disponible,
          stock_diario,
          categoria_id,
          categorias_menu (
            nombre
          )
        `)
        .order('nombre_producto');

      if (role !== 'super_admin' && locatarioId) {
        query = query.eq('locatario_id', locatarioId);
      }

      const { data, error } = await query;
      if (!error && data) {
        setProductos(data as any as Producto[]);
      } else if (error) {
        console.error('Error cargando productos:', error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [locatarioId, role]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  const toggleDisponibilidad = async (id: string, estadoActual: boolean) => {
    setTogglingId(id);
    const nuevoEstado = !estadoActual;

    setProductos(prev => prev.map(p => p.id === id ? { ...p, disponible: nuevoEstado } : p));

    const { error } = await supabase
      .from('productos')
      .update({ disponible: nuevoEstado })
      .eq('id', id);

    setTogglingId(null);

    if (error) {
      console.error('Error actualizando disponibilidad:', error);
      setProductos(prev => prev.map(p => p.id === id ? { ...p, disponible: estadoActual } : p));
      alert('No se pudo actualizar el estado del producto');
    }
  };

  const productosFiltrados = productos.filter(p => 
    p.nombre_producto.toLowerCase().includes(search.toLowerCase()) ||
    p.categorias_menu?.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111116] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#F5A623]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Gestión de Carta &bull; {nombreLocal || 'Mi Local'}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white mt-1">
            Carta de Productos
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Activa o pausa productos en tiempo real según el stock de cocina
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text"
              placeholder="Buscar producto o categoría..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 w-56 font-medium"
            />
          </div>
          <button 
            onClick={fetchProductos}
            className="p-2 text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition border border-zinc-200 dark:border-zinc-700/60"
            title="Refrescar"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-[#111116] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-zinc-400 text-xs">
            <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-[#F5A623]" />
            <span>Cargando productos del local...</span>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-xs">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">No se encontraron productos</p>
            <p className="text-zinc-400 mt-0.5">Prueba cambiando los términos de búsqueda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  <th className="p-3.5 pl-5">Producto</th>
                  <th className="p-3.5">Categoría</th>
                  <th className="p-3.5">Precio</th>
                  <th className="p-3.5">Estado en App</th>
                  <th className="p-3.5 pr-5 text-right">Acción Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {productosFiltrados.map((prod) => (
                  <tr key={prod.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition">
                    <td className="p-3.5 pl-5">
                      <div className="font-bold text-zinc-900 dark:text-white">
                        {prod.nombre_producto}
                      </div>
                      {prod.descripcion && (
                        <p className="text-[11px] text-zinc-400 max-w-sm truncate mt-0.5">
                          {prod.descripcion}
                        </p>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60">
                        {prod.categorias_menu?.nombre || 'General'}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-zinc-900 dark:text-zinc-200">
                      ${prod.precio.toLocaleString('es-CL')}
                    </td>
                    <td className="p-3.5">
                      {prod.disponible ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Disponible para venta
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          Agotado / Pausado
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        onClick={() => toggleDisponibilidad(prod.id, prod.disponible)}
                        disabled={togglingId === prod.id}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition disabled:opacity-50 ${
                          prod.disponible
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                        }`}
                      >
                        {prod.disponible ? 'Pausar (Agotar)' : 'Activar Producto'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductosPage;
