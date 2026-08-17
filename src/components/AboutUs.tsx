import React from 'react';
import { DollarSign, ShieldCheck, MessageSquareText, Calendar, Sparkles, MapPin } from 'lucide-react';

export default function AboutUs() {
  const features = [
    { icon: <MessageSquareText size={22} />, title: "RESPUESTAS RÁPIDAS", desc: "Atención inmediata para ti" },
    { icon: <Calendar size={22} />, title: "PRUEBAS DE MANEJO", desc: "Coordinación fácil y rápida" },
    { icon: <Sparkles size={22} />, title: "LA MEJOR EXPERIENCIA", desc: "Asesoría cálida y transparente" },
    { icon: <DollarSign size={22} />, title: "PAGOS CÓMODOS", desc: "Opciones a tu presupuesto" },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1050px] mx-auto bg-[#101f42]/90 border border-[#00b4d8]/30 rounded-3xl overflow-hidden shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] flex flex-col md:flex-row backdrop-blur-md">
      
      {/* Left side: content */}
      <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl md:text-4xl font-black text-white italic tracking-tight font-serif">
              Shakira
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#00b4d8]/20 text-[#48cae4] font-bold border border-[#00b4d8]/30 uppercase tracking-wider">
              Puerto Rico
            </span>
          </div>
          <div className="text-[#00b4d8] text-xs font-bold tracking-widest uppercase flex items-center gap-2 mt-1">
            <div className="w-4 h-[1px] bg-[#00b4d8]" />
            EJECUTIVA DE VENTAS
            <div className="w-4 h-[1px] bg-[#00b4d8]" />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.1] uppercase italic mt-3">
          Tu próximo <br /> carro <br />
          <span className="text-[#00b4d8]">te espera.</span>
        </h1>

        <p className="text-[#94a3b8] text-sm md:text-base mt-4 max-w-md leading-relaxed">
          ¡Hola! Soy <strong className="text-white">Shakira</strong>, tu ejecutiva de ventas. Mi meta es ayudarte a encontrar el auto perfecto con un pago accesible, financiamiento ágil y entrega en cualquier punto de Puerto Rico.
        </p>

        {/* Features list */}
        <div className="grid grid-cols-2 gap-3.5 mt-6 mb-6">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#1c2d5a]/40 border border-white/5">
              <div className="w-9 h-9 rounded-full bg-[#00b4d8]/15 border border-[#00b4d8]/30 flex items-center justify-center text-[#48cae4] shrink-0">
                {f.icon}
              </div>
              <div>
                <div className="text-white text-xs font-bold uppercase leading-tight">{f.title}</div>
                <div className="text-[11px] text-[#94a3b8] leading-tight mt-0.5">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div 
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('open-chat-with-visit'));
            }
          }}
          className="bg-gradient-to-r from-[#00b4d8] to-[#48cae4] text-[#0a1128] rounded-2xl p-4 sm:p-5 text-center shadow-[0_0_25px_rgba(0,180,216,0.35)] border border-[#48cae4] mt-auto cursor-pointer hover:brightness-105 transition-all"
        >
          <div className="text-lg md:text-xl font-black italic tracking-wide uppercase pointer-events-none">
            ¡Chatea con Shakira Hoy!
          </div>
          <div className="text-xs font-bold tracking-widest uppercase opacity-90 mt-0.5 pointer-events-none text-[#0a1128]">
            Estoy aquí para ayudarte a estrenar
          </div>
        </div>
      </div>

      {/* Right side: visual profile representation */}
      <div className="flex-1 min-h-[380px] md:min-h-full relative overflow-hidden bg-gradient-to-br from-[#0a1128] via-[#101f42] to-[#1c2d5a] flex flex-col justify-end p-6 border-t md:border-t-0 md:border-l border-[#00b4d8]/20">
        <img 
          referrerPolicy="no-referrer" 
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1288&auto=format&fit=crop" 
          alt="Shakira - Ejecutiva de Ventas" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity hover:opacity-75 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1128] via-[#0a1128]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1128] via-transparent to-transparent hidden md:block" />
        
        {/* Floating badge inside executive image container */}
        <div className="relative z-10 bg-[#101f42]/90 backdrop-blur-md border border-[#00b4d8]/30 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-bold text-[#f1f5f9]">En línea ahora</span>
          </div>
          <div className="text-lg font-black text-white italic tracking-wide">
            Shakira — Ejecutiva de Ventas
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            "Tu próximo carro te espera. Escríbeme en el chat para coordinar tu prueba de manejo o cotizar tu pago mensual."
          </p>
          <div className="flex items-center gap-2 text-xs text-[#48cae4] mt-3 pt-3 border-t border-white/10 font-semibold">
            <MapPin size={14} className="text-[#00b4d8]" />
            <span>Servicio, Financiamiento y Entrega en todo Puerto Rico</span>
          </div>
        </div>
      </div>

    </div>
  );
}

