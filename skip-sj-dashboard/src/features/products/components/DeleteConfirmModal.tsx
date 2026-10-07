import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { Producto } from "../types";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  producto: Producto | null;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  producto,
  isDeleting,
}) => {
  if (!isOpen || !producto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              ¿Eliminar producto?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
          ¿Estás seguro de que deseas eliminar permanentemente{" "}
          <strong className="text-slate-900 dark:text-white font-semibold">
            "{producto.nombre_producto}"
          </strong>{" "}
          del catálogo?
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md shadow-red-500/20 flex items-center gap-2 transition disabled:opacity-50"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
};
