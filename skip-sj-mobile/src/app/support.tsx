import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../store/themeStore';
import { 
  ArrowLeft, 
  Mail, 
  FileWarning, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  FileText, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  Store,
  Sparkles,
  ExternalLink
} from 'lucide-react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
  id: number;
  pregunta: string;
  respuesta: string;
  categoria: 'retiro' | 'pago' | 'locales';
}

const FAQS: FAQItem[] = [
  {
    id: 1,
    categoria: 'retiro',
    pregunta: '¿Cómo funciona el retiro con el código de 4 caracteres?',
    respuesta: 'Al confirmar tu pedido, la app genera un código único de 4 caracteres (ej. B780). En el mismo instante, suena una campanilla en la cocina del local y tu pedido entra a preparación. Cuando esté listo, te acercas al mesón señalizado "SKIP Duoc UC - Retiro Exprés", dictas o muestras tu código y te entregan tu comida sin hacer fila.'
  },
  {
    id: 2,
    categoria: 'pago',
    pregunta: '¿Cuáles son los métodos de pago aceptados?',
    respuesta: 'Aceptamos transferencias automáticas directas vía Open Banking con los bancos chilenos más usados: BancoEstado (CuentaRUT), MACH, Santander, Banco de Chile, Falabella y Tenpo. También contamos con integración de saldo para Tarjeta Junaeb BAES (Sodexo / Edenred).'
  },
  {
    id: 3,
    categoria: 'retiro',
    pregunta: '¿Cuánto tiempo tengo para retirar mi pedido en el mesón?',
    respuesta: 'Tu pedido se mantendrá en condiciones óptimas de temperatura e higiene durante todo tu bloque de recreo (aproximadamente 25 a 30 minutos desde que pasa al estado "Listo para Retiro" en la pantalla de pedidos).'
  },
  {
    id: 4,
    categoria: 'locales',
    pregunta: '¿Qué pasa si un producto está agotado en el casino?',
    respuesta: 'Los locatarios tienen control de stock en tiempo real desde su Dashboard y pueden pausar productos agotados al instante. Si un producto se agota justo antes de preparar tu orden, el local te notificará de inmediato y podrás reasignar tu compra o solicitar reversa directa a través de nuestro soporte.'
  },
  {
    id: 5,
    categoria: 'locales',
    pregunta: '¿Dónde están ubicados los puntos de entrega en San Joaquín?',
    respuesta: 'En la sede San Joaquín de Duoc UC, los puntos de entrega están habilitados en el Casino Central y en los locales asociados (como Castaño y Achoclonado). Todos cuentan con señalética distintiva "SKIP Duoc UC" para atención prioritaria.'
  },
  {
    id: 6,
    categoria: 'pago',
    pregunta: '¿Puedo cancelar un pedido luego de haberlo pagado?',
    respuesta: 'Puedes cancelar tu orden sin costo siempre que permanezca en estado "Esperando al local". Una vez que el personal de cocina presiona "En Cocina", la comida entra en fase de cocción/ensamblado y ya no es posible cancelarla.'
  }
];

export default function SupportScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();

  const bg = isDarkMode ? '#09090B' : '#FAFAFA';
  const cardBg = isDarkMode ? '#18181B' : '#FFFFFF';
  const cardAlt = isDarkMode ? '#27272A' : '#F3F4F6';
  const textPrimary = isDarkMode ? '#F4F4F5' : '#111111';
  const textSecondary = isDarkMode ? '#A1A1AA' : '#4B5563';
  const textMuted = isDarkMode ? '#71717A' : 'rgba(17,17,17,0.5)';
  const borderColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(17,17,17,0.06)';

  const [activeTab, setActiveTab] = useState<'faq' | 'terminos' | 'contacto'>('faq');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(1);

  const toggleFaq = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleEmail = () => {
    Linking.openURL('mailto:soporte@skipsj.duoc.cl?subject=Consulta%20SKIP%20Duoc%20UC').catch(() => {
      Alert.alert("Correo Institucional", "Escríbenos directamente a: soporte@skipsj.duoc.cl");
    });
  };

  const handleReportProblem = () => {
    Alert.alert(
      "Reportar un Problema",
      "Hemos derivado tu reporte al equipo de operaciones de Casino San Joaquín. Te contactaremos a tu correo institucional en breve.",
      [{ text: "Entendido", style: "default" }]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      
      {/* Header Superior */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingVertical: 14, 
        backgroundColor: cardBg, 
        borderBottomWidth: 1, 
        borderBottomColor: borderColor 
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 6, marginLeft: -6 }}>
          <ArrowLeft color={textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontFamily: 'Inter-Bold', color: textPrimary, marginLeft: 12 }}>
          Centro de Ayuda
        </Text>
      </View>

      {/* Selector de Pestañas (Pills) */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 8, backgroundColor: cardBg }}>
        
        <TouchableOpacity 
          onPress={() => setActiveTab('faq')}
          style={{ 
            flex: 1, 
            paddingVertical: 10, 
            borderRadius: 12, 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: activeTab === 'faq' ? (isDarkMode ? '#F2A900' : '#003D7A') : cardAlt
          }}
        >
          <Text style={{ 
            fontFamily: 'Inter-Bold', 
            fontSize: 13, 
            color: activeTab === 'faq' ? (isDarkMode ? '#09090B' : '#FFFFFF') : textSecondary 
          }}>
            Preguntas FAQ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setActiveTab('terminos')}
          style={{ 
            flex: 1, 
            paddingVertical: 10, 
            borderRadius: 12, 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: activeTab === 'terminos' ? (isDarkMode ? '#F2A900' : '#003D7A') : cardAlt
          }}
        >
          <Text style={{ 
            fontFamily: 'Inter-Bold', 
            fontSize: 13, 
            color: activeTab === 'terminos' ? (isDarkMode ? '#09090B' : '#FFFFFF') : textSecondary 
          }}>
            Términos y Cond.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setActiveTab('contacto')}
          style={{ 
            flex: 1, 
            paddingVertical: 10, 
            borderRadius: 12, 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: activeTab === 'contacto' ? (isDarkMode ? '#F2A900' : '#003D7A') : cardAlt
          }}
        >
          <Text style={{ 
            fontFamily: 'Inter-Bold', 
            fontSize: 13, 
            color: activeTab === 'contacto' ? (isDarkMode ? '#09090B' : '#FFFFFF') : textSecondary 
          }}>
            Contacto
          </Text>
        </TouchableOpacity>

      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* ======================================================== */}
        {/* PESTAÑA 1: PREGUNTAS FRECUENTES (FAQ)                   */}
        {/* ======================================================== */}
        {activeTab === 'faq' && (
          <View>
            <View style={{ marginBottom: 18 }}>
              <Text style={{ fontSize: 20, fontFamily: 'Inter-Bold', color: textPrimary, marginBottom: 4 }}>
                Preguntas Frecuentes
              </Text>
              <Text style={{ fontSize: 13, fontFamily: 'Inter-Regular', color: textMuted }}>
                Todo lo que necesitas saber para optimizar tus recreos en Sede San Joaquín.
              </Text>
            </View>

            <View style={{ gap: 12 }}>
              {FAQS.map((faq) => {
                const isOpen = expandedFaq === faq.id;
                return (
                  <View 
                    key={faq.id}
                    style={{
                      backgroundColor: cardBg,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: isOpen ? (isDarkMode ? '#F2A900' : '#003D7A') : borderColor,
                      overflow: 'hidden',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isOpen ? (isDarkMode ? 0.3 : 0.05) : (isDarkMode ? 0.15 : 0.02),
                      shadowRadius: 6,
                      elevation: 1
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => toggleFaq(faq.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 16,
                        backgroundColor: isOpen ? (isDarkMode ? 'rgba(242,169,0,0.06)' : 'rgba(0,61,122,0.02)') : cardBg
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8, gap: 10 }}>
                        <View style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: isOpen ? (isDarkMode ? '#F2A900' : '#003D7A') : cardAlt,
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          <HelpCircle size={15} color={isOpen ? (isDarkMode ? '#09090B' : '#FFFFFF') : textSecondary} />
                        </View>
                        <Text style={{ 
                          fontSize: 14, 
                          fontFamily: 'Inter-SemiBold', 
                          color: isOpen ? (isDarkMode ? '#F2A900' : '#003D7A') : textPrimary, 
                          flex: 1 
                        }}>
                          {faq.pregunta}
                        </Text>
                      </View>
                      {isOpen ? (
                        <ChevronUp size={18} color={isDarkMode ? '#F2A900' : '#003D7A'} />
                      ) : (
                        <ChevronDown size={18} color={textMuted} />
                      )}
                    </TouchableOpacity>

                    {isOpen && (
                      <View style={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 }}>
                        <View style={{ height: 1, backgroundColor: borderColor, marginBottom: 12 }} />
                        <Text style={{ fontSize: 13, fontFamily: 'Inter-Regular', color: textSecondary, lineHeight: 20 }}>
                          {faq.respuesta}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Banner de Ayuda Extra */}
            <View style={{ 
              marginTop: 24, 
              backgroundColor: isDarkMode ? '#1E293B' : '#EFF6FF', 
              borderRadius: 18, 
              padding: 16, 
              borderWidth: 1, 
              borderColor: isDarkMode ? 'rgba(56,189,248,0.2)' : '#BFDBFE',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12
            }}>
              <Sparkles size={24} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: isDarkMode ? '#38BDF8' : '#0369A1', marginBottom: 2 }}>
                  ¿Tienes otra consulta institucional?
                </Text>
                <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: textSecondary }}>
                  Escríbenos a soporte@skipsj.duoc.cl para atenderte directamente.
                </Text>
              </View>
              <TouchableOpacity 
                onPress={handleEmail}
                style={{ backgroundColor: '#0284C7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}
              >
                <Text style={{ color: '#FFFFFF', fontFamily: 'Inter-Bold', fontSize: 12 }}>Escribir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* PESTAÑA 2: TÉRMINOS Y CONDICIONES DEL SERVICIO          */}
        {/* ======================================================== */}
        {activeTab === 'terminos' && (
          <View>
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <FileText size={22} color={isDarkMode ? '#F2A900' : '#003D7A'} />
                <Text style={{ fontSize: 20, fontFamily: 'Inter-Bold', color: textPrimary }}>
                  Términos y Condiciones
                </Text>
              </View>
              <Text style={{ fontSize: 12, fontFamily: 'Inter-Regular', color: textMuted }}>
                Versión 2.0 • SKIP Duoc UC Sede San Joaquín (Actualizado Octubre 2026)
              </Text>
            </View>

            <View style={{ backgroundColor: cardBg, borderRadius: 20, padding: 18, borderWidth: 1, borderColor, gap: 16 }}>
              
              <View>
                <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: isDarkMode ? '#F2A900' : '#003D7A', marginBottom: 4 }}>
                  1. Naturaleza y Propósito del Servicio
                </Text>
                <Text style={{ fontSize: 13, fontFamily: 'Inter-Regular', color: textSecondary, lineHeight: 19 }}>
                  SKIP Duoc UC es una plataforma de Click & Collect y gestión inteligente de filas diseñada exclusivamente para la comunidad de alumnos, docentes y colaboradores de Duoc UC Sede San Joaquín, orientada a reducir los tiempos de espera en recreos y horarios punta.
                </Text>
              </View>

              <View style={{ height: 1, backgroundColor: borderColor }} />

              <View>
                <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: isDarkMode ? '#F2A900' : '#003D7A', marginBottom: 4 }}>
                  2. Cuentas de Usuario y Autenticación
                </Text>
                <Text style={{ fontSize: 13, fontFamily: 'Inter-Regular', color: textSecondary, lineHeight: 19 }}>
                  Para utilizar el servicio se requiere una cuenta institucional vinculada a un correo @duocuc.cl o registro autorizado. El usuario es el único responsable de la custodia de sus credenciales y de la veracidad de los datos entregados (RUT, nombre y teléfono).
                </Text>
              </View>

              <View style={{ height: 1, backgroundColor: borderColor }} />

              <View>
                <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: isDarkMode ? '#F2A900' : '#003D7A', marginBottom: 4 }}>
                  3. Pasarela de Pago y Seguridad Financiera
                </Text>
                <Text style={{ fontSize: 13, fontFamily: 'Inter-Regular', color: textSecondary, lineHeight: 19 }}>
                  Los pagos realizados mediante transferencia bancaria directa (Open Banking) o tarjetas son procesados a través de canales seguros cifrados de 256 bits. SKIP Duoc UC en ningún momento almacena contraseñas bancarias ni claves multipaso de los usuarios.
                </Text>
              </View>

              <View style={{ height: 1, backgroundColor: borderColor }} />

              <View>
                <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: isDarkMode ? '#F2A900' : '#003D7A', marginBottom: 4 }}>
                  4. Retiro con Código Único de 4 Caracteres
                </Text>
                <Text style={{ fontSize: 13, fontFamily: 'Inter-Regular', color: textSecondary, lineHeight: 19 }}>
                  Cada orden completada genera un código de 4 caracteres alfanuméricos intransferible. La entrega del producto en el mesón del casino queda supeditada a la verificación y validación de dicho código por parte del personal del local.
                </Text>
              </View>

              <View style={{ height: 1, backgroundColor: borderColor }} />

              <View>
                <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: isDarkMode ? '#F2A900' : '#003D7A', marginBottom: 4 }}>
                  5. Cancelaciones y Reversas
                </Text>
                <Text style={{ fontSize: 13, fontFamily: 'Inter-Regular', color: textSecondary, lineHeight: 19 }}>
                  Las solicitudes de cancelación solo son aplicables mientras el pedido se encuentra en estado "Esperando al local". Una vez que el pedido pasa al estado "En Cocina", los insumos se consideran consumidos y no procede anulación, salvo fuerza mayor o falta de stock justificada por el comercio.
                </Text>
              </View>

              <View style={{ height: 1, backgroundColor: borderColor }} />

              <View>
                <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: isDarkMode ? '#F2A900' : '#003D7A', marginBottom: 4 }}>
                  6. Privacidad de Datos (Ley N° 19.628)
                </Text>
                <Text style={{ fontSize: 13, fontFamily: 'Inter-Regular', color: textSecondary, lineHeight: 19 }}>
                  Los datos de navegación y consumo son tratados bajo estricta confidencialidad conforme a la legislación chilena vigente, utilizándose únicamente para la trazabilidad operativa del servicio y métricas institucionales de eficiencia.
                </Text>
              </View>

            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* PESTAÑA 3: CONTACTO DIRECTO                              */}
        {/* ======================================================== */}
        {activeTab === 'contacto' && (
          <View>
            <View style={{ alignItems: 'center', marginVertical: 16 }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: isDarkMode ? 'rgba(242,169,0,0.1)' : 'rgba(0,61,122,0.06)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                <HelpCircle color={isDarkMode ? '#F2A900' : '#003D7A'} size={36} />
              </View>
              <Text style={{ fontFamily: 'Inter-Bold', fontSize: 20, color: textPrimary, marginBottom: 4 }}>
                ¿Necesitas asistencia?
              </Text>
              <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: textMuted, textAlign: 'center', paddingHorizontal: 16 }}>
                Estamos conectados durante todo el horario de clases para resolver inconvenientes en tiempo real.
              </Text>
            </View>

            <Text style={{ fontSize: 12, fontFamily: 'Inter-Bold', color: textMuted, textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 }}>
              Canal Oficial de Soporte
            </Text>

            <View style={{ backgroundColor: cardBg, borderRadius: 20, paddingHorizontal: 16, borderWidth: 1, borderColor, marginBottom: 24 }}>
              
              <TouchableOpacity 
                onPress={handleEmail}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18 }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: isDarkMode ? 'rgba(242,169,0,0.12)' : 'rgba(0,61,122,0.07)', justifyContent: 'center', alignItems: 'center' }}>
                  <Mail color={isDarkMode ? '#F2A900' : '#003D7A'} size={22} />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={{ fontFamily: 'Inter-Bold', fontSize: 15, color: textPrimary }}>Mesa de Ayuda por Correo</Text>
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 13, color: isDarkMode ? '#F2A900' : '#003D7A', marginTop: 2 }}>soporte@skipsj.duoc.cl</Text>
                  <Text style={{ fontFamily: 'Inter-Regular', fontSize: 11, color: textMuted, marginTop: 4 }}>
                    Atención oficial para alumnos y docentes de Sede San Joaquín
                  </Text>
                </View>
                <ChevronRight color={textMuted} size={18} />
              </TouchableOpacity>

            </View>

            <Text style={{ fontSize: 12, fontFamily: 'Inter-Bold', color: 'rgba(239, 68, 68, 0.8)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 }}>
              Incidencias de Pedidos
            </Text>

            <TouchableOpacity 
              onPress={handleReportProblem}
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: cardBg,
                borderRadius: 18, 
                paddingVertical: 16, 
                paddingHorizontal: 16,
                borderWidth: 1, 
                borderColor: 'rgba(239, 68, 68, 0.3)' 
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.1)', justifyContent: 'center', alignItems: 'center' }}>
                <FileWarning color="#EF4444" size={20} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ fontFamily: 'Inter-Bold', fontSize: 15, color: '#EF4444' }}>Reportar problema con un pedido</Text>
                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'rgba(239, 68, 68, 0.7)', marginTop: 2 }}>Demora excesiva, producto erróneo o cobro duplicado</Text>
              </View>
              <ChevronRight color="rgba(239, 68, 68, 0.4)" size={18} />
            </TouchableOpacity>

          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
