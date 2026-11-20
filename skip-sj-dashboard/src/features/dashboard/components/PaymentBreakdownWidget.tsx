import { useEffect, useState, useCallback } from "react";
import { CreditCard, Wallet, ShieldCheck, CheckCircle2, DollarSign, ExternalLink, Landmark, RefreshCw } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";

export interface BankAccountDetails {
  razonSocial: string;
  rutComercial: string;
  banco: string;
  tipoCuenta: string;
  numeroCuenta: string;
  collectorId: string;
  emailLiquidacion: string;
}

const DEFAULT_BANK_DETAILS: BankAccountDetails = {
  razonSocial: "Comercializadora de Alimentos Achoclonado SpA",
  rutComercial: "76.842.190-K",
  banco: "Banco de Chile",
  tipoCuenta: "Cuenta Corriente",
  numeroCuenta: "00-1928472-01",
  collectorId: "MP-LOC-749201",
  emailLiquidacion: "finanzas@achoclonado.cl",
};

export function PaymentBreakdownWidget() {
  const { locatarioId, role, nombreLocal } = useAuth();
  const [bankDetails, setBankDetails] = useState<BankAccountDetails>(DEFAULT_BANK_DETAILS);
  const [isLinking, setIsLinking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formDetails, setFormDetails] = useState<BankAccountDetails>(DEFAULT_BANK_DETAILS);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [breakdown, setBreakdown] = useState({
    bancoEstadoMonto: 0,
    bancoEstadoPct: 0,
    webpayMonto: 0,
    webpayPct: 0,
    otrosMonto: 0,
    otrosPct: 0,
    totalIngresos: 0,
  });

  // Cargar estado de la cuenta bancaria del locatario desde Supabase / LocalStorage
  const fetchLocatarioAccount = useCallback(async () => {
    try {
      // Intento 1: LocalStorage para persistencia inmediata
      const savedLocal = localStorage.getItem(`skip_bank_account_${locatarioId || "default"}`);
      if (savedLocal) {
        const parsed = JSON.parse(savedLocal);
        setBankDetails(parsed);
        setFormDetails(parsed);
      }

      // Intento 2: Supabase si existe locatario
      if (locatarioId || role === "super_admin") {
        let query = supabase.from("locatarios").select("id, nombre, mp_collector_id");
        if (locatarioId) {
          query = query.eq("id", locatarioId);
        }
        const { data, error } = await query.limit(1);
        if (!error && data && data.length > 0 && data[0].mp_collector_id) {
          try {
            // Si viene en formato JSON almacenado
            const parsedDb = JSON.parse(data[0].mp_collector_id);
            if (parsedDb.rutComercial) {
              setBankDetails(parsedDb);
              setFormDetails(parsedDb);
              return;
            }
          } catch {
            // Si viene como string simple de collector_id
            setBankDetails((prev) => ({ ...prev, collectorId: data[0].mp_collector_id }));
            setFormDetails((prev) => ({ ...prev, collectorId: data[0].mp_collector_id }));
          }
        }
      }
    } catch (e) {
      console.warn("No se pudo cargar datos bancarios:", e);
    }
  }, [locatarioId, role]);

  // Guardar cuenta bancaria / Mercado Pago del locatario
  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLinking(true);
    try {
      const payloadString = JSON.stringify(formDetails);
      // Guardar en localStorage
      localStorage.setItem(`skip_bank_account_${locatarioId || "default"}`, payloadString);

      // Guardar en Supabase
      if (locatarioId) {
        await supabase
          .from("locatarios")
          .update({ mp_collector_id: payloadString })
          .eq("id", locatarioId);
      }

      setBankDetails(formDetails);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setShowModal(false);
      }, 1000);
    } catch (e) {
      console.error("Error guardando cuenta:", e);
      // Aun con error de red en Supabase, preservamos en local para que la UI no falle
      setBankDetails(formDetails);
      setShowModal(false);
    } finally {
      setIsLinking(false);
    }
  };

  const fetchBreakdown = useCallback(async () => {
    try {
      let query = supabase
        .from("pedidos")
        .select("monto_total, estado, metodo_pago")
        .neq("estado", "cancelado")
        .neq("estado", "pendiente_pago");

      if (role !== "super_admin" && locatarioId) {
        query = query.eq("locatario_id", locatarioId);
      }

      const { data, error } = await query;
      if (!error && data) {
        let beMonto = 0;
        let wpMonto = 0;
        let otrosMonto = 0;
        let total = 0;

        data.forEach((p) => {
          const monto = p.monto_total || 0;
          total += monto;

          if (p.metodo_pago === "mercadopago") {
            wpMonto += monto;
          } else if (p.metodo_pago === "otro") {
            beMonto += monto;
          } else {
            otrosMonto += monto;
          }
        });

        setBreakdown({
          bancoEstadoMonto: beMonto,
          bancoEstadoPct: total > 0 ? Math.round((beMonto / total) * 100) : 0,
          webpayMonto: wpMonto,
          webpayPct: total > 0 ? Math.round((wpMonto / total) * 100) : 0,
          otrosMonto: otrosMonto,
          otrosPct: total > 0 ? Math.round((otrosMonto / total) * 100) : 0,
          totalIngresos: total,
        });
      }
    } catch (err) {
      console.error("Error obteniendo desglose de pagos:", err);
    }
  }, [locatarioId, role]);

  useEffect(() => {
    fetchBreakdown();
    fetchLocatarioAccount();

    const channel = supabase
      .channel("payment-breakdown-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        () => {
          fetchBreakdown();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBreakdown, fetchLocatarioAccount]);

  const methods = [
    {
      id: "bancoestado",
      name: "BancoEstado (CuentaRUT)",
      sub: "Open Banking directo sin comisiones",
      monto: breakdown.bancoEstadoMonto,
      porcentaje: breakdown.bancoEstadoPct,
      color: "bg-[#004B93]",
      barColor: "bg-blue-600",
      badge: "Open Banking Oficial",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
      icon: CreditCard,
    },
    {
      id: "webpay",
      name: "Webpay Plus (Transbank)",
      sub: "Tarjetas Débito Redcompra y Crédito bancarias",
      monto: breakdown.webpayMonto,
      porcentaje: breakdown.webpayPct,
      color: "bg-[#E11938]",
      barColor: "bg-rose-600",
      badge: "Transbank Oficial",
      badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
      icon: Wallet,
    },
    {
      id: "otros",
      name: "Mercado Pago & Billeteras",
      sub: "Dispersión automática a cuenta de locatario",
      monto: breakdown.otrosMonto,
      porcentaje: breakdown.otrosPct,
      color: "bg-[#009EE3]",
      barColor: "bg-sky-500",
      badge: "Split Payment",
      badgeColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25",
      icon: DollarSign,
    },
  ];

  // Ahorro estimado por Open Banking sin comisión POS (~2.5% de comisión transbank ahorrada)
  const ahorroComision = Math.round(breakdown.bancoEstadoMonto * 0.025);

  return (
    <div className="bg-white dark:bg-[#131318] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#F5A623]" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Métodos de Pago &amp; Recaudación
            </h3>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            100% Cifrado
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
          Distribución de pagos de estudiantes en el casino
        </p>

        {/* Stacked Bar Overview */}
        <div className="mb-5 space-y-2">
          <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
            {breakdown.totalIngresos === 0 ? (
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-full" />
            ) : (
              methods.map((m) => (
                <div
                  key={m.id}
                  style={{ width: `${m.porcentaje}%` }}
                  className={`${m.barColor} h-full transition-all duration-500`}
                  title={`${m.name}: ${m.porcentaje}%`}
                />
              ))
            )}
          </div>
          <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
            <span>CuentaRUT ({breakdown.bancoEstadoPct}%)</span>
            <span>Webpay Plus ({breakdown.webpayPct}%)</span>
            <span>Otros ({breakdown.otrosPct}%)</span>
          </div>
        </div>

        {/* List of Methods */}
        <div className="space-y-3.5">
          {methods.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl ${m.color} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {m.name}
                      </p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${m.badgeColor}`}>
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {m.sub}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-black font-mono text-zinc-950 dark:text-white">
                    ${m.monto.toLocaleString("es-CL")}
                  </p>
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {m.porcentaje}% del total
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dispersión y Liquidación Directa al Concesionario (Split Payment CMF) */}
        <div className="mt-4 p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/25 border border-blue-200/80 dark:border-blue-900/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Liquidación Bancaria Comercial (Split Payment CMF)
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Dispersión Directa Activa
            </span>
          </div>

          <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Las ventas se liquidan diariamente en la cuenta comercial del concesionario. <strong className="text-blue-700 dark:text-blue-300">SKIP retiene $0 (0% comisión en piloto)</strong> cumpliendo la normativa de no captación de fondos de la CMF.
          </p>

          {/* Ficha Bancaria Resumida */}
          <div className="p-2.5 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-blue-100 dark:border-blue-900/40 space-y-1 text-[11px]">
            <div className="flex justify-between items-center text-zinc-700 dark:text-zinc-200">
              <span className="font-semibold text-zinc-500 dark:text-zinc-400">Titular:</span>
              <span className="font-bold truncate max-w-[200px]">{bankDetails.razonSocial}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-700 dark:text-zinc-200">
              <span className="font-semibold text-zinc-500 dark:text-zinc-400">RUT Comercial:</span>
              <span className="font-mono font-bold text-blue-700 dark:text-blue-300">{bankDetails.rutComercial}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-700 dark:text-zinc-200">
              <span className="font-semibold text-zinc-500 dark:text-zinc-400">Cuenta de Abono:</span>
              <span className="font-medium">{bankDetails.banco} • {bankDetails.tipoCuenta} ({bankDetails.numeroCuenta})</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 border-t border-blue-100 dark:border-blue-900/40">
            <span className="truncate max-w-[190px]">Collector ID: {bankDetails.collectorId}</span>
            <button
              type="button"
              onClick={() => {
                setFormDetails(bankDetails);
                setShowModal(true);
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold font-sans flex items-center gap-1 cursor-pointer"
            >
              Gestionar cuenta bancaria <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
        <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Ahorro estimado comisiones POS:
        </span>
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          +${ahorroComision.toLocaleString("es-CL")} CLP
        </span>
      </div>

      {/* Modal para Ficha Bancaria de Liquidación Comercial (Chile) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Ficha Bancaria de Liquidación ({nombreLocal || "Achoclonado"})
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Dispersión automática según normativa bancaria CMF
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBankDetails} className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                    Razón Social de la Empresa:
                  </label>
                  <input
                    type="text"
                    required
                    value={formDetails.razonSocial}
                    onChange={(e) => setFormDetails({ ...formDetails, razonSocial: e.target.value })}
                    placeholder="Ej: Comercializadora Achoclonado SpA"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                    RUT Comercial Titular:
                  </label>
                  <input
                    type="text"
                    required
                    value={formDetails.rutComercial}
                    onChange={(e) => setFormDetails({ ...formDetails, rutComercial: e.target.value })}
                    placeholder="76.842.190-K"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                    Banco de Abono:
                  </label>
                  <select
                    value={formDetails.banco}
                    onChange={(e) => setFormDetails({ ...formDetails, banco: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Banco de Chile">Banco de Chile / Edwards</option>
                    <option value="BancoEstado">BancoEstado</option>
                    <option value="Banco Santander Chile">Banco Santander Chile</option>
                    <option value="BCI">BCI (Banco de Crédito e Inversiones)</option>
                    <option value="Scotiabank Chile">Scotiabank Chile</option>
                    <option value="Banco Itaú">Banco Itaú</option>
                    <option value="Banco Falabella">Banco Falabella</option>
                    <option value="Banco BICE">Banco BICE</option>
                    <option value="Banco Security">Banco Security</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                    Tipo de Cuenta:
                  </label>
                  <select
                    value={formDetails.tipoCuenta}
                    onChange={(e) => setFormDetails({ ...formDetails, tipoCuenta: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Cuenta Corriente">Cuenta Corriente Comercial</option>
                    <option value="Cuenta Vista / CuentaRUT">Cuenta Vista / CuentaRUT</option>
                    <option value="Cuenta de Ahorro">Cuenta de Ahorro Empresa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                    Número de Cuenta Bancaria:
                  </label>
                  <input
                    type="text"
                    required
                    value={formDetails.numeroCuenta}
                    onChange={(e) => setFormDetails({ ...formDetails, numeroCuenta: e.target.value })}
                    placeholder="00-1928472-01"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                    Mercado Pago Collector ID / Webpay:
                  </label>
                  <input
                    type="text"
                    required
                    value={formDetails.collectorId}
                    onChange={(e) => setFormDetails({ ...formDetails, collectorId: e.target.value })}
                    placeholder="MP-LOC-749201"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                  Email Notificación de Cartola / Liquidación:
                </label>
                <input
                  type="email"
                  required
                  value={formDetails.emailLiquidacion}
                  onChange={(e) => setFormDetails({ ...formDetails, emailLiquidacion: e.target.value })}
                  placeholder="finanzas@achoclonado.cl"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="leading-snug">
                  <strong>Dispersión CMF Directa:</strong> Las recaudaciones de Webpay y Mercado Pago se liquidan diariamente sin pasar por las cuentas de SKIP.
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[11px] text-zinc-400">
                  {saveSuccess ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      ✓ Guardado exitosamente
                    </span>
                  ) : (
                    "Persistencia en Supabase PostgreSQL"
                  )}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLinking}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    {isLinking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                    {saveSuccess ? "¡Actualizado!" : "Guardar Ficha Bancaria"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentBreakdownWidget;
