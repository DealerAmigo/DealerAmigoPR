import React from "react";
import { PageRoute } from "../types";
import { ShieldCheck, Sparkles, Car, Building2, Users, HeartHandshake, ArrowRight } from "lucide-react";

interface AboutUsPageProps {
  navigate: (route: PageRoute) => void;
  openAmigoChat: (msg?: string) => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ navigate, openAmigoChat }) => {
  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#101f42] border border-[#00b4d8]/40 text-xs font-bold text-[#48cae4] uppercase tracking-widest">
          <Sparkles size={13} className="text-[#00b4d8]" />
          <span>INNOVACIÓN AUTOMOTRIZ EN PUERTO RICO</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
          Sobre DealerAmigo
        </h1>
      </div>

      {/* Main Positioning Card */}
      <div className="bg-gradient-to-br from-[#101f42] via-[#1c2d5a]/70 to-[#0a1128] border border-[#00b4d8]/40 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-6">
        <div className="text-xs font-bold text-[#ffb703] uppercase tracking-widest flex items-center gap-2">
          <span>🇵🇷</span>
          <span>Nuestra Misión y Propósito</span>
        </div>

        <blockquote className="text-lg sm:text-2xl font-bold text-white leading-relaxed border-l-4 border-[#00b4d8] pl-6 italic">
          "DealerAmigo nació para transformar la experiencia de comprar un auto en Puerto Rico. No somos un dealer tradicional ni favorecemos una sola marca. Somos una plataforma tecnológica independiente que conecta a compradores con dealers locales verificados, ofreciendo orientación clara, transparente y asistida por inteligencia artificial."
        </blockquote>

        <p className="text-sm sm:text-base text-[#94a3b8] leading-relaxed">
          Comprar un vehículo no debería ser un proceso agotador ni lleno de incertidumbre sobre los números reales. En DealerAmigo combinamos lo mejor de la tecnología con el trato cálido y profesional de Puerto Rico, brindándote a <strong>Amigo</strong>, tu asesor inteligente disponible 24/7 para que tomes decisiones bien informado antes de visitar el concesionario.
        </p>
      </div>

      {/* 4 Pillars */}
      <div className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black text-white text-center">
          Nuestros Principios Fundamentales
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#101f42] border border-white/10 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#00b4d8]/20 flex items-center justify-center text-[#48cae4]">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">100% Independiente y Neutral</h3>
            <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
              No favorecemos a ningún concesionario por encima de otro. Nuestro único objetivo es ayudarte a conseguir el vehículo que se ajuste exactamente a tu bolsillo y necesidades.
            </p>
          </div>

          <div className="bg-[#101f42] border border-white/10 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffb703]/20 flex items-center justify-center text-[#ffb703]">
              <Sparkles size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Inteligencia Artificial con Amigo</h3>
            <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
              Amigo comprende las particularidades del mercado automotriz en Puerto Rico, calculando pagos reales, orientando sobre garantías y respondiendo en español boricua en todo momento.
            </p>
          </div>

          <div className="bg-[#101f42] border border-white/10 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#00b4d8]/20 flex items-center justify-center text-[#48cae4]">
              <Building2 size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Red de Dealers Verificados</h3>
            <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
              Trabajamos exclusivamente con concesionarios y vendedores establecidos con inventario real y procesos de financiamiento institucional legítimos en toda la Isla.
            </p>
          </div>

          <div className="bg-[#101f42] border border-white/10 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffb703]/20 flex items-center justify-center text-[#ffb703]">
              <HeartHandshake size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Respeto y Cero Presión</h3>
            <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
              Tú decides cuándo dar el siguiente paso. Puedes explorar, comparar y simular libremente antes de coordinar tu prueba de manejo.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-[#1c2d5a] border border-[#00b4d8]/30 rounded-3xl p-8 text-center space-y-4">
        <h3 className="text-2xl font-black text-white">¿Listo para comenzar a buscar tu auto?</h3>
        <p className="text-xs sm:text-sm text-[#94a3b8] max-w-lg mx-auto">
          Explora cientos de unidades verificadas o conversa directamente con Amigo para una recomendación personalizada.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate("/inventario")}
            className="px-6 py-3 rounded-xl bg-[#00b4d8] text-[#0a1128] font-bold text-xs hover:bg-[#48cae4] transition-all flex items-center gap-1.5"
          >
            <span>Ver Inventario Disponible</span>
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => openAmigoChat("¡Hola Amigo! Cuéntame qué carros me recomiendas hoy.")}
            className="px-6 py-3 rounded-xl bg-[#101f42] text-white font-bold text-xs hover:bg-[#101f42]/80 border border-white/10"
          >
            Hablar con Amigo
          </button>
        </div>
      </div>
    </div>
  );
};
