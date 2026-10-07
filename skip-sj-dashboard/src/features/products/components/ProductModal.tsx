import React, { useState, useEffect } from "react";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import type { CategoriaMenu, Producto, ProductoFormData } from "../types";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProductoFormData, id?: string) => Promise<boolean>;
  producto?: Producto | null;
  categorias: CategoriaMenu[];
  locatarioId: string;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  producto,
  categorias,
}) => {
  const [formData, setFormData] = useState<ProductoFormData>({
    nombre_producto: "",
    descripcion: "",
    precio: 0,
    categoria_id: "",
    stock_diario: "",
    imagen_url: "",
    disponible: true,
  });

  const [imageError, setImageError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre_producto: producto.nombre_producto || "",
        descripcion: producto.descripcion || "",
        precio: producto.precio || 0,
        categoria_id: producto.categoria_id || (categorias[0]?.id ?? ""),
        stock_diario: producto.stock_diario !== null && producto.stock_diario !== undefined ? producto.stock_diario : "",
        imagen_url: producto.imagen_url || "",
        disponible: producto.disponible ?? true,
      });
    } else {
      setFormData({
        nombre_producto: "",
        descripcion: "",
        precio: 0,
        categoria_id: categorias[0]?.id || "",
        stock_diario: "",
        imagen_url: "",
        disponible: true,
      });
    }
    setImageError(false);
    setErrorMsg("");
  }, [producto, categorias, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre_producto.trim()) {
      setErrorMsg("El nombre del producto es obligatorio.");
      return;
    }
    if (formData.precio <= 0) {
      setErrorMsg("El precio debe ser mayor a 0 CLP.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const success = await onSave(formData, producto?.id);
    setIsSubmitting(false);

    if (success) {
      onClose();
    } else {
      setErrorMsg("Hubo un error al guardar el producto. Revisa la conexión o permisos.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              {producto ? "Editar Producto" : "Nuevo Producto"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {producto
                ? "Modifica los datos del producto existente en el catálogo"
                : "Agrega un nuevo producto al catálogo de tu local"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          {/* Nombre y Categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Nombre del Producto *
              </label>
              <input
                type="text"
                required
                value={formData.nombre_producto}
                onChange={(e) => setFormData({ ...formData, nombre_producto: e.target.value })}
                placeholder="Ej. Empanada de Pino"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Categoría
              </label>
              <select
                value={formData.categoria_id}
                onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Sin categoría</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Descripción
            </label>
            <textarea
              rows={2}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Detalles sobre ingredientes, tamaño o preparación..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>

          {/* Precio y Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Precio (CLP) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-medium text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={formData.precio || ""}
                  onChange={(e) => setFormData({ ...formData, precio: parseInt(e.target.value) || 0 })}
                  placeholder="2500"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Stock Diario (Opcional)
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock_diario}
                onChange={(e) => setFormData({ ...formData, stock_diario: e.target.value === "" ? "" : parseInt(e.target.value) })}
                placeholder="Ilimitado o unidades"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Imagen URL y Vista Previa */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              URL de Imagen (Unsplash, CDN o imagen directa)
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="url"
                value={formData.imagen_url}
                onChange={(e) => {
                  setFormData({ ...formData, imagen_url: e.target.value });
                  setImageError(false);
                }}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <div className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                {formData.imagen_url && !imageError ? (
                  <img
                    src={formData.imagen_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <ImageIcon className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </div>
          </div>

          {/* Disponibilidad */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                Disponibilidad Inmediata
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Si está desmarcado, el producto aparecerá como "Agotado" en la app de alumnos.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.disponible}
                onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {producto ? "Guardar Cambios" : "Crear Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
