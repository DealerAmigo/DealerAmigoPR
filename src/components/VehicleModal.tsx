import React, { useState } from "react";
import { Vehicle, PageRoute } from "../types";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  MessageSquare, 
  Calculator, 
  Gauge, 
  Fuel, 
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { 
  parsePrice, 
  getEstimatedMonthlyPayment, 
  formatCurrency, 
  inferCarroceria,
  inferDealer,
  inferMunicipio
} from "../utils/helpers";

interface VehicleModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  navigate: (route: PageRoute) => void;
  openAmigoChat: (initialMsg?: string) => void;
  onBookAppointment: (v: Vehicle) => void;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  vehicle,
  onClose,
  navigate,
  openAmigoChat,
  onBookAppointment
}) => {
  if (!vehicle) return null;

  const photos = String(vehicle.FotoWeblink || "").split(",").map(u => u.trim()).filter(Boolean);
  const [photoIdx, setPhotoIdx] = useState(0);

  // Dynamic Payment Estimator inside modal
  const [downPayment, setDownPayment] = useState(2000);
  const [termMonths, setTermMonths] = useState(72);
  const priceNum = parsePrice(vehicle.Precio);
  const monthlyCalc = getEstimatedMonthlyPayment(vehicle.Precio, downPayment, termMonths);

  const municipio = vehicle.Municipio || inferMunicipio(vehicle, 0);
  const dealer = vehicle.Dealer || inferDealer(vehicle, 0);
  const carroceria = inferCarroceria(vehicle);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0a1128]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#101f42] border border-[#00b4d8]/40 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(0,180,216,0.3)] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a1128]/80">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00b4d8]/20 text-[#48cae4] font-black uppercase">
              {carroceria}
            </span>
            <span className="text-xs text-[#94a3b8]">ID: PR-{vehicle.Marca.toUpperCase()}-{vehicle["Año"]}</span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#94a3b8] hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8 flex-1">
          
          {/* Top Grid: Gallery & Main Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Gallery (Col 7) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#0a1128] border border-white/10">
                {photos.length > 0 ? (
                  <img
                    referrerPolicy="no-referrer"
                    src={photos[photoIdx]}
                    alt={`${vehicle["Año"]} ${vehicle.Marca} ${vehicle.Modelo}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-center p-6 text-[#94a3b8]">
                    Sin foto disponible
                  </div>
                )}

                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setPhotoIdx((photoIdx - 1 + photos.length) % photos.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#0a1128]/80 text-white flex items-center justify-center hover:bg-[#00b4d8] hover:text-[#0a1128] transition-colors border border-white/20"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setPhotoIdx((photoIdx + 1) % photos.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#0a1128]/80 text-white flex items-center justify-center hover:bg-[#00b4d8] hover:text-[#0a1128] transition-colors border border-white/20"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-[#0a1128]/80 text-white text-xs font-semibold border border-white/10 backdrop-blur-md">
                  {photoIdx + 1} de {photos.length} fotos
                </div>
              </div>

              {/* Thumbnail Strip */}
              {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {photos.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPhotoIdx(idx)}
                      className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        photoIdx === idx ? "border-[#00b4d8] scale-105" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img referrerPolicy="no-referrer" src={p} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Details & Dealer Info (Col 5) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-xs font-bold text-[#48cae4] uppercase tracking-wider mb-1">
                  {vehicle["Año"]} • {vehicle.Marca}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {vehicle.Modelo} {vehicle["Sub-Modelo/Trim Level"]}
                </h2>

                <div className="text-3xl font-black text-white mt-3 tracking-tight">
                  {vehicle.Precio}
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-[#0a1128] border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Building2 size={15} className="text-[#00b4d8]" />
                    <span>{dealer}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#94a3b8]">
                    <MapPin size={15} className="text-[#ffb703]" />
                    <span>Ubicación: {municipio}, Puerto Rico</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-400 font-medium pt-1 border-t border-white/5">
                    <ShieldCheck size={15} />
                    <span>Unidad Verificada en Inventario</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onBookAppointment(vehicle);
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#48cae4] text-[#0a1128] font-black text-sm shadow-[0_0_20px_rgba(0,180,216,0.35)] hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  <Calendar size={16} />
                  <span>Coordinar Prueba de Manejo</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    openAmigoChat(`¡Hola Amigo! Me interesa el ${vehicle["Año"]} ${vehicle.Marca} ${vehicle.Modelo} con precio de ${vehicle.Precio}. ¿Cómo quedaría mi pago mensual si doy un pronto de $${downPayment}?`);
                  }}
                  className="w-full py-3 rounded-xl bg-[#1c2d5a] hover:bg-[#1c2d5a]/80 text-[#f1f5f9] font-bold text-xs border border-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare size={15} className="text-[#00b4d8]" />
                  <span>Preguntar a Amigo sobre este carro</span>
                </button>
              </div>
            </div>

          </div>

          {/* Technical Specs & Equipment */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#48cae4]">
              Especificaciones Técnicas
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#0a1128] p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-[#94a3b8]">Motor / Potencia</span>
                <div className="font-bold text-white line-clamp-1">{vehicle["Motor/hp"] || "Estándar"}</div>
              </div>
              <div className="bg-[#0a1128] p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-[#94a3b8]">Transmisión</span>
                <div className="font-bold text-white line-clamp-1">{vehicle["Transmisión"] || "Automática"}</div>
              </div>
              <div className="bg-[#0a1128] p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-[#94a3b8]">Consumo (MPG)</span>
                <div className="font-bold text-white">{vehicle.MPG || "24/30"} mpg</div>
              </div>
              <div className="bg-[#0a1128] p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-[#94a3b8]">Millaje Certificado</span>
                <div className="font-bold text-white">{vehicle.Millaje ? `${vehicle.Millaje} millas` : "Bajo Millaje"}</div>
              </div>
            </div>
          </div>

          {/* Dynamic Payment Calculator Widget */}
          <div className="bg-[#0a1128] border border-[#ffb703]/30 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Calculator size={18} className="text-[#ffb703]" />
                <span className="text-sm font-bold text-white">Calculadora Orientativa de Pago Mensual</span>
              </div>
              <div className="text-xs text-[#ffb703] font-black">
                Pago Estimado: ~${monthlyCalc}/mes
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[#f1f5f9] font-semibold mb-1">
                  Pronto Pago / Pago Inicial: ${downPayment.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="0"
                  max={Math.min(priceNum, 10000)}
                  step="500"
                  value={downPayment}
                  onChange={e => setDownPayment(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-[#101f42] rounded-lg appearance-none cursor-pointer accent-[#ffb703]"
                />
              </div>

              <div>
                <label className="block text-[#f1f5f9] font-semibold mb-1">
                  Plazo de Financiamiento: {termMonths} meses ({termMonths / 12} años)
                </label>
                <div className="flex gap-2">
                  {[48, 60, 72, 84].map(t => (
                    <button
                      key={t}
                      onClick={() => setTermMonths(t)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                        termMonths === t ? "bg-[#ffb703] text-[#0a1128]" : "bg-[#101f42] text-[#94a3b8]"
                      }`}
                    >
                      {t}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-[#94a3b8] italic">
              * Cálculo referencial con tasa estimada del 6.99% APR. El pago final será determinado por la institución bancaria o cooperativa tras evaluar tu perfil crediticio y términos oficiales del dealer.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
