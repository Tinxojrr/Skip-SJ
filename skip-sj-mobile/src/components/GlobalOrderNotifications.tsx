import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Vibration,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Bell,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  X,
  ChevronRight,
} from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export interface OrderNotificationData {
  id: string;
  pedidoId: string;
  codigoRetiro: string;
  estado: string;
  titulo: string;
  mensaje: string;
  tipo: 'en_preparacion' | 'listo_retiro' | 'completado';
}

export function GlobalOrderNotifications() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, setSession } = useAuthStore();
  const [currentNotif, setCurrentNotif] = useState<OrderNotificationData | null>(null);

  // Animación de entrada y salida vertical para el Toast interno
  const translateY = useRef(new Animated.Value(-160)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Asegurar restauración de sesión Supabase al iniciar
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (currentSession) {
        setSession(currentSession);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession]);

  // Función para cerrar la notificación con animación
  const dismissNotification = useCallback(() => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -160,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentNotif(null);
    });
  }, [opacity, translateY]);

  // Función para disparar la notificación en pantalla, con alerta nativa y vibración
  const triggerNotification = useCallback(
    (notif: OrderNotificationData) => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }

      setCurrentNotif(notif);

      // 1. Vibración física en dispositivo
      try {
        if (Platform.OS === 'android' || Platform.OS === 'ios') {
          if (notif.tipo === 'listo_retiro') {
            Vibration.vibrate([0, 500, 200, 500, 200, 600]);
          } else if (notif.tipo === 'completado') {
            Vibration.vibrate([0, 400, 150, 400]);
          } else {
            Vibration.vibrate(350);
          }
        }
      } catch (err) {
        console.warn('Vibration API no disponible:', err);
      }

      // 2. Alerta Nativa emergente del Sistema Operativo
      try {
        Alert.alert(
          notif.titulo,
          notif.mensaje,
          [
            {
              text: 'Ver Pedido',
              onPress: () => {
                dismissNotification();
                router.push('/history');
              },
            },
            {
              text: 'OK',
              style: 'cancel',
              onPress: () => dismissNotification(),
            },
          ],
          { cancelable: true }
        );
      } catch (e) {
        console.warn('Error mostrando Alert nativo:', e);
      }

      // 3. Animación de entrada para el Toast visual en pantalla
      translateY.setValue(-160);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-descartar después de 8 segundos
      dismissTimer.current = setTimeout(() => {
        dismissNotification();
      }, 8000);
    },
    [dismissNotification, opacity, router, translateY]
  );

  // 2. Suscripción Global a cambios de pedidos en Tiempo Real vía Supabase WebSocket
  useEffect(() => {
    const channelName = `global-orders-${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pedidos',
        },
        (payload: any) => {
          const updatedOrder = payload.new;
          if (!updatedOrder) return;

          console.log('[NOTIF REALTIME] Pedido actualizado recibido:', {
            codigo: updatedOrder.codigo_retiro,
            estado: updatedOrder.estado,
            usuario_id: updatedOrder.usuario_id,
            mi_usuario_id: session?.user?.id,
          });

          // Verificar si el pedido pertenece al usuario logueado o si coincide con la sesión
          const currentUserId = session?.user?.id;
          const isUserOrder = currentUserId
            ? updatedOrder.usuario_id === currentUserId
            : true;

          if (!isUserOrder) {
            console.log('[NOTIF REALTIME] Ignorado por pertenecer a otro usuario');
            return;
          }

          const codigo = updatedOrder.codigo_retiro || 'SJ-000';
          const estado = updatedOrder.estado;

          if (estado === 'listo_retiro') {
            triggerNotification({
              id: `${updatedOrder.id}-listo`,
              pedidoId: updatedOrder.id,
              codigoRetiro: codigo,
              estado,
              tipo: 'listo_retiro',
              titulo: '🎉 ¡Tu pedido está listo para retiro!',
              mensaje: `Pasa al mesón con tu código ${codigo} para retirar tu comida.`,
            });
          } else if (estado === 'completado') {
            triggerNotification({
              id: `${updatedOrder.id}-completado`,
              pedidoId: updatedOrder.id,
              codigoRetiro: codigo,
              estado,
              tipo: 'completado',
              titulo: '✅ ¡Pedido retirado exitosamente!',
              mensaje: `Tu pedido #${codigo} ha sido entregado en mesón. ¡Buen provecho!`,
            });
          } else if (estado === 'en_preparacion') {
            triggerNotification({
              id: `${updatedOrder.id}-cocina`,
              pedidoId: updatedOrder.id,
              codigoRetiro: codigo,
              estado,
              tipo: 'en_preparacion',
              titulo: '👨‍🍳 Pedido en preparación',
              mensaje: `La cocina está preparando tu pedido #${codigo}. Te avisaremos apenas esté listo.`,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('[NOTIF REALTIME] Estado canal:', status);
      });

    return () => {
      supabase.removeChannel(channel);
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }
    };
  }, [session?.user?.id, triggerNotification]);

  if (!currentNotif) return null;

  // Colores e íconos dinámicos según estado
  let iconComponent = <Bell size={20} color="#FFFFFF" />;
  let accentColor = '#3B82F6';
  let badgeBg = '#1E3A8A';

  if (currentNotif.tipo === 'listo_retiro') {
    iconComponent = <PackageCheck size={22} color="#FFFFFF" />;
    accentColor = '#10B981';
    badgeBg = '#064E3B';
  } else if (currentNotif.tipo === 'completado') {
    iconComponent = <CheckCircle2 size={22} color="#FFFFFF" />;
    accentColor = '#22C55E';
    badgeBg = '#14532D';
  } else if (currentNotif.tipo === 'en_preparacion') {
    iconComponent = <ChefHat size={22} color="#FFFFFF" />;
    accentColor = '#F59E0B';
    badgeBg = '#78350F';
  }

  const handlePress = () => {
    dismissNotification();
    router.push('/history');
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: Math.max(insets.top + 8, 16),
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={handlePress}
        style={[
          styles.card,
          {
            borderLeftColor: accentColor,
          },
        ]}
      >
        <View style={styles.contentRow}>
          {/* Ícono de Estado */}
          <View style={[styles.iconWrapper, { backgroundColor: accentColor }]}>
            {iconComponent}
          </View>

          {/* Textos */}
          <View style={styles.textWrapper}>
            <View style={styles.headerRow}>
              <Text style={styles.title} numberOfLines={1}>
                {currentNotif.titulo}
              </Text>
              <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                <Text style={styles.badgeText}>{currentNotif.codigoRetiro}</Text>
              </View>
            </View>
            <Text style={styles.message} numberOfLines={2}>
              {currentNotif.mensaje}
            </Text>
          </View>

          {/* Botón Cerrar */}
          <TouchableOpacity
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={(e) => {
              e.stopPropagation();
              dismissNotification();
            }}
            style={styles.closeBtn}
          >
            <X size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Footer pequeño de acción */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Toca para ver el detalle de la comanda</Text>
          <ChevronRight size={13} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 99999,
    elevation: 99999,
  },
  card: {
    backgroundColor: '#18181B',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderLeftWidth: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  textWrapper: {
    flex: 1,
    paddingRight: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    flexShrink: 0,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  message: {
    fontSize: 11.5,
    color: '#D1D5DB',
    lineHeight: 16,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 4,
    marginLeft: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  footerText: {
    fontSize: 10.5,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
