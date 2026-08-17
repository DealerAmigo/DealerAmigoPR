import React, { useState, useRef, useEffect } from "react";
import { PageRoute, FilterState, Vehicle } from "../types";
import { 
  CARROCERIAS, 
  MARCAS_POPULARES, 
  MUNICIPIOS_PR, 
  filterAndSortVehicles 
} from "../utils/helpers";
import { VehicleCard } from "./VehicleCard";
import { 
  Search, 
  Sparkles, 
  MessageSquare, 
  Building2, 
  ArrowRight, 
  ShieldCheck, 
  Calculator, 
  Clock, 
  CalendarCheck, 
  CheckCircle2,
  TrendingUp,
  MapPin,
  Volume2,
  VolumeX,
  Play,
  Pause
} from "lucide-react";

interface HomeHeroAndSearchProps {
  navigate: (route: PageRoute) => void;
  openAmigoChat: (initialMsg?: string) => void;
  inventory: Vehicle[];
  onApplyFilters?: (filters: Partial<FilterState>) => void;
  onSelectVehicle?: (v: Vehicle) => void;
}

export const HomeHeroAndSearch: React.FC<HomeHeroAndSearchProps> = ({
  navigate,
  openAmigoChat,
  inventory,
  onApplyFilters,
  onSelectVehicle
}) => {
  // Video player state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.defaultMuted = true;
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            setIsPlaying(false);
          });
      }
    }
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const newMuted = !video.muted;
    video.muted = newMuted;
    setIsMuted(newMuted);
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };
  // Smart Search form state
  const [carroceria, setCarroceria] = useState("Todos");
  const [marca, setMarca] = useState("Todas");
  const [modelo, setModelo] = useState("Cualquiera");
  const [anoMin, setAnoMin] = useState("2018");
  const [anoMax, setAnoMax] = useState("2026");
  const [precioMax, setPrecioMax] = useState("");
  const [pagoMax, setPagoMax] = useState("");
  const [municipio, setMunicipio] = useState("Todos");
  const [condicion, setCondicion] = useState("Todos");
  const [cobertura, setCobertura] = useState("Todos");
  const [tieneTrade, setTieneTrade] = useState("No");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onApplyFilters) {
      onApplyFilters({
        carroceria,
        marca,
        modelo: modelo === "Cualquiera" ? "" : modelo,
        anoMin,
        anoMax,
        precioMax,
        pagoMax,
        municipio,
        condicion,
        cobertura,
        tradeIn: tieneTrade
      });
    }
    navigate("/inventario");
  };

  // Preview of top 6 featured vehicles
  const featuredVehicles = inventory.slice(0, 6);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-8 sm:pt-14 px-4 sm:px-6">
        <div className="max-w-[1240px] mx-auto text-center space-y-6">
          {/* Shakira Presentation Video */}
          <div className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,180,216,0.25)] border border-[#00b4d8]/30 bg-[#0a1128] relative aspect-video mt-4 mb-6 group">
            <video 
              ref={videoRef}
              autoPlay 
              muted 
              loop 
              playsInline 
              controls
              preload="auto"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-cover cursor-pointer"
              onClick={togglePlay}
            >
              <source src="https://drive.google.com/uc?export=download&id=1nSt9jOHyaf5CS_Pn4AdvXSsQDrzwSbhe" type="video/mp4" />
              Tu navegador no soporta la reproducción directa de video.
            </video>

            {/* Floating Sound and Play/Pause Controls Overlay */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className="px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                {isMuted ? (
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
            {!isPlaying && (
              <div 
                onClick={togglePlay}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer z-10"
              >
                <div className="w-16 h-16 rounded-full bg-[#00b4d8] text-[#0a1128] flex items-center justify-center shadow-[0_0_30px_rgba(0,180,216,0.6)] hover:scale-110 transition-transform">
                  <Play size={28} className="fill-current ml-1" />
                </div>
              </div>
            )}
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => navigate("/inventario")}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#48cae4] text-[#0a1128] font-black text-sm sm:text-base shadow-[0_0_25px_rgba(0,180,216,0.45)] hover:brightness-110 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Ver inventario</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => openAmigoChat("¡Hola Amigo! Quiero que me ayudes a encontrar opciones según mi presupuesto.")}
              className="px-6 py-3.5 rounded-xl bg-[#1c2d5a] hover:bg-[#1c2d5a]/80 text-[#f1f5f9] font-bold text-sm sm:text-base border border-white/10 transition-all hover:scale-105 flex items-center gap-2 shadow-md"
            >
              <MessageSquare size={17} className="text-[#00b4d8]" />
              <span>Hablar con Amigo</span>
            </button>

            <button
              onClick={() => window.open("https://atiende-recepcionista-ia.ai.studio", "_blank")}
              className="px-5 py-3.5 rounded-xl bg-[#101f42]/80 hover:bg-[#101f42] text-[#ffb703] font-bold text-xs sm:text-sm border border-[#ffb703]/30 transition-all flex items-center gap-1.5"
            >
              <Building2 size={15} />
              <span>Soy dealer</span>
            </button>
          </div>
        </div>

        {/* WIDGET: BUSCADOR INTELIGENTE EN VIVO */}
        <div className="max-w-[1200px] mx-auto mt-12 sm:mt-16">
          <div className="bg-[#101f42]/95 border border-[#00b4d8]/40 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(0,180,216,0.2)] backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#00b4d8]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 text-[#00b4d8] text-xs font-black uppercase tracking-widest">
                  <Search size={14} />
                  <span>Buscador Inteligente en Vivo</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  Filtra entre {inventory.length}+ Vehículos en Puerto Rico
                </h3>
              </div>
              <div className="text-xs text-[#94a3b8] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Actualizado hoy</span>
              </div>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Tipo de Carrocería */}
                <div>
                  <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5">
                    Tipo de Carrocería
                  </label>
                  <select
                    value={carroceria}
                    onChange={(e) => setCarroceria(e.target.value)}
                    className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00b4d8]"
                  >
                    {CARROCERIAS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Marca */}
                <div>
                  <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5">
                    Marca
                  </label>
                  <select
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00b4d8]"
                  >
                    {MARCAS_POPULARES.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* 3. Modelo */}
                <div>
                  <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5">
                    Modelo
                  </label>
                  <input
                    type="text"
                    value={modelo === "Cualquiera" ? "" : modelo}
                    onChange={(e) => setModelo(e.target.value || "Cualquiera")}
                    placeholder="Ej. Tucson, F-150, Forte..."
                    className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#00b4d8]"
                  />
                </div>

                {/* 4. Rango de Año */}
                <div>
                  <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5">
                    Rango de Año
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={anoMin}
                      onChange={(e) => setAnoMin(e.target.value)}
                      className="w-1/2 bg-[#0a1128] border border-white/10 rounded-xl px-2.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00b4d8]"
                    >
                      {["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <span className="text-[#94a3b8] text-xs">a</span>
                    <select
                      value={anoMax}
                      onChange={(e) => setAnoMax(e.target.value)}
                      className="w-1/2 bg-[#0a1128] border border-white/10 rounded-xl px-2.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00b4d8]"
                    >
                      {["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 5. Presupuesto Máximo */}
                <div>
                  <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5">
                    Presupuesto Máximo ($)
                  </label>
                  <select
                    value={precioMax}
                    onChange={(e) => setPrecioMax(e.target.value)}
                    className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00b4d8]"
                  >
                    <option value="">Sin límite</option>
                    <option value="20000">Hasta $20,000</option>
                    <option value="25000">Hasta $25,000</option>
                    <option value="30000">Hasta $30,000</option>
                    <option value="40000">Hasta $40,000</option>
                    <option value="50000">Hasta $50,000</option>
                  </select>
                </div>

                {/* 6. Pago Mensual Deseado */}
                <div>
                  <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5 flex items-center justify-between">
                    <span>Pago Mensual ($/mes)</span>
                    <span className="text-[10px] text-[#ffb703] font-bold">Estimado</span>
                  </label>
                  <select
                    value={pagoMax}
                    onChange={(e) => setPagoMax(e.target.value)}
                    className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00b4d8]"
                  >
                    <option value="">Cualquier pago</option>
                    <option value="300">Menos de $300/mes</option>
                    <option value="400">Menos de $400/mes</option>
                    <option value="500">Menos de $500/mes</option>
                    <option value="600">Menos de $600/mes</option>
                  </select>
                </div>

                {/* 7. Municipio */}
                <div>
                  <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5">
                    Municipio
                  </label>
                  <select
                    value={municipio}
                    onChange={(e) => setMunicipio(e.target.value)}
                    className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00b4d8]"
                  >
                    {MUNICIPIOS_PR.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* 8. Condición */}
                <div>
                  <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5">
                    Condición
                  </label>
                  <select
                    value={condicion}
                    onChange={(e) => setCondicion(e.target.value)}
                    className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00b4d8]"
                  >
                    <option value="Todos">Todos</option>
                    <option value="Nuevo">Nuevo</option>
                    <option value="Usado">Usado</option>
                    <option value="Certificado">Certificado</option>
                  </select>
                </div>

                {/* 9. Cobertura */}
                <div>
                  <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5">
                    Cobertura
                  </label>
                  <select
                    value={cobertura}
                    onChange={(e) => setCobertura(e.target.value)}
                    className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00b4d8]"
                  >
                    <option value="Todos">Todos</option>
                    <option value="Con Garantía">Con Garantía</option>
                    <option value="Venta As-Is / Sin Garantía">Venta As-Is / Sin Garantía</option>
                  </select>
                </div>

                {/* 10. ¿Tienes Trade-In? */}
                <div>
                  <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5">
                    ¿Tienes Trade-In?
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTieneTrade("Sí")}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        tieneTrade === "Sí"
                          ? "bg-[#ffb703] text-[#0a1128] border-[#ffb703]"
                          : "bg-[#0a1128] text-[#94a3b8] border-white/10 hover:text-white"
                      }`}
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      onClick={() => setTieneTrade("No")}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        tieneTrade === "No"
                          ? "bg-[#1c2d5a] text-[#48cae4] border-[#00b4d8]"
                          : "bg-[#0a1128] text-[#94a3b8] border-white/10 hover:text-white"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* Quick AI Search Trigger */}
                <div className="sm:col-span-2 flex items-end">
                  <button
                    type="button"
                    onClick={() => navigate("/buscar-carro")}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#1c2d5a]/60 hover:bg-[#1c2d5a] text-[#48cae4] text-xs font-bold border border-[#00b4d8]/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <Sparkles size={14} className="text-[#00b4d8]" />
                    <span>¿No estás seguro? Usa el Asistente Wizard de 4 Pasos</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#00b4d8] text-[#0a1128] font-black text-base sm:text-lg shadow-[0_0_25px_rgba(0,180,216,0.5)] hover:brightness-110 transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Search size={20} className="text-[#0a1128]" />
                  <span>Buscar 140+ Vehículos Disponibles</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* SECTION 1: PROPUESTA DE VALOR */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="bg-[#101f42]/70 border border-white/10 rounded-3xl p-8 sm:p-12 backdrop-blur-md relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="text-xs font-black tracking-widest text-[#00b4d8] uppercase">
                Plataforma Abierta y Neutral
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Más opciones para encontrar tu carro
              </h2>
              <p className="text-[#94a3b8] text-sm sm:text-base leading-relaxed">
                No estamos limitados a un solo dealer. Te ayudamos a explorar opciones de diferentes dealers y vendedores participantes en toda la Isla, comparando inventario real en un solo lugar sin presiones.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-[#f1f5f9] font-medium bg-[#0a1128]/60 p-3 rounded-xl border border-white/5">
                  <CheckCircle2 size={16} className="text-[#00b4d8]" />
                  <span>Inventario actualizado diariamente</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#f1f5f9] font-medium bg-[#0a1128]/60 p-3 rounded-xl border border-white/5">
                  <CheckCircle2 size={16} className="text-[#00b4d8]" />
                  <span>Dealers autorizados en todo PR</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#f1f5f9] font-medium bg-[#0a1128]/60 p-3 rounded-xl border border-white/5">
                  <CheckCircle2 size={16} className="text-[#00b4d8]" />
                  <span>Cero llamadas agresivas</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#f1f5f9] font-medium bg-[#0a1128]/60 p-3 rounded-xl border border-white/5">
                  <CheckCircle2 size={16} className="text-[#00b4d8]" />
                  <span>Evaluación justa de tu trade-in</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-gradient-to-br from-[#1c2d5a] to-[#101f42] p-6 rounded-2xl border border-[#00b4d8]/30 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#48cae4] font-bold uppercase">Red de Concesionarios</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-bold">Activo</span>
                </div>
                <div className="text-2xl font-black text-white">Puerto Rico Multi-Dealer</div>
                <p className="text-xs text-[#94a3b8]">
                  Conexión directa con concesionarios en San Juan, Bayamón, Caguas, Ponce, Dorado, Mayagüez y más.
                </p>
                <button
                  onClick={() => navigate("/inventario")}
                  className="w-full py-2.5 rounded-xl bg-[#00b4d8] hover:bg-[#48cae4] text-[#0a1128] font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Explorar Todo el Inventario</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: CONCIERGE IA AMIGO */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-[#101f42] via-[#1c2d5a]/60 to-[#0a1128] border border-[#00b4d8]/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="bg-[#0a1128] rounded-2xl border border-[#00b4d8]/30 p-5 shadow-2xl space-y-4">
                <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00b4d8] to-[#ffb703] p-0.5">
                    <div className="w-full h-full rounded-full bg-[#101f42] flex items-center justify-center font-bold text-xs text-white">
                      AM
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>Amigo AI</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-green-500/20 text-green-400 font-bold">En Línea</span>
                    </div>
                    <div className="text-[11px] text-[#94a3b8]">Concierge Automotriz de Puerto Rico</div>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="bg-[#101f42] p-3 rounded-2xl rounded-tl-sm text-[#f1f5f9] leading-relaxed border border-white/5">
                    ¡Hola! Dime qué presupuesto tienes mensual o cuánto pronto quieres dar, y te muestro las 3 mejores opciones disponibles hoy en la Isla.
                  </div>
                  <div className="bg-[#00b4d8] text-[#0a1128] font-semibold p-3 rounded-2xl rounded-tr-sm self-end ml-8 shadow-md">
                    Busco una SUV de menos de $400/mes y tengo un Corolla 2018 para trade-in.
                  </div>
                  <div className="bg-[#101f42] p-3 rounded-2xl rounded-tl-sm text-[#f1f5f9] leading-relaxed border border-white/5">
                    ¡Excelente combinación! Con tu trade-in podemos cotizar una Kia Sportage o una Nissan Rogue en Bayamón y San Juan. ¿Te gustaría coordinar una prueba de manejo?
                  </div>
                </div>

                <button
                  onClick={() => openAmigoChat("¡Hola Amigo! Busco opciones de SUV o autos con pago cómodo.")}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#48cae4] text-[#0a1128] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
                >
                  <MessageSquare size={14} />
                  <span>Probar Chat en Vivo con Amigo</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ffb703] uppercase tracking-widest">
                <Sparkles size={13} />
                <span>Asistente Inteligente de Compra</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Dile a Amigo lo que necesitas
              </h2>
              <p className="text-[#94a3b8] text-sm sm:text-base leading-relaxed">
                Cuéntale tu presupuesto, el tipo de vehículo que buscas y tus prioridades. Amigo analiza el inventario verificado en tiempo real para recomendarte las opciones más convenientes.
              </p>

              {/* Key points */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0a1128]/50 border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-[#00b4d8]/20 flex items-center justify-center text-[#48cae4] shrink-0 mt-0.5">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Orientación sin presiones</div>
                    <div className="text-xs text-[#94a3b8]">Explora y compara alternativas sin compromisos ni tácticas de venta agresivas.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0a1128]/50 border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-[#ffb703]/20 flex items-center justify-center text-[#ffb703] shrink-0 mt-0.5">
                    <Calculator size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Cálculo transparente de pagos estimados</div>
                    <div className="text-xs text-[#94a3b8]">Simula pronto, plazos y valor referencial de tu trade-in con claridad.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0a1128]/50 border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-[#00b4d8]/20 flex items-center justify-center text-[#48cae4] shrink-0 mt-0.5">
                    <Clock size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Asistencia 24/7 en español boricua</div>
                    <div className="text-xs text-[#94a3b8]">Disponible a cualquier hora, desde tu teléfono o computadora en Puerto Rico.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED INVENTORY CAROUSEL / GRID */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="text-xs font-bold text-[#00b4d8] uppercase tracking-widest">
              Unidades Destacadas
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Vehículos Verificados Recientes
            </h2>
          </div>
          <button
            onClick={() => navigate("/inventario")}
            className="text-xs sm:text-sm text-[#48cae4] hover:text-white font-bold flex items-center gap-1 transition-colors"
          >
            <span>Ver todo el inventario ({inventory.length}+)</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {featuredVehicles.map((v, i) => (
            <VehicleCard
              key={i}
              v={v}
              onClick={() => onSelectVehicle(v)}
            />
          ))}
        </div>
      </section>

      {/* SECTION 3: CONEXIÓN Y LOGÍSTICA */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="bg-[#101f42]/60 border border-white/10 rounded-3xl p-8 sm:p-12 backdrop-blur-md">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00b4d8] uppercase tracking-widest">
              <CalendarCheck size={14} />
              <span>Proceso Simple & Rápido</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Coordina sin complicarte
            </h2>
            <p className="text-[#94a3b8] text-sm sm:text-base leading-relaxed">
              Solicita información detallada, pide una llamada de orientación o coordina una prueba de manejo directamente con el dealer participante asignado.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left">
              <div className="bg-[#0a1128] p-5 rounded-2xl border border-white/5 space-y-2">
                <div className="text-2xl font-black text-[#00b4d8]">01</div>
                <div className="text-sm font-bold text-white">Elige tu vehículo</div>
                <div className="text-xs text-[#94a3b8]">Explora por marca, pago o municipio en nuestro catálogo verificado.</div>
              </div>
              <div className="bg-[#0a1128] p-5 rounded-2xl border border-white/5 space-y-2">
                <div className="text-2xl font-black text-[#ffb703]">02</div>
                <div className="text-sm font-bold text-white">Consulta con Amigo</div>
                <div className="text-xs text-[#94a3b8]">Calcula pronto, mensualidad y evalúa tu trade-in en segundos.</div>
              </div>
              <div className="bg-[#0a1128] p-5 rounded-2xl border border-white/5 space-y-2">
                <div className="text-2xl font-black text-[#48cae4]">03</div>
                <div className="text-sm font-bold text-white">Agenda tu cita</div>
                <div className="text-xs text-[#94a3b8]">Te conectamos con el dealer para que pruebes el auto sin rodeos.</div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => navigate("/agenda")}
                className="px-7 py-3 rounded-xl bg-[#1c2d5a] hover:bg-[#00b4d8] text-white hover:text-[#0a1128] font-bold text-sm transition-all border border-[#00b4d8]/40 shadow-md"
              >
                Coordinar Prueba de Manejo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: DEALER CALLOUT */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-[#101f42] via-[#1c2d5a] to-[#0a1128] border border-[#ffb703]/30 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-[#ffb703] uppercase tracking-widest">
              <Building2 size={14} />
              <span>Para Concesionarios en Puerto Rico</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              ¿Eres dealer?
            </h2>
            <p className="text-[#94a3b8] text-sm sm:text-base leading-relaxed">
              Convierte tu inventario en conversaciones y citas calificadas. <strong>Amigo</strong> puede responder preguntas, cualificar prospectos y ayudarte a dar seguimiento 24/7.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => window.open("https://atiende-recepcionista-ia.ai.studio", "_blank")}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#ffb703] to-[#fb8500] text-[#0a1128] font-black text-sm shadow-[0_0_20px_rgba(255,183,3,0.35)] hover:brightness-110 transition-all hover:scale-105"
            >
              Quiero recibir más clientes
            </button>
            <button
              onClick={() => window.open("https://atiende-recepcionista-ia.ai.studio", "_blank")}
              className="px-5 py-3.5 rounded-xl bg-[#0a1128] text-[#f1f5f9] hover:text-white font-bold text-xs border border-white/10 transition-colors"
            >
              Registro Rápido
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
