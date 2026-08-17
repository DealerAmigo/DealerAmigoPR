import React, { useState } from "react";
import { PageRoute, FilterState, Vehicle } from "../types";
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, MessageSquare, Car, DollarSign, RefreshCw, MapPin } from "lucide-react";

interface AiVehicleFinderProps {
  inventory?: Vehicle[];
  navigate: (route: PageRoute) => void;
  openAmigoChat: (initialMsg?: string) => void;
  onApplyFilters?: (filters: Partial<FilterState>) => void;
  onSelectVehicle?: (v: any) => void;
}

export const AiVehicleFinder: React.FC<AiVehicleFinderProps> = ({
  inventory,
  navigate,
  openAmigoChat,
  onApplyFilters,
  onSelectVehicle
}) => {
  const [step, setStep] = useState(1);

  // Wizard state
  const [usoPrincipal, setUsoPrincipal] = useState("Auto diario / económico para el trabajo");
  const [carroceria, setCarroceria] = useState("Sedán");
  const [pagoMensual, setPagoMensual] = useState("350");
  const [pronto, setPronto] = useState("2000");
  const [tradeInType, setTradeInType] = useState("No");
  const [tradeDetails, setTradeDetails] = useState("");
  const [municipio, setMunicipio] = useState("Bayamón");

  const handleFinishWizard = () => {
    // 1. Configure filter mapping
    let mappedCarroceria = "Todos";
    if (usoPrincipal.includes("SUV")) mappedCarroceria = "SUV";
    else if (usoPrincipal.includes("Pickup")) mappedCarroceria = "Pickup";
    else if (usoPrincipal.includes("Comercial") || usoPrincipal.includes("Van")) mappedCarroceria = "Comercial";
    else if (usoPrincipal.includes("diario") || usoPrincipal.includes("económico")) mappedCarroceria = "Sedán";

    if (onApplyFilters) {
      onApplyFilters({
        carroceria: mappedCarroceria,
        pagoMax: pagoMensual,
        municipio: municipio.includes("Metro") ? "San Juan" : (municipio === "Cualquiera en PR" ? "Todos" : municipio),
        tradeIn: tradeInType
      });
    }

    // 2. Open chat session with Amigo with pre-compiled briefing
    const chatPrompt = `¡Hola Shakira! Completé el buscador inteligente de DealerAmigo:
• Busco: ${usoPrincipal} (${mappedCarroceria})
• Pago mensual ideal: ~$${pagoMensual}/mes con pronto de $${pronto}
• Trade-in: ${tradeInType === "Sí" ? `Sí (${tradeDetails || "tengo auto"})` : "No tengo"}
• Municipio: ${municipio}

¿Cuáles son las mejores opciones disponibles hoy que me recomiendas?`;

    openAmigoChat(chatPrompt);
    navigate("/inventario");
  };

  return (
    <div className="max-w-[850px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#101f42] border border-[#00b4d8]/40 text-xs font-bold text-[#48cae4] uppercase tracking-widest">
          <Sparkles size={13} className="text-[#00b4d8]" />
          <span>AI VEHICLE FINDER WIZARD</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Encuentra tu Carro Ideal con Amigo
        </h1>
        <p className="text-[#94a3b8] text-sm sm:text-base max-w-xl mx-auto">
          Responde 4 preguntas sencillas y nuestro asistente inteligente filtrará las mejores alternativas para ti en todo Puerto Rico.
        </p>
      </div>

      {/* Wizard Progress Bar */}
      <div className="flex items-center justify-between gap-2 max-w-md mx-auto pt-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
            <div 
              className={`w-full h-2 rounded-full transition-all ${
                s <= step ? "bg-gradient-to-r from-[#00b4d8] to-[#48cae4]" : "bg-[#1c2d5a]"
              }`}
            />
            <span className={`text-[10px] font-bold ${s === step ? "text-[#00b4d8]" : "text-[#94a3b8]"}`}>
              Paso {s}
            </span>
          </div>
        ))}
      </div>

      {/* Wizard Card Frame */}
      <div className="bg-[#101f42]/90 border border-[#00b4d8]/30 rounded-3xl p-6 sm:p-10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)] backdrop-blur-xl space-y-8">
        
        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00b4d8]/20 flex items-center justify-center text-[#00b4d8] shrink-0">
                <Car size={20} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Paso 1: ¿Qué tipo de vehículo necesitas y para qué uso principal?
                </h3>
                <p className="text-xs text-[#94a3b8]">Selecciona la categoría que mejor describa tu rutina.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { title: "Auto diario / económico", desc: "Sedán o compacto para ahorrar gasolina y transportarte cómodamente.", type: "Sedán" },
                { title: "SUV familiar y espaciosa", desc: "Para viajes en familia, mayor altura y comodidad en carretera.", type: "SUV" },
                { title: "Pickup para carga / 4x4", desc: "Capacidad de arrastre, fuerza y resistencia para todo terreno.", type: "Pickup" },
                { title: "Van comercial / de carga", desc: "Espacio amplio para entrega de mercancía o herramientas de negocio.", type: "Comercial" },
                { title: "Crossover versátil", desc: "El balance perfecto entre agilidad de auto y espacio de SUV.", type: "Hatchback / Crossover" }
              ].map((opt) => (
                <button
                  key={opt.title}
                  type="button"
                  onClick={() => {
                    setUsoPrincipal(opt.title);
                    setCarroceria(opt.type);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                    usoPrincipal === opt.title
                      ? "bg-[#1c2d5a] border-[#00b4d8] shadow-[0_0_15px_rgba(0,180,216,0.3)]"
                      : "bg-[#0a1128] border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-bold text-white">{opt.title}</span>
                    {usoPrincipal === opt.title && <CheckCircle2 size={16} className="text-[#00b4d8]" />}
                  </div>
                  <p className="text-xs text-[#94a3b8]">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ffb703]/20 flex items-center justify-center text-[#ffb703] shrink-0">
                <DollarSign size={20} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Paso 2: ¿Cuál es tu presupuesto o pago mensual ideal?
                </h3>
                <p className="text-xs text-[#94a3b8]">Te ayudaremos a calcular opciones con pagos cómodos y viables.</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold text-[#f1f5f9] uppercase tracking-wider">
                Rango de Pago Mensual Deseado
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Menos de $300 / mes", val: "300" },
                  { label: "$300 - $400 / mes (Más Popular)", val: "400" },
                  { label: "$400 - $500 / mes", val: "500" },
                  { label: "$500 - $650 / mes", val: "650" }
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setPagoMensual(item.val)}
                    className={`p-4 rounded-xl border text-left flex items-center justify-between ${
                      pagoMensual === item.val
                        ? "bg-[#1c2d5a] border-[#ffb703] text-white font-bold"
                        : "bg-[#0a1128] border-white/10 text-[#94a3b8]"
                    }`}
                  >
                    <span>{item.label}</span>
                    {pagoMensual === item.val && <CheckCircle2 size={16} className="text-[#ffb703]" />}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-[#f1f5f9] mb-1.5">
                  ¿Cuánto pronto o pago inicial tienes contemplado aportar? ($)
                </label>
                <select
                  value={pronto}
                  onChange={(e) => setPronto(e.target.value)}
                  className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00b4d8]"
                >
                  <option value="0">$0 (Sin pronto / financiamiento 100%)</option>
                  <option value="1000">$1,000 pronto</option>
                  <option value="2000">$2,000 pronto</option>
                  <option value="3000">$3,000 pronto</option>
                  <option value="5000">$5,000 o más</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00b4d8]/20 flex items-center justify-center text-[#00b4d8] shrink-0">
                <RefreshCw size={20} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Paso 3: ¿Tienes algún auto para entregar en Trade-in?
                </h3>
                <p className="text-xs text-[#94a3b8]">Entregar tu carro actual reduce tu pago mensual inmediatamente.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTradeInType("No")}
                className={`p-4 rounded-xl border text-left ${
                  tradeInType === "No"
                    ? "bg-[#1c2d5a] border-[#00b4d8] text-white font-bold"
                    : "bg-[#0a1128] border-white/10 text-[#94a3b8]"
                }`}
              >
                <div className="text-sm font-bold text-white">No tengo trade-in</div>
                <div className="text-xs text-[#94a3b8] mt-0.5">Comenzaré con pago inicial o financiamiento directo.</div>
              </button>

              <button
                type="button"
                onClick={() => setTradeInType("Sí")}
                className={`p-4 rounded-xl border text-left ${
                  tradeInType === "Sí"
                    ? "bg-[#1c2d5a] border-[#ffb703] text-white font-bold"
                    : "bg-[#0a1128] border-white/10 text-[#94a3b8]"
                }`}
              >
                <div className="text-sm font-bold text-white">Sí, tengo un auto para trade-in</div>
                <div className="text-xs text-[#94a3b8] mt-0.5">Quiero que Amigo evalúe su valor referencial.</div>
              </button>
            </div>

            {tradeInType === "Sí" && (
              <div className="pt-2 animate-in fade-in duration-200">
                <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5">
                  Cuéntanos brevemente sobre tu auto actual (Año, Marca, Modelo, Condición):
                </label>
                <input
                  type="text"
                  value={tradeDetails}
                  onChange={(e) => setTradeDetails(e.target.value)}
                  placeholder="ej. Toyota Corolla 2018 LE, 65,000 millas, buenas condiciones"
                  className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#00b4d8]"
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00b4d8]/20 flex items-center justify-center text-[#48cae4] shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Paso 4: ¿En qué municipio o zona te encuentras?
                </h3>
                <p className="text-xs text-[#94a3b8]">Priorizaremos inventario y dealers autorizados cercanos a ti.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                "Bayamón",
                "San Juan / Metro",
                "Caguas / Centro",
                "Ponce / Sur",
                "Mayagüez / Oeste",
                "Arecibo / Norte",
                "Dorado / Vega Alta",
                "Guaynabo",
                "Carolina / Este",
                "Cualquiera en PR"
              ].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMunicipio(m)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    municipio === m
                      ? "bg-[#00b4d8] text-[#0a1128] border-[#00b4d8]"
                      : "bg-[#0a1128] text-[#94a3b8] border-white/10 hover:text-white"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Final Summary Card */}
            <div className="bg-[#0a1128] p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
              <div className="text-[#00b4d8] font-bold uppercase tracking-wider">Resumen de tu búsqueda:</div>
              <div className="text-[#f1f5f9]">
                • <strong>Categoría:</strong> {usoPrincipal} <br />
                • <strong>Presupuesto:</strong> ~${pagoMensual}/mes con pronto de ${pronto} <br />
                • <strong>Trade-In:</strong> {tradeInType === "Sí" ? (tradeDetails || "Sí aporto trade-in") : "Sin trade-in"} <br />
                • <strong>Zona:</strong> {municipio}
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 rounded-xl bg-[#0a1128] text-[#94a3b8] hover:text-white text-xs font-bold flex items-center gap-1.5 border border-white/10"
            >
              <ArrowLeft size={15} />
              <span>Anterior</span>
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-[#00b4d8] hover:bg-[#48cae4] text-[#0a1128] text-xs font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,180,216,0.35)]"
            >
              <span>Siguiente</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishWizard}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#ffb703] text-[#0a1128] text-sm font-black flex items-center gap-2 shadow-[0_0_25px_rgba(0,180,216,0.5)] hover:brightness-110 transition-all hover:scale-105"
            >
              <Sparkles size={16} />
              <span>Ver Resultados & Conectar con Amigo</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
