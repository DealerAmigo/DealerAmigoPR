import React, { useState } from "react";
import { PageRoute } from "../types";
import { 
  Building2, 
  Sparkles, 
  TrendingUp, 
  Users, 
  CalendarCheck2, 
  Clock4, 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap,
  BarChart3
} from "lucide-react";

interface ForDealersProps {
  navigate: (route: PageRoute) => void;
  openAmigoChat: (msg?: string) => void;
}

export const ForDealers: React.FC<ForDealersProps> = ({ navigate, openAmigoChat }) => {
  // Simple interactive lead simulator for dealers
  const [unidades, setUnidades] = useState(40);
  const estimatedMonthlyLeads = Math.round(unidades * 3.5);
  const estimatedPreQualifiedAppointments = Math.round(estimatedMonthlyLeads * 0.42);

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-12 space-y-16">
      {/* Hero */}
      <div className="text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#101f42] border border-[#ffb703]/40 text-xs font-bold text-[#ffb703] uppercase tracking-widest">
          <Building2 size={13} />
          <span>PORTAL DE CONCESIONARIOS Y VENDEDORES AUTORIZADOS</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          Más conversaciones. Más citas. <br />
          <span className="bg-gradient-to-r from-[#ffb703] via-[#00b4d8] to-[#48cae4] bg-clip-text text-transparent">
            Menos prospectos perdidos.
          </span>
        </h1>

        <p className="text-[#94a3b8] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          DealerAmigo ayuda a los dealers de Puerto Rico a mostrar su inventario, responder preguntas frecuentes, cualificar prospectos y coordinar citas con asistencia de <strong>Amigo AI</strong>.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => window.open("https://atiende-recepcionista-ia.ai.studio", "_blank")}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#ffb703] to-[#fb8500] text-[#0a1128] font-black text-sm sm:text-base shadow-[0_0_25px_rgba(255,183,3,0.4)] hover:brightness-110 transition-all hover:scale-105"
          >
            Solicitar demostración
          </button>

          <button
            onClick={() => openAmigoChat("¡Hola! Me interesa conocer cómo DealerAmigo ayuda a los concesionarios en Puerto Rico.")}
            className="px-6 py-4 rounded-2xl bg-[#1c2d5a] text-[#f1f5f9] font-bold text-sm hover:bg-[#1c2d5a]/80 transition-all border border-white/10 flex items-center gap-2"
          >
            <Sparkles size={16} className="text-[#00b4d8]" />
            <span>Ver demo interactiva</span>
          </button>
        </div>
      </div>

      {/* 5 KEY BENEFITS */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <div className="text-xs font-bold text-[#00b4d8] uppercase tracking-widest">
            Ventajas Competitivas
          </div>
          <h2 className="text-3xl font-black text-white">
            5 Razones por las que los Dealers eligen DealerAmigo
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Benefit 1 */}
          <div className="bg-[#101f42]/80 border border-white/10 rounded-2xl p-6 space-y-3 hover:border-[#00b4d8]/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#00b4d8]/20 text-[#48cae4] flex items-center justify-center font-black text-xl">
              1
            </div>
            <h3 className="text-lg font-black text-white">Exposición Multicanal de Inventario</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Tus unidades aparecen destacadas frente a miles de compradores activos en toda la Isla que buscan por marca, precio o pago mensual exacto.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="bg-[#101f42]/80 border border-[#ffb703]/30 rounded-2xl p-6 space-y-3 hover:border-[#ffb703] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#ffb703]/20 text-[#ffb703] flex items-center justify-center font-black text-xl">
              2
            </div>
            <h3 className="text-lg font-black text-white">Cualificación Automática de Prospectos</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Amigo AI identifica antes de la cita el presupuesto del cliente, su pronto pago disponible, nivel crediticio y si tiene un auto en trade-in.
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="bg-[#101f42]/80 border border-white/10 rounded-2xl p-6 space-y-3 hover:border-[#00b4d8]/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#00b4d8]/20 text-[#48cae4] flex items-center justify-center font-black text-xl">
              3
            </div>
            <h3 className="text-lg font-black text-white">Agendamiento de Citas en Tiempo Real</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Coordinación fluida de visitas presenciales, pruebas de manejo y llamadas directas con tus ejecutivos en tu horario de atención.
            </p>
          </div>

          {/* Benefit 4 */}
          <div className="bg-[#101f42]/80 border border-white/10 rounded-2xl p-6 space-y-3 hover:border-[#00b4d8]/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#00b4d8]/20 text-[#48cae4] flex items-center justify-center font-black text-xl">
              4
            </div>
            <h3 className="text-lg font-black text-white">Respuestas Inmediatas 24/7</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              No pierdas prospectos que navegan de noche o fines de semana. Amigo atiende en español boricua en cualquier momento y captura el lead.
            </p>
          </div>

          {/* Benefit 5 */}
          <div className="bg-[#101f42]/80 border border-[#00b4d8]/30 rounded-2xl p-6 space-y-3 hover:border-[#00b4d8] transition-colors lg:col-span-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#ffb703] text-[#0a1128] flex items-center justify-center font-black text-xl">
              5
            </div>
            <h3 className="text-lg font-black text-white">Integración directa con tu CRM, WhatsApp o Google Sheets</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Recibe las notificaciones al instante por correo, webhook o WhatsApp de tu equipo de ventas para dar seguimiento en segundos sin cambiar tu flujo actual de trabajo.
            </p>
          </div>
        </div>
      </div>

      {/* INTERACTIVE LEAD SIMULATOR */}
      <div className="bg-[#101f42] border border-[#00b4d8]/40 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#ffb703] uppercase tracking-wider">
              <BarChart3 size={14} />
              <span>Calculadora de Impacto para Dealers</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Simula tu Volumen Potencial de Leads
            </h3>
          </div>
          <div className="text-xs text-[#94a3b8]">
            Basado en métricas de conversión en Puerto Rico
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex justify-between items-center text-sm font-bold text-white mb-2">
                <span>Cantidad promedio de unidades en tu inventario:</span>
                <span className="text-xl font-black text-[#00b4d8]">{unidades} autos</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={unidades}
                onChange={(e) => setUnidades(parseInt(e.target.value, 10))}
                className="w-full h-3 bg-[#0a1128] rounded-lg appearance-none cursor-pointer accent-[#00b4d8]"
              />
              <div className="flex justify-between text-[11px] text-[#94a3b8] mt-1">
                <span>10 unidades</span>
                <span>100 unidades</span>
                <span>200+ unidades</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0a1128] border border-white/5 space-y-2 text-xs text-[#94a3b8]">
              <div className="text-white font-bold">¿Cómo funciona la cualificación?</div>
              <div>
                Amigo guía al comprador a través de una conversación humana, valida su pronto, confirma su modelo preferido y genera una cita lista para cierre.
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#0a1128] p-6 rounded-2xl border border-[#00b4d8]/30 space-y-2 text-center">
              <div className="text-xs font-bold text-[#94a3b8] uppercase">Leads Estimados / Mes</div>
              <div className="text-4xl font-black text-[#00b4d8]">{estimatedMonthlyLeads}</div>
              <div className="text-[11px] text-[#94a3b8]">Prospectos interesados con datos de contacto</div>
            </div>

            <div className="bg-[#0a1128] p-6 rounded-2xl border border-[#ffb703]/30 space-y-2 text-center">
              <div className="text-xs font-bold text-[#94a3b8] uppercase">Citas Cualificadas / Mes</div>
              <div className="text-4xl font-black text-[#ffb703]">{estimatedPreQualifiedAppointments}</div>
              <div className="text-[11px] text-[#94a3b8]">Con presupuesto y pronto validado</div>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => window.open("https://atiende-recepcionista-ia.ai.studio", "_blank")}
            className="px-8 py-3.5 rounded-xl bg-[#00b4d8] hover:bg-[#48cae4] text-[#0a1128] font-black text-sm transition-all shadow-[0_0_20px_rgba(0,180,216,0.4)]"
          >
            Quiero Probar DealerAmigo en mi Concesionario
          </button>
        </div>
      </div>
    </div>
  );
};
