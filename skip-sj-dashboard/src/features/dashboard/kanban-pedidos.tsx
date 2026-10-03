import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import './kanban-pedidos.css';

type EstadoPedido = 'pendiente_pago' | 'pagado' | 'en_preparacion' | 'listo_retiro' | 'completado';

interface Pedido {
  id: string;
  estado: EstadoPedido;
  hora_retiro_estimada: string;
  monto_total: number;
  items_text?: string[]; // Simplificación para frontend
  cliente_nombre?: string;
}

export const KanbanBoard = () => {
  const { locatarioId, role } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [nombreLocal, setNombreLocal] = useState('Cargando local...');
  
  // 1. Obtener datos del Local
  useEffect(() => {
    if (locatarioId) {
      supabase.from('locatarios').select('nombre').eq('id', locatarioId).single()
        .then(({ data }) => {
          if (data) setNombreLocal(data.nombre);
        });
    } else if (role === 'super_admin') {
      setNombreLocal('Vista Global (Admin)');
    }
  }, [locatarioId, role]);

  // 2. Obtener Pedidos en Tiempo Real
  useEffect(() => {
    if (!locatarioId && role !== 'super_admin') return;

    const fetchPedidos = async () => {
      let query = supabase.from('pedidos').select('id, estado, hora_retiro_estimada, monto_total');
      if (role !== 'super_admin' && locatarioId) {
         query = query.eq('locatario_id', locatarioId);
      }
      
      const { data, error } = await query;
      if (!error && data) {
        // En una app real, haríamos un join con usuarios y pedido_items para obtener detalles.
        // Aquí simulamos esos datos para la vista rápida.
        const pedidosMapeados = data.map(p => ({
          ...p,
          items_text: ['Ver detalles en BD'],
          cliente_nombre: 'Alumno'
        }));
        setPedidos(pedidosMapeados as Pedido[]);
      }
    };

    fetchPedidos();

    // Suscripción a cambios
    const channel = supabase.channel('cambios-pedidos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, (payload) => {
        console.log('Cambio detectado:', payload);
        fetchPedidos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [locatarioId, role]);

  const obtenerPedidosPorEstado = (estado: EstadoPedido) => {
    return pedidos.filter(pedido => pedido.estado === estado);
  };

  const cambiarEstadoPedido = async (id: string, nuevoEstado: EstadoPedido) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: nuevoEstado })
      .eq('id', id);
      
    if (error) {
      console.error('Error actualizando pedido:', error);
      alert('Hubo un error al actualizar el pedido');
    }
  };

  const renderBotonesAccion = (pedido: Pedido) => {
    if (pedido.estado === 'pagado') {
      return (
        <button 
          onClick={() => cambiarEstadoPedido(pedido.id, 'en_preparacion')}
          style={{ width: '100%', marginTop: '10px', padding: '8px', backgroundColor: '#F5A623', color: '#0B2A6B', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', border: 'none' }}
        >
          Empezar a Preparar
        </button>
      );
    }
    if (pedido.estado === 'en_preparacion') {
      return (
        <button 
          onClick={() => cambiarEstadoPedido(pedido.id, 'listo_retiro')}
          style={{ width: '100%', marginTop: '10px', padding: '8px', backgroundColor: '#10B981', color: 'white', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', border: 'none' }}
        >
          Marcar Listo para Retiro
        </button>
      );
    }
    if (pedido.estado === 'listo_retiro') {
      return (
        <button 
          onClick={() => cambiarEstadoPedido(pedido.id, 'completado')}
          style={{ width: '100%', marginTop: '10px', padding: '8px', backgroundColor: '#6B7280', color: 'white', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', border: 'none' }}
        >
          Entregado (Ocultar)
        </button>
      );
    }
    return null;
  };

  const renderColumna = (titulo: string, estado: EstadoPedido) => {
    const pedidosColumna = obtenerPedidosPorEstado(estado);
    
    return (
      <div className="kanban-column">
        <div className="column-header">
          <span>{titulo}</span>
          <span className="badge">{pedidosColumna.length}</span>
        </div>
        
        {pedidosColumna.length === 0 && (
          <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '20px' }}>Sin pedidos</div>
        )}

        {pedidosColumna.map((pedido) => (
          <div key={pedido.id} className={`kanban-card ${estado}`}>
            <div className="order-header">
              <span className="order-id">#{pedido.id.substring(0,6)}</span>
              <span className="order-time">{pedido.hora_retiro_estimada ? new Date(pedido.hora_retiro_estimada).toLocaleTimeString() : 'Pronto'}</span>
            </div>
            <ul className="order-items">
              {pedido.items_text?.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
            <div className="client-name">👤 {pedido.cliente_nombre} - ${pedido.monto_total}</div>
            
            {/* Botones de Acción */}
            {renderBotonesAccion(pedido)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h2 style={{ marginLeft: '20px', color: '#fdfdfd' }}>Tablero de Pedidos - {nombreLocal}</h2>
      <div className="kanban-board">
        {renderColumna('Pagados / Entrantes', 'pagado')}
        {renderColumna('En preparación', 'en_preparacion')}
        {renderColumna('Listos para Retiro', 'listo_retiro')}
      </div>
    </div>
  );
};