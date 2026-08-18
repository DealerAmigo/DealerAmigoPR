import React, { useState, useRef, useEffect } from "react";
import { PageRoute, Vehicle } from "../types";
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

  // Video state
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [isHeroMuted, setIsHeroMuted] = useState(true);
  const [isHeroPlaying, setIsHeroPlaying] = useState(false);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

    const playVideo = () => {
      const p = video.play();
      if (p !== undefined) {
        p.then(() => setIsHeroPlaying(true))
         .catch((err) => {
           console.warn("Autoplay deferred:", err);
           setIsHeroPlaying(false);
         });
      }
    };

    playVideo();
    video.addEventListener("loadedmetadata", playVideo);
    video.addEventListener("canplay", playVideo);
    video.addEventListener("playing", () => setIsHeroPlaying(true));
    video.addEventListener("pause", () => setIsHeroPlaying(false));

    return () => {
      video.removeEventListener("loadedmetadata", playVideo);
      video.removeEventListener("canplay", playVideo);
    };
  }, []);

  const toggleHeroPlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = heroVideoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsHeroPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsHeroPlaying(false);
    }
  };

  const toggleHeroMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = heroVideoRef.current;
    if (!video) return;

    const newMuted = !video.muted;
    video.muted = newMuted;
    setIsHeroMuted(newMuted);

    if (video.paused) {
      video.play().then(() => setIsHeroPlaying(true)).catch(() => {});
    }
  };

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

          {/* Shakira Presentation Video Hero Showcase */}
          <div className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,180,216,0.3)] border border-[#00b4d8]/40 bg-[#0a1128] relative aspect-video mt-6 mb-8 group">
            <video 
              ref={heroVideoRef}
              src="/shakira_intro.mp4"
              poster="/shakira_poster.jpg"
              autoPlay 
              muted 
              loop 
              playsInline 
              controls
              preload="auto"
              className="w-full h-full object-cover cursor-pointer"
              onClick={toggleHeroPlay}
            >
              <source src="/shakira_intro.mp4" type="video/mp4" />
              <source src="/Shakira_intro.mp4" type="video/mp4" />
              Tu navegador no soporta la reproducción directa de video.
            </video>

            {/* Floating Sound Controls Overlay */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={toggleHeroMute}
                className="px-3.5 py-2 rounded-xl bg-black/75 hover:bg-black/95 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center gap-2 shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                {isHeroMuted ? (
                  <>
                    <VolumeX size={15} className="text-[#ffb703]" />
                    <span>Activar Sonido</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={15} className="text-[#00b4d8]" />
                    <span>Silenciar</span>
                  </>
                )}
              </button>
            </div>

            {/* Play Button Overlay when paused */}
            {!isHeroPlaying && (
              <div 
                className="absolute inset-0 bg-black/30 pointer-events-none flex items-center justify-center z-20"
              >
                <button
                  type="button"
                  onClick={toggleHeroPlay}
                  aria-label="Reproducir video de Shakira"
                  className="pointer-events-auto w-16 h-16 rounded-full bg-[#00b4d8] text-[#0a1128] flex items-center justify-center shadow-[0_0_30px_rgba(0,180,216,0.8)] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                >
                  <Play size={28} className="fill-current ml-1" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* METRICS BANNER */}
        <div className="max-w-[1200px] mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#101f42]/90 border border-white/10 p-5 rounded-2xl text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-[#00b4d8]">24 / 7</div>
            <div className="text-xs text-[#94a3b8]">Atención Ininterrumpida</div>
          </div>
          <div className="bg-[#101f42]/90 border border-white/10 p-5 rounded-2xl text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-[#ffb703]">&lt; 1 min</div>
            <div className="text-xs text-[#94a3b8]">Tiempo de Respuesta a Leads</div>
          </div>
          <div className="bg-[#101f42]/90 border border-white/10 p-5 rounded-2xl text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">+42%</div>
            <div className="text-xs text-[#94a3b8]">Tasa de Asistencia a Citas</div>
          </div>
          <div className="bg-[#101f42]/90 border border-white/10 p-5 rounded-2xl text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-[#48cae4]">100% PR</div>
            <div className="text-xs text-[#94a3b8]">Enfocado en Puerto Rico</div>
          </div>
        </div>
      </section>

      {/* 2. CÓMO FUNCIONA EL MOTOR DE SHAKIRA Y AMIGO AI */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="bg-[#101f42]/80 border border-[#00b4d8]/30 rounded-3xl p-8 sm:p-12 space-y-10 shadow-2xl relative overflow-hidden">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-[#00b4d8] uppercase tracking-widest">
              Embudo de Ventas Inteligente
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              De Visitante Anónimo a Cita Pre-Calificada en 4 Pasos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-[#0a1128] rounded-2xl border border-white/10 space-y-3 relative group hover:border-[#00b4d8]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#00b4d8]/20 text-[#00b4d8] flex items-center justify-center font-black text-lg">
                1
              </div>
              <h3 className="text-base font-bold text-white">Descubrimiento</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                El comprador explora tu inventario multimarca en el catálogo o interactúa directamente con el buscador por pago mensual.
              </p>
            </div>

            <div className="p-6 bg-[#0a1128] rounded-2xl border border-[#ffb703]/30 space-y-3 relative group hover:border-[#ffb703] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#ffb703]/20 text-[#ffb703] flex items-center justify-center font-black text-lg">
                2
              </div>
              <h3 className="text-base font-bold text-white">Asistencia con Shakira</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Nuestra ejecutiva virtual responde preguntas técnicas, muestra fotos y calcula pagos estimados orientativos.
              </p>
            </div>

            <div className="p-6 bg-[#0a1128] rounded-2xl border border-emerald-500/30 space-y-3 relative group hover:border-emerald-500 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg">
                3
              </div>
              <h3 className="text-base font-bold text-white">Pre-Calificación</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Se recopila crédito preliminar (A, B, C, D), pronto aportado, datos de trade-in y consentimiento de contacto.
              </p>
            </div>

            <div className="p-6 bg-[#0a1128] rounded-2xl border border-[#48cae4]/30 space-y-3 relative group hover:border-[#48cae4] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#48cae4]/20 text-[#48cae4] flex items-center justify-center font-black text-lg">
                4
              </div>
              <h3 className="text-base font-bold text-white">Cita Confirmada</h3>
              <p className="text-xs text-[#94a3b8] leading-relaxed">
                Se agenda la cita en Google Calendar y se despacha alerta inmediata vía WhatsApp al gerente de ventas del dealer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SIMULADOR DE CAPTURA DE LEADS PARA DEALERS */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 relative aspect-video w-full rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(0,180,216,0.25)] border border-white/10 bg-[#0a1128]">
              <video
                autoPlay
                muted
                playsInline
                loop
                controls
                preload="auto"
                poster="/shakira_poster.jpg"
                className="w-full h-full object-cover"
                src="/shakira_intro.mp4"
              >
                <source src="/shakira_intro.mp4" type="video/mp4" />
                <source src="/Shakira_intro.mp4" type="video/mp4" />
                Tu navegador no soporta la reproducción de video.
              </video>
          </div>

          <div className="lg:col-span-6 bg-gradient-to-br from-[#101f42] to-[#0a1128] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00b4d8]/20 border border-[#00b4d8] flex items-center justify-center font-black text-white text-xs">
                  SH
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Shakira • Amigo AI</div>
                  <div className="text-[11px] text-emerald-400 font-medium">Asesora Activa en Tiempo Real</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                WhatsApp Ready
              </span>
            </div>

            {/* Simulated chat preview for dealers */}
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="bg-[#0a1128] p-3 rounded-2xl rounded-tl-none border border-white/5 text-[#f1f5f9]">
                ¡Hola! Veo que buscas una guagua familiar con pago menor a $450/mes. Tenemos una Hyundai Tucson 2022 con poco millaje en Caguas. ¿Te gustaría agendar una prueba de manejo para mañana?
              </div>
              <div className="bg-[#00b4d8] text-[#0a1128] p-3 rounded-2xl rounded-tr-none font-semibold ml-auto max-w-[85%]">
                ¡Sí me interesa! ¿Qué documentos necesito llevar al dealer?
              </div>
              <div className="bg-[#0a1128] p-3 rounded-2xl rounded-tl-none border border-white/5 text-[#f1f5f9]">
                Para tu cita lleva tu licencia vigente, talonario o W2 y factura de luz/agua. Ya aparté tu espacio con el asesor asignado. 🇵🇷
              </div>
            </div>

            <div className="p-3 bg-[#00b4d8]/10 rounded-xl border border-[#00b4d8]/30 flex items-center justify-between text-xs">
              <span className="text-[#48cae4] font-semibold">Integración con WhatsApp & CRM</span>
              <span className="text-white font-bold">Automático</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SHOWCASE DEL MARKETPLACE B2C */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="text-xs font-bold text-[#00b4d8] uppercase tracking-widest">
              Acceso Directo para Compradores
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Explora el Catálogo Multimarca de Puerto Rico
            </h2>
          </div>
          <button
            onClick={() => navigate("/inventario")}
            className="px-4 py-2 rounded-xl bg-[#00b4d8] hover:bg-[#48cae4] text-[#0a1128] font-bold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Ver todos los vehículos</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleVehicles.map((v, i) => (
            <div
              key={i}
              onClick={() => navigate("/inventario")}
              className="bg-[#101f42] border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-[#00b4d8]/50 transition-all hover:scale-[1.02] space-y-3 p-3.5 group"
            >
              <div className="aspect-[16/10] bg-[#0a1128] rounded-xl overflow-hidden">
                <img
                  referrerPolicy="no-referrer"
                  src={String(v.FotoWeblink || "").split(",")[0]}
                  alt={`${v.Marca} ${v.Modelo}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-bold text-sm truncate">
                  {v["Año"]} {v.Marca} {v.Modelo}
                </h4>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-[#94a3b8]">{v.Municipio || "Puerto Rico"}</span>
                  <span className="text-sm font-black text-[#00b4d8]">
                    {formatCurrency(Number(String(v.Precio || "").replace(/[^0-9.]/g, "")) || 0)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
export default RootDealerLanding;
