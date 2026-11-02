import React from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Check, Copy } from 'lucide-react';

interface PedidoItem {
  id?: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  notas?: string | null;
  productos?: {
    nombre_producto: string;
  } | null;
}

interface PedidoTicket {
  id: string;
  codigo_retiro?: string;
  estado: string;
  monto_total: number;
  created_at: string;
  metodo_pago?: string;
  usuarios?: {
    p_nombre?: string;
    apellido_p?: string;
    apodo?: string;
    email?: string;
  } | null;
  pedido_items?: PedidoItem[];
}

interface TicketTermicoModalProps {
  pedido: PedidoTicket;
  nombreLocal: string;
  onClose: () => void;
}

export const TicketTermicoModal: React.FC<TicketTermicoModalProps> = ({
  pedido,
  nombreLocal,
  onClose
}) => {
  const [copiado, setCopiado] = React.useState(false);

  const clienteNombre = pedido.usuarios
    ? (pedido.usuarios.apodo || `${pedido.usuarios.p_nombre || ''} ${pedido.usuarios.apellido_p || ''}`.trim() || pedido.usuarios.email || 'Alumno')
    : 'Alumno Duoc';

  const fechaFormateada = new Date(pedido.created_at).toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopiarTexto = () => {
    const itemsTexto = (pedido.pedido_items || [])
      .map(i => `- ${i.cantidad}x ${i.productos?.nombre_producto || 'Item'} (${i.notas ? 'Nota: ' + i.notas : ''})`)
      .join('\n');

    const texto = `=== SKIP DUOC UC - TICKET COMANDA ===\nLOCAL: ${nombreLocal}\nCÓDIGO: ${pedido.codigo_retiro || '----'}\nCLIENTE: ${clienteNombre}\nFECHA: ${fechaFormateada}\n\nITEMS:\n${itemsTexto}\n\nTOTAL: $${pedido.monto_total?.toLocaleString('es-CL')}\n====================================`;
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Botón de cierre de fondo */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
        {/* Acciones superiores fuera del ticket imprimible */}
        <div className="flex items-center justify-between w-full mb-3 px-1 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-zinc-300">Vista Previa Comanda POS</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-[#F5A623] border border-amber-500/30">
              80mm Térmico
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TICKET TÉRMICO FÍSICO */}
        <div 
          id="ticket-imprimible"
          className="w-full bg-[#FAF8F5] text-zinc-900 rounded-sm p-6 shadow-2xl font-mono text-xs border border-zinc-300 relative select-text"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, #FAF8F5, #FAF8F5 2px, #F5F2ED 2px, #F5F2ED 4px)'
          }}
        >
          {/* Sawtooth / Zigzag superior decorativo */}
          <div className="border-b-2 border-dashed border-zinc-400 pb-3 text-center space-y-1">
            <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-600">
              Duoc UC &bull; Sede San Joaquín
            </p>
            <h3 className="text-base font-black tracking-tight text-zinc-950">
              SKIP DUOC POS
            </h3>
            <p className="text-[11px] font-bold text-amber-700 uppercase">
              {nombreLocal || 'Casino San Joaquín'}
            </p>
            <p className="text-[9px] text-zinc-500 font-mono">
              Terminal POS #{pedido.id.substring(0, 8).toUpperCase()}
            </p>
          </div>

          {/* CÓDIGO DE RETIRO GIGANTE */}
          <div className="my-3 py-2.5 px-3 bg-zinc-950 text-white text-center rounded-sm">
            <p className="text-[9px] font-bold tracking-widest uppercase text-zinc-400">
              Código de Retiro
            </p>
            <p className="text-2xl font-black tracking-widest text-amber-400 my-0.5">
              {pedido.codigo_retiro || '----'}
            </p>
            <p className="text-[9px] text-zinc-400 uppercase">
              Validar en mesón al entregar
            </p>
          </div>

          {/* Datos del Pedido */}
          <div className="border-b border-dashed border-zinc-300 pb-2 mb-2 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-zinc-500">Fecha:</span>
              <span className="font-semibold">{fechaFormateada}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Cliente:</span>
              <span className="font-bold text-zinc-950 truncate max-w-[170px]">{clienteNombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Canal:</span>
              <span className="font-semibold text-emerald-700">App Móvil (Express)</span>
            </div>
          </div>

          {/* Lista de Productos de la Comanda */}
          <div className="py-2 border-b border-dashed border-zinc-400">
            <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase mb-2">
              <span>Cant &bull; Descripción</span>
              <span>Subtotal</span>
            </div>

            <div className="space-y-2.5">
              {(pedido.pedido_items || []).map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between items-start text-xs">
                    <span className="font-bold text-zinc-900 pr-2">
                      {item.cantidad}x {item.productos?.nombre_producto || 'Producto'}
                    </span>
                    <span className="font-bold whitespace-nowrap">
                      ${(item.subtotal || item.precio_unitario * item.cantidad).toLocaleString('es-CL')}
                    </span>
                  </div>
                  {item.notas && (
                    <p className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-semibold italic">
                      &gt;&gt; Nota: {item.notas}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Total & Pago */}
          <div className="pt-2.5 pb-2 border-b-2 border-dashed border-zinc-400 space-y-1 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal:</span>
              <span>${pedido.monto_total?.toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-zinc-950 pt-1">
              <span>TOTAL PAGADO:</span>
              <span className="text-base">${pedido.monto_total?.toLocaleString('es-CL')} CLP</span>
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 pt-1">
              <span>Estado Financiero:</span>
              <span className="font-bold text-emerald-700 uppercase">Aprobado / Pagado</span>
            </div>
          </div>

          {/* Código de Barras Decorativo 80mm */}
          <div className="pt-3 pb-1 text-center space-y-1">
            <div className="tracking-[0.25em] font-mono text-xl font-bold select-none text-zinc-800 scale-y-125">
              ||| | |||| | || ||||| | |||
            </div>
            <p className="text-[9px] text-zinc-500 font-mono tracking-widest">
              *{pedido.codigo_retiro || 'SKIP'}*
            </p>
          </div>

          {/* Mensaje de pie de ticket */}
          <div className="pt-2 text-center text-[9px] text-zinc-500 leading-tight">
            <p>¡Gracias por usar Skip Duoc UC!</p>
            <p>Retiro Express sin filas en Casino San Joaquín.</p>
          </div>
        </div>

        {/* Botones de Acción (Abajo) */}
        <div className="flex items-center gap-2 w-full mt-4 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#F5A623] hover:bg-amber-400 text-zinc-950 font-black text-xs transition shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Ticket POS</span>
          </button>

          <button
            onClick={handleCopiarTexto}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition border border-zinc-700 cursor-pointer"
            title="Copiar texto de comanda"
          >
            {copiado ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiado ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TicketTermicoModal;
