import React, { useState } from "react";
import { X, Loader2, Tag } from "lucide-react";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nombre: string) => Promise<boolean>;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [nombre, setNombre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("El nombre de la categoría es obligatorio.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    const success = await onSave(nombre.trim());
    setIsSubmitting(false);

    if (success) {
      setNombre("");
      onClose();
    } else {
      setError("No se pudo crear la categoría.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Nueva Categoría de Menú
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organiza tus productos por secciones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Nombre de la Categoría *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Bebidas calientes, Sandwiches, Menú Ejecutivo..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Crear Categoría
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
