import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  Filter,
  Package,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Tag,
  Store,
  LayoutGrid,
  List,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import type { CategoriaMenu, Locatario, Producto, ProductoFormData } from "./types";
import { ProductModal } from "./components/ProductModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { CategoryModal } from "./components/CategoryModal";

export const ProductsPage: React.FC = () => {
  const { locatarioId: authLocatarioId, role } = useAuth();

  // Estados de datos
  const [locales, setLocales] = useState<Locatario[]>([]);
  const [selectedLocatarioId, setSelectedLocatarioId] = useState<string>("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Filtros y vista
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "unavailable">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modales
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Producto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // 1. Cargar lista de Locatarios
  useEffect(() => {
    const fetchLocatarios = async () => {
      const { data, error } = await supabase
        .from("locatarios")
        .select("id, nombre, tipo")
        .order("nombre");

      if (!error && data) {
        setLocales(data);
        if (authLocatarioId) {
          setSelectedLocatarioId(authLocatarioId);
        } else if (data.length > 0) {
          setSelectedLocatarioId(data[0].id);
        }
      }
    };
    fetchLocatarios();
  }, [authLocatarioId]);

  // Si cambia el locatario en AuthContext (por el Header), sincronizar
  useEffect(() => {
    if (authLocatarioId) {
      setSelectedLocatarioId(authLocatarioId);
    }
  }, [authLocatarioId]);

  // 2. Cargar Categorías y Productos del local activo
  const loadData = useCallback(async () => {
    if (!selectedLocatarioId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      // Cargar categorías
      const { data: catData, error: catError } = await supabase
        .from("categorias_menu")
        .select("*")
        .eq("locatario_id", selectedLocatarioId)
        .order("orden", { ascending: true });

      if (catError) console.error("Error categorías:", catError);
      setCategorias(catData || []);

      // Cargar productos con su categoría
      const { data: prodData, error: prodError } = await supabase
        .from("productos")
        .select(`
          id,
          locatario_id,
          categoria_id,
          nombre_producto,
          descripcion,
          precio,
          imagen_url,
          disponible,
          stock_diario,
          created_at,
          updated_at,
          categoria:categorias_menu (
            id,
            nombre
          )
        `)
        .eq("locatario_id", selectedLocatarioId)
        .order("nombre_producto", { ascending: true });

      if (prodError) throw prodError;
      // Normalizar respuesta si categoria viene como array o single object
      const normalizedProds = (prodData || []).map((p: any) => ({
        ...p,
        categoria: Array.isArray(p.categoria) ? p.categoria[0] : p.categoria,
      }));
      setProductos(normalizedProds);
    } catch (err: any) {
      console.error("Error al cargar productos:", err);
      showFeedback("error", "Error al cargar productos desde la base de datos.");
    } finally {
      setLoading(false);
    }
  }, [selectedLocatarioId]);

  useEffect(() => {
    loadData();

    if (!selectedLocatarioId) return;

    // Suscripción Realtime a cambios en productos de este local
    const channel = supabase
      .channel(`productos-${selectedLocatarioId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "productos",
          filter: `locatario_id=eq.${selectedLocatarioId}`,
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedLocatarioId, loadData]);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  // Crear o Editar Producto
  const handleSaveProduct = async (
    formData: ProductoFormData,
    productId?: string
  ): Promise<boolean> => {
    try {
      const payload = {
        locatario_id: selectedLocatarioId,
        categoria_id: formData.categoria_id || null,
        nombre_producto: formData.nombre_producto.trim(),
        descripcion: formData.descripcion.trim() || null,
        precio: Number(formData.precio),
        stock_diario:
          formData.stock_diario === "" || formData.stock_diario === null
            ? null
            : Number(formData.stock_diario),
        imagen_url: formData.imagen_url.trim() || null,
        disponible: Boolean(formData.disponible),
        updated_at: new Date().toISOString(),
      };

      if (productId) {
        // Actualizar
        const { error } = await supabase
          .from("productos")
          .update(payload)
          .eq("id", productId);

        if (error) throw error;
        showFeedback("success", `Producto "${formData.nombre_producto}" actualizado exitosamente.`);
      } else {
        // Crear
        const { error } = await supabase.from("productos").insert([payload]);
        if (error) throw error;
        showFeedback("success", `Producto "${formData.nombre_producto}" creado en el catálogo.`);
      }

      await loadData();
      return true;
    } catch (err: any) {
      console.error("Error al guardar producto:", err);
      showFeedback(
        "error",
        err.message || "Error al guardar el producto. Revisa los permisos en Supabase (RLS)."
      );
      return false;
    }
  };

  // Toggle Rápido de Disponibilidad
  const handleToggleDisponibilidad = async (producto: Producto) => {
    const nuevoEstado = !producto.disponible;
    // Actualización optimista en UI
    setProductos((prev) =>
      prev.map((p) => (p.id === producto.id ? { ...p, disponible: nuevoEstado } : p))
    );

    try {
      const { error } = await supabase
        .from("productos")
        .update({ disponible: nuevoEstado, updated_at: new Date().toISOString() })
        .eq("id", producto.id);

      if (error) throw error;
      showFeedback(
        "success",
        `"${producto.nombre_producto}" marcado como ${nuevoEstado ? "disponible" : "agotado"}.`
      );
    } catch (err: any) {
      console.error("Error al actualizar disponibilidad:", err);
      // Revertir optimismo
      setProductos((prev) =>
        prev.map((p) => (p.id === producto.id ? { ...p, disponible: !nuevoEstado } : p))
      );
      showFeedback("error", "No se pudo actualizar el estado de disponibilidad.");
    }
  };

  // Eliminar Producto
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("productos")
        .delete()
        .eq("id", productToDelete.id);

      if (error) throw error;

      showFeedback(
        "success",
        `Producto "${productToDelete.nombre_producto}" eliminado del catálogo.`
      );
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      await loadData();
    } catch (err: any) {
      console.error("Error al eliminar producto:", err);
      showFeedback("error", "Error al eliminar el producto. Verifica dependencias o permisos.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Crear Categoría
  const handleSaveCategory = async (nombre: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("categorias_menu").insert([
        {
          locatario_id: selectedLocatarioId,
          nombre,
          orden: categorias.length + 1,
        },
      ]);

      if (error) throw error;
      showFeedback("success", `Categoría "${nombre}" agregada con éxito.`);
      await loadData();
      return true;
    } catch (err: any) {
      console.error("Error al crear categoría:", err);
      showFeedback("error", "Error al crear la categoría.");
      return false;
    }
  };

  // Filtrado de productos en memoria
  const filteredProducts = useMemo(() => {
    return productos.filter((p) => {
      const matchesSearch =
        p.nombre_producto.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategoryFilter === "all" || p.categoria_id === selectedCategoryFilter;

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && p.disponible) ||
        (availabilityFilter === "unavailable" && !p.disponible);

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [productos, searchQuery, selectedCategoryFilter, availabilityFilter]);

  // Métricas calculadas
  const metrics = useMemo(() => {
    const total = productos.length;
    const disponibles = productos.filter((p) => p.disponible).length;
    const agotados = total - disponibles;
    const precioPromedio =
      total > 0 ? Math.round(productos.reduce((acc, p) => acc + p.precio, 0) / total) : 0;
    return { total, disponibles, agotados, precioPromedio };
  }, [productos]);

  const activeLocalName = locales.find((l) => l.id === selectedLocatarioId)?.nombre || "Local";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border text-sm font-medium transition-all transform animate-bounce ${
            feedbackMessage.type === "success"
              ? "bg-emerald-500 text-white border-emerald-400"
              : "bg-red-500 text-white border-red-400"
          }`}
        >
          {feedbackMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Header Superior y Controles de Local */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-md shadow-blue-500/20">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 dark:text-white">
                Catálogo de Productos & Menú
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Administra los precios, disponibilidad y stock diario de{" "}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {activeLocalName}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Acciones principales y Selector de Local */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de local si no tiene uno forzado o es admin */}
          {locales.length > 0 && (!authLocatarioId || role === "super_admin") && (
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <Store className="w-4 h-4 ml-1.5 text-slate-500" />
              <select
                value={selectedLocatarioId}
                onChange={(e) => setSelectedLocatarioId(e.target.value)}
                className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none pr-3 py-1 cursor-pointer"
              >
                {locales.map((loc) => (
                  <option key={loc.id} value={loc.id} className="dark:bg-slate-900">
                    {loc.nombre} ({loc.tipo})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold flex items-center gap-2 transition"
          >
            <Tag className="w-4 h-4 text-blue-500" />
            <span className="hidden sm:inline">Nueva</span> Categoría
          </button>

          <button
            onClick={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-md shadow-blue-500/25 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Producto</span>
          </button>
        </div>
      </div>

      {/* Ribbon de Métricas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Productos</p>
            <h4 className="text-xl font-bold text-slate-800 dark:text-white">{metrics.total}</h4>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Disponibles</p>
            <h4 className="text-xl font-bold text-slate-800 dark:text-white">
              {metrics.disponibles}
            </h4>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-4">
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Agotados</p>
            <h4 className="text-xl font-bold text-slate-800 dark:text-white">{metrics.agotados}</h4>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Precio Promedio</p>
            <h4 className="text-xl font-bold text-slate-800 dark:text-white">
              ${metrics.precioPromedio.toLocaleString("es-CL")}
            </h4>
          </div>
        </div>
      </div>

      {/* Barra de Filtros, Búsqueda y Switch de Vista */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o descripción..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Filtro de Categoría */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las categorías ({productos.length})</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Disponibilidad */}
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="available">Solo disponibles</option>
            <option value="unavailable">Solo agotados</option>
          </select>
        </div>

        {/* Modos de vista y recarga */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={loadData}
            title="Recargar catálogo"
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-500" : ""}`} />
          </button>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
              title="Vista en cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
              title="Vista en tabla"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenido Principal: Listado de Productos */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
          <p className="text-sm">Cargando catálogo de productos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
            No se encontraron productos
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            {searchQuery || selectedCategoryFilter !== "all" || availabilityFilter !== "all"
              ? "Prueba a cambiar los filtros o el término de búsqueda."
              : `Este local aún no tiene productos registrados. ¡Comienza agregando el primero!`}
          </p>
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold inline-flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            Crear Producto
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* VISTA GRID (TARJETAS) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((producto) => (
            <div
              key={producto.id}
              className={`group bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border transition-all duration-300 hover:shadow-xl flex flex-col overflow-hidden ${
                producto.disponible
                  ? "border-slate-200/50 dark:border-slate-700/50 hover:border-blue-500/50"
                  : "border-red-200/50 dark:border-red-900/30 opacity-80"
              }`}
            >
              {/* Imagen del producto */}
              <div className="relative h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                {producto.imagen_url ? (
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre_producto}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                    <Package className="w-12 h-12" />
                  </div>
                )}

                {/* Badge de Categoría */}
                {producto.categoria && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-lg bg-black/60 backdrop-blur-md text-white shadow-xs">
                    {producto.categoria.nombre}
                  </span>
                )}

                {/* Badge de Estado */}
                <span
                  className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-lg backdrop-blur-md shadow-xs flex items-center gap-1.5 ${
                    producto.disponible
                      ? "bg-emerald-500/90 text-white"
                      : "bg-red-500/90 text-white"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  {producto.disponible ? "Disponible" : "Agotado"}
                </span>
              </div>

              {/* Información */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-800 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {producto.nombre_producto}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                    {producto.descripcion || "Sin descripción detallada."}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-black text-slate-900 dark:text-white">
                      ${producto.precio.toLocaleString("es-CL")}
                    </div>
                    {producto.stock_diario !== null && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Stock: {producto.stock_diario} u.
                      </span>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    {/* Botón rápido toggle disponibilidad */}
                    <button
                      onClick={() => handleToggleDisponibilidad(producto)}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                        producto.disponible
                          ? "bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                      }`}
                      title="Cambiar disponibilidad"
                    >
                      {producto.disponible ? "Pausar" : "Activar"}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingProduct(producto);
                          setIsProductModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        title="Editar producto"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setProductToDelete(producto);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VISTA TABLA */
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">Producto</th>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4">Precio</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Disponibilidad</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800 text-sm">
                {filteredProducts.map((producto) => (
                  <tr
                    key={producto.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                          {producto.imagen_url ? (
                            <img
                              src={producto.imagen_url}
                              alt={producto.nombre_producto}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {producto.nombre_producto}
                          </p>
                          {producto.descripcion && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs">
                              {producto.descripcion}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {producto.categoria?.nombre || "Sin categoría"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white">
                      ${producto.precio.toLocaleString("es-CL")}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {producto.stock_diario !== null ? `${producto.stock_diario} u.` : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleDisponibilidad(producto)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
                          producto.disponible
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            producto.disponible ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />
                        {producto.disponible ? "Disponible" : "Agotado"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(producto);
                            setIsProductModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setProductToDelete(producto);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modales */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        producto={editingProduct}
        categorias={categorias}
        locatarioId={selectedLocatarioId}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        producto={productToDelete}
        isDeleting={isDeleting}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
      />
    </div>
  );
};
export default ProductsPage;
