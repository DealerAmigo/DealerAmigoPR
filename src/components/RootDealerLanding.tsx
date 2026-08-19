import React, { useState, useRef, useEffect } from "react";
import { PageRoute, Vehicle } from "../types";
import { useVideoUrl } from "../hooks/useVideoUrl";
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
  MessageSquare, 
  Calendar, 
  Award,
  ChevronRight,
  Calculator,
  Search,
  Volume2,
  VolumeX,
  Play
} from "lucide-react";
import { formatCurrency } from "../utils/helpers";

interface RootDealerLandingProps {
  inventory: Vehicle[];
  navigate: (route: PageRoute) => void;
  openAmigoChat: (initialMsg?: string) => void;
}

export const RootDealerLanding: React.FC<RootDealerLandingProps> = ({
  inventory,
  navigate,
  openAmigoChat
}) => {
  const [unidades, setUnidades] = useState(45);
  const estimatedMonthlyLeads = Math.round(unidades * 3.8);
  const estimatedPreQualifiedAppointments = Math.round(estimatedMonthlyLeads * 0.45);
  const bmwFromGT = inventory.find(v => v.Marca.toLowerCase() === "bmw" && v.Dealer?.toLowerCase().includes("gt auto"));
  const jeepsFromGT = inventory.filter(v => v.Marca.toLowerCase() === "jeep" && v.Dealer?.toLowerCase().includes("gt auto"));
  const jeepFromGT = jeepsFromGT.length > 1 ? jeepsFromGT[1] : jeepsFromGT[0];
  
  const others = inventory.filter(v => v !== bmwFromGT && v !== jeepFromGT);
  
  const sampleVehicles = [];
  if (bmwFromGT) sampleVehicles.push(bmwFromGT);
  else sampleVehicles.push(others.shift()!);
  
  sampleVehicles.push(others.shift()!);
  sampleVehicles.push(others.shift()!);
  
  if (jeepFromGT) sampleVehicles.push(jeepFromGT);
  else sampleVehicles.push(others.shift()!);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO INSTITUCIONAL PARA DEALERS */}
      <section className="relative pt-10 sm:pt-16 px-4 sm:px-6">
        <div className="max-w-[1240px] mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#101f42] border border-[#ffb703]/40 shadow-[0_0_20px_rgba(255,183,3,0.25)] text-xs font-bold text-[#ffb703] uppercase tracking-widest animate-in fade-in duration-500">
            <Building2 size={13} className="text-[#ffb703]" />
            <span>PLATAFORMA INTELIGENTE PARA DEALERS EN PUERTO RICO</span>
          </div>

          {/* H1 Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.08]">
            Convierte tu inventario en <br />
            <span className="bg-gradient-to-r from-[#ffb703] via-[#00b4d8] to-[#48cae4] bg-clip-text text-transparent">
              citas calificadas 24/7
            </span>{" "}
            con Shakira y Amigo AI.
          </h1>

          {/* Subheadline */}
          <p className="text-[#94a3b8] text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
            DealerAmigo conecta tu concesionario con compradores activos en toda la Isla, respondiendo dudas al instante, calificando crédito y agendando pruebas de manejo verificadas en piloto automático.
          </p>

                    {/* Hero Video */}
          <div className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,180,216,0.3)] border border-[#00b4d8]/40 bg-[#0a1128] relative aspect-video mt-8 mb-8 group">
            <iframe 
              className="absolute top-0 left-0 w-full h-full" 
              src="https://www.youtube.com/embed/E4veMe2yOOo?autoplay=1&mute=1&loop=1&playlist=E4veMe2yOOo&controls=1&rel=0" 
              title="Presentación DealerAmigo" 
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => window.open("https://atiende-recepcionista-ia.ai.studio", "_blank")}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#ffb703] to-[#fb8500] text-[#0a1128] font-black text-sm sm:text-base shadow-[0_0_25px_rgba(255,183,3,0.4)] hover:brightness-110 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Afiliar mi Concesionario</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => navigate("/inventario")}
              className="px-7 py-4 rounded-2xl bg-gradient-to-r from-[#00b4d8] to-[#48cae4] text-[#0a1128] font-black text-sm sm:text-base shadow-[0_0_25px_rgba(0,180,216,0.35)] hover:brightness-110 transition-all hover:scale-105 flex items-center gap-2"
            >
              <Search size={17} />
              <span>Ver Marketplace de Autos (B2C)</span>
            </button>

            <button
              onClick={() =>
                openAmigoChat(
                  "¡Hola Shakira! Soy dueño/gerente de un concesionario y quiero ver cómo DealerAmigo pre-cualifica prospectos y agenda citas."
                )
              }
              className="px-6 py-4 rounded-2xl bg-[#1c2d5a] hover:bg-[#1c2d5a]/80 text-[#f1f5f9] font-bold text-sm sm:text-base border border-white/10 transition-all hover:scale-105 flex items-center gap-2 shadow-md"
            >
              <MessageSquare size={17} className="text-[#00b4d8]" />
              <span>Probar Demo con Shakira</span>
            </button>
          </div>

        </div>
      </section>
    </div>
  );
};
export default RootDealerLanding;
