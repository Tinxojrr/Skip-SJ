import { useState } from 'react';
import './kanban-pedidos.css';

// 1. Definimos los tipos de datos para TypeScript
type EstadoPedido = 'entrante' | 'preparacion' | 'completado';

interface Pedido {
  id: string;
  tiempo: string;
  items: string[];
  cliente: string;
  estado: EstadoPedido;
}

// 2. Datos de prueba simulando lo que llegaría de la base de datos
const pedidosIniciales: Pedido[] = [
  { id: '1024', tiempo: 'Hace 2 min', items: ['2x Empanada de Queso', '1x Coca Cola Zero'], cliente: 'Martín P. (Retira)', estado: 'entrante' },
  { id: '1025', tiempo: 'Hace 1 min', items: ['1x Menú Junaeb (Pollo asado)'], cliente: 'Sofía L. (Mesa)', estado: 'entrante' },
  { id: '1021', tiempo: 'Hace 8 min', items: ['1x Completo Italiano', '1x Papas Fritas'], cliente: 'Diego A. (Retira)', estado: 'preparacion' },
  { id: '1019', tiempo: 'Hace 15 min', items: ['2x Café Latte', '1x Muffin'], cliente: 'Camila M. (Entregado ✅)', estado: 'completado' },
];

export const KanbanBoard = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>(pedidosIniciales);

  // Función auxiliar para filtrar pedidos por estado
  const obtenerPedidosPorEstado = (estado: EstadoPedido) => {
    return pedidos.filter(pedido => pedido.estado === estado);
  };

  // Función para renderizar una columna
  const renderColumna = (titulo: string, estado: EstadoPedido) => {
    const pedidosColumna = obtenerPedidosPorEstado(estado);
    
    return (
      <div className="kanban-column">
        <div className="column-header">
          <span>{titulo}</span>
          <span className="badge">{pedidosColumna.length}</span>
        </div>
        
        {pedidosColumna.map((pedido) => (
          <div key={pedido.id} className={`kanban-card ${estado}`}>
            <div className="order-header">
              <span className="order-id">#{pedido.id}</span>
              <span className="order-time">{pedido.tiempo}</span>
            </div>
            <ul className="order-items">
              {pedido.items.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
            <div className="client-name">👤 {pedido.cliente}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h2 style={{ marginLeft: '20px', color: '#fdfdfd' }}>Tablero de Pedidos - Casino Central</h2>
      <div className="kanban-board">
        {renderColumna('Pedido entrante', 'entrante')}
        {renderColumna('En preparación', 'preparacion')}
        {renderColumna('Completado', 'completado')}
      </div>
    </div>
  );
};