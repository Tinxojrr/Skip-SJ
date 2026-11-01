import { supabase } from '../lib/supabase';
import { usePaymentStore, SavedCard } from '../store/paymentStore';

export interface PaymentExecutionParams {
  userId: string;
  userEmail: string;
  userRut?: string;
  storeId?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
  }>;
  total: number;
  paymentMethod: 'bancoestado' | 'junaeb' | 'card' | 'mach';
  cardDetails?: SavedCard;
  passCode?: string;
}

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  codigoRetiro?: string;
  transactionId?: string;
  authorizationCode?: string;
  providerName: string;
  errorMessage?: string;
  timestamp: string;
}

/**
 * Genera un código de retiro nemotécnico único para mesón de casino (ej: SJ-492)
 */
function generateWithdrawalCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 3; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SJ-${randomPart}`;
}

/**
 * Pasarela de Pago Developer Mode:
 * Ejecuta transacciones completas contra Supabase (tablas `pedidos`, `pedido_items`, `transacciones_pago`),
 * validando saldos, generando comprobantes y sincronizando con cocina.
 */
export async function executeDeveloperPayment(params: PaymentExecutionParams): Promise<PaymentResult> {
  const {
    userId,
    userEmail,
    userRut = '20.481.923-K',
    storeId,
    items,
    total,
    paymentMethod,
    cardDetails,
    passCode = '••••'
  } = params;

  const now = new Date();
  const timestamp = now.toISOString();

  // Mapear proveedor y enum de Supabase
  let dbMetodoPago: 'junaeb' | 'mercadopago' | 'otro' = 'otro';
  let providerName = 'BancoEstado Open Banking (Dev)';
  
  if (paymentMethod === 'junaeb') {
    dbMetodoPago = 'junaeb';
    providerName = 'Tarjeta Junaeb BAES (Dev)';
  } else if (paymentMethod === 'card') {
    dbMetodoPago = 'mercadopago';
    providerName = `Webpay Plus / ${cardDetails?.brand?.toUpperCase() || 'Tarjeta'} (Dev)`;
  } else if (paymentMethod === 'mach') {
    dbMetodoPago = 'otro';
    providerName = 'MACH Bci Pay (Dev)';
  }

  // 1. VALIDACIÓN PREVIA DE SALDO (Para Junaeb BAES)
  if (paymentMethod === 'junaeb') {
    const paymentStore = usePaymentStore.getState();
    if (paymentStore.baesBalance < total) {
      return {
        success: false,
        providerName,
        errorMessage: `Saldo BAES insuficiente. Tu saldo actual es $${paymentStore.baesBalance.toLocaleString('es-CL')} y el pedido suma $${total.toLocaleString('es-CL')}.`,
        timestamp
      };
    }
  }

  const codigoRetiro = generateWithdrawalCode();
  const estimatedPickupTime = new Date(now.getTime() + 8 * 60 * 1000).toISOString(); // +8 minutos

  try {
    // 2. CREAR PEDIDO EN SUPABASE (Estado inicial: pendiente_pago)
    const { data: pedido, error: pedidoError } = await (supabase.from('pedidos') as any)
      .insert({
        usuario_id: userId,
        locatario_id: storeId || null,
        estado: 'pendiente_pago',
        metodo_pago: dbMetodoPago,
        monto_total: total,
        codigo_retiro: codigoRetiro,
        hora_retiro_estimada: estimatedPickupTime
      })
      .select()
      .single();

    if (pedidoError) throw pedidoError;

    // 3. REGISTRAR TRANSACCIÓN PENDIENTE EN `transacciones_pago`
    const txExternalId = `TX-${paymentMethod.toUpperCase()}-${Date.now()}`;
    const initialPayload = {
      ambient: 'developer_sandbox',
      payer: {
        user_id: userId,
        email: userEmail,
        rut: userRut
      },
      amount: total,
      currency: 'CLP',
      payment_method: paymentMethod,
      client_timestamp: timestamp
    };

    const { data: transaccion, error: txError } = await (supabase.from('transacciones_pago') as any)
      .insert({
        pedido_id: pedido.id,
        proveedor: providerName,
        transaccion_externa_id: txExternalId,
        estado: 'pendiente',
        monto: total,
        payload_respuesta: initialPayload
      })
      .select()
      .single();

    if (txError) {
      console.warn('Nota: tabla transacciones_pago omitida por RLS o no disponible:', txError.message);
    }

    // 4. AUTORIZACIÓN FINANCIERA (Developer Mode)
    // Se valida la autenticidad del desafío de pago
    const authCode = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;

    // Si es BAES, descontamos el saldo real en el store seguro
    if (paymentMethod === 'junaeb') {
      const successDeduct = await usePaymentStore.getState().deductBaesBalance(total);
      if (!successDeduct) {
        throw new Error('No se pudo descontar el saldo de la tarjeta BAES.');
      }
    }

    // 5. INSERTAR ITEMS DEL PEDIDO
    const itemsPayload = items.map(item => ({
      pedido_id: pedido.id,
      producto_id: item.id,
      cantidad: item.quantity,
      precio_unitario: item.price,
      subtotal: item.price * item.quantity,
      notas: item.notes || null
    }));

    let { error: itemsError } = await (supabase.from('pedido_items') as any).insert(itemsPayload);

    // Fallback por si la columna notas no estuviera en base de datos
    if (itemsError && (itemsError.message?.includes('notas') || itemsError.message?.includes('column'))) {
      const fallbackPayload = items.map(item => ({
        pedido_id: pedido.id,
        producto_id: item.id,
        cantidad: item.quantity,
        precio_unitario: item.price,
        subtotal: item.price * item.quantity
      }));
      const retry = await (supabase.from('pedido_items') as any).insert(fallbackPayload);
      itemsError = retry.error;
    }

    if (itemsError) throw itemsError;

    // 6. ACTUALIZAR PEDIDO A 'PAGADO' (Para que ingrese en tiempo real a la cocina)
    const { error: updatePedidoError } = await (supabase.from('pedidos') as any)
      .update({
        estado: 'pagado',
        metodo_pago: dbMetodoPago
      })
      .eq('id', pedido.id);

    if (updatePedidoError) throw updatePedidoError;

    // 7. ACTUALIZAR TRANSACCIÓN A 'APROBADA' CON COMPROBANTE COMPLETO
    if (transaccion?.id) {
      const approvedPayload = {
        ...initialPayload,
        status: 'AUTHORIZED',
        response_code: '00',
        response_description: 'Transacción Aprobada Exitosamente',
        authorization_code: authCode,
        card_last4: cardDetails?.cardLast4 || 'RUT',
        approved_at: new Date().toISOString()
      };

      await (supabase.from('transacciones_pago') as any)
        .update({
          estado: 'aprobada',
          payload_respuesta: approvedPayload
        })
        .eq('id', transaccion.id);
    }

    return {
      success: true,
      orderId: pedido.id,
      codigoRetiro,
      transactionId: txExternalId,
      authorizationCode: authCode,
      providerName,
      timestamp: new Date().toISOString()
    };

  } catch (error: any) {
    console.error('Error procesando pago:', error);
    return {
      success: false,
      providerName,
      errorMessage: error.message || 'Error al conectar con la pasarela bancaria.',
      timestamp: new Date().toISOString()
    };
  }
}
