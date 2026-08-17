import React, { useState } from "react";
import { Vehicle, PageRoute } from "../types";
import { 
  getVehicleSlug, 
  parsePrice, 
  getEstimatedMonthlyPayment, 
  formatCurrency, 
  inferCarroceria,
  inferDealer,
  inferMunicipio,
  DEALERS_PR
} from "../utils/helpers";
import { 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  Calendar, 
  Calculator, 
  ShieldCheck, 
  MapPin, 
  Building2, 
  Fuel, 
  Gauge, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  PhoneCall, 
  Share2, 
  Clock,
  ExternalLink
} from "lucide-react";
import { LeadModal } from "./LeadModal";
import { toVehicleData } from "./VehicleCard";
import { LegalDisclosures } from "./LegalDisclosures";

interface VehicleDetailPageProps {
  vehicle: Vehicle;
  inventory: Vehicle[];
  navigate: (route: PageRoute) => void;
  openAmigoChat: (initialMsg?: string) => void;
  onBookAppointment: (v: Vehicle) => void;
}

export const VehicleDetailPage: React.FC<VehicleDetailPageProps> = ({
  vehicle,
  inventory,
  navigate,
  openAmigoChat,
  onBookAppointment
}) => {
  const photos = String(vehicle.FotoWeblink || "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
  const [photoIdx, setPhotoIdx] = useState(0);

  // Dynamic Payment Estimator
  const [downPayment, setDownPayment] = useState(2000);
  const [termMonths, setTermMonths] = useState(72);
  const priceNum = parsePrice(vehicle.Precio);
  const monthlyCalc = getEstimatedMonthlyPayment(vehicle.Precio, downPayment, termMonths);

  // Lead modal state
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const municipio = vehicle.Municipio || inferMunicipio(vehicle, 0);
  const dealer = vehicle.Dealer || inferDealer(vehicle, 0);
  const carroceria = inferCarroceria(vehicle);

  // Related vehicles in same body type or price range
  const relatedVehicles = inventory
    .filter(
      (v) =>
        v !== vehicle &&
        (v.Carroceria === carroceria || v.Marca === vehicle.Marca)
    )
    .slice(0, 3);

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Breadcrumb & Navigation Back */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <button
          onClick={() => navigate("/inventario")}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#00b4d8] hover:text-[#48cae4] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Volver al Catálogo B2C de Inventario</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg bg-[#101f42] border border-white/10 hover:bg-[#1c2d5a] text-xs text-neutral-300 font-medium transition-colors flex items-center gap-1.5"
          >
            <Share2 size={13} />
            <span>{copied ? "¡Enlace Copiado!" : "Compartir Ficha"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Gallery & Tech Specs + Action Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Photo Gallery & Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Photo Carousel */}
          <div className="relative aspect-[16/10] bg-[#0a1128] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
            {photos.length > 0 ? (
              <img
                referrerPolicy="no-referrer"
                src={photos[photoIdx]}
                alt={`${vehicle.Marca} ${vehicle.Modelo}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-500">
                Foto no disponible
              </div>
            )}

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-[#0a1128]/80 backdrop-blur-md border border-[#00b4d8]/40 text-[#48cae4] font-black text-xs">
                {carroceria}
              </span>
              {vehicle.Garantia && (
                <span className="px-3 py-1 rounded-full bg-[#ffb703]/90 text-[#0a1128] font-black text-xs flex items-center gap-1 shadow-md">
                  <ShieldCheck size={13} />
                  <span>{vehicle.Garantia}</span>
                </span>
              )}
            </div>

            {/* Carousel Controls */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setPhotoIdx((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#0a1128]/80 hover:bg-[#0a1128] text-white flex items-center justify-center border border-white/20 backdrop-blur-sm transition-all hover:scale-110"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() =>
                    setPhotoIdx((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#0a1128]/80 hover:bg-[#0a1128] text-white flex items-center justify-center border border-white/20 backdrop-blur-sm transition-all hover:scale-110"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Track */}
          {photos.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {photos.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPhotoIdx(idx)}
                  className={`w-20 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    idx === photoIdx
                      ? "border-[#00b4d8] scale-105 shadow-md shadow-[#00b4d8]/20"
                      : "border-white/10 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    referrerPolicy="no-referrer"
                    src={p}
                    alt="thumbnail"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Detailed Specifications Matrix */}
          <div className="bg-[#101f42] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-black text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Sparkles size={18} className="text-[#00b4d8]" />
              <span>Ficha Técnica y Detalles Verificados</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-[#0a1128] rounded-2xl border border-white/5 space-y-1">
                <span className="text-[#94a3b8] font-medium">Año</span>
                <p className="text-white font-bold text-sm">{vehicle["Año"]}</p>
              </div>
              <div className="p-3.5 bg-[#0a1128] rounded-2xl border border-white/5 space-y-1">
                <span className="text-[#94a3b8] font-medium">Marca y Modelo</span>
                <p className="text-white font-bold text-sm">
                  {vehicle.Marca} {vehicle.Modelo}
                </p>
              </div>
              <div className="p-3.5 bg-[#0a1128] rounded-2xl border border-white/5 space-y-1">
                <span className="text-[#94a3b8] font-medium">Trim / Nivel</span>
                <p className="text-white font-bold text-sm">
                  {vehicle["Sub-Modelo/Trim Level"] || "Estándar"}
                </p>
              </div>
              <div className="p-3.5 bg-[#0a1128] rounded-2xl border border-white/5 space-y-1">
                <span className="text-[#94a3b8] font-medium">Millaje</span>
                <p className="text-white font-bold text-sm">
                  {vehicle.Millaje ? `${vehicle.Millaje} millas` : "Bajo Millaje"}
                </p>
              </div>
              <div className="p-3.5 bg-[#0a1128] rounded-2xl border border-white/5 space-y-1">
                <span className="text-[#94a3b8] font-medium">Transmisión</span>
                <p className="text-white font-bold text-sm">{vehicle["Transmisión"] || "Automática"}</p>
              </div>
              <div className="p-3.5 bg-[#0a1128] rounded-2xl border border-white/5 space-y-1">
                <span className="text-[#94a3b8] font-medium">Consumo MPG</span>
                <p className="text-white font-bold text-sm">{vehicle.MPG || "Eficiente"} MPG</p>
              </div>
              <div className="p-3.5 bg-[#0a1128] rounded-2xl border border-white/5 space-y-1">
                <span className="text-[#94a3b8] font-medium">Color Exterior</span>
                <p className="text-white font-bold text-sm">{vehicle.Color || "N/D"}</p>
              </div>
              <div className="p-3.5 bg-[#0a1128] rounded-2xl border border-white/5 space-y-1">
                <span className="text-[#94a3b8] font-medium">Motor / Potencia</span>
                <p className="text-white font-bold text-sm">{vehicle["Motor/hp"] || "4 Cilindros"}</p>
              </div>
              <div className="p-3.5 bg-[#0a1128] rounded-2xl border border-white/5 space-y-1">
                <span className="text-[#94a3b8] font-medium">Ubicación PR</span>
                <p className="text-white font-bold text-sm flex items-center gap-1">
                  <MapPin size={13} className="text-[#00b4d8]" />
                  <span>{municipio}</span>
                </p>
              </div>
            </div>

            {/* Dealer Verified Location Card */}
            {(() => {
              const matchedDealerInfo = DEALERS_PR.find(d => d.nombre.toLowerCase() === (dealer || "").toLowerCase()) || DEALERS_PR[0];
              return (
                <div className="p-4 rounded-2xl bg-[#0a1128]/80 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1c2d5a] text-[#00b4d8] flex items-center justify-center flex-shrink-0">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div className="text-[#94a3b8] text-[10px] uppercase font-bold tracking-wider">
                        Concesionario Asignado
                      </div>
                      <div className="text-white font-bold text-sm">{dealer}</div>
                      <div className="text-[#94a3b8] text-[11px] flex items-center gap-2">
                        <span>{municipio}, Puerto Rico</span>
                        {matchedDealerInfo?.mapsUrl && (
                          <a
                            href={matchedDealerInfo.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00b4d8] hover:text-[#48cae4] inline-flex items-center gap-1 font-semibold underline"
                          >
                            <span>Ver en Google Maps</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                    <CheckCircle2 size={14} />
                    <span>Inventario Verificado</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right Column: Pricing, Calculator & Direct Contact (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#101f42] border border-[#00b4d8]/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl sticky top-24">
            {/* Header info */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#00b4d8] uppercase tracking-wider">
                {vehicle["Año"]} • {carroceria}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {vehicle.Marca} {vehicle.Modelo}
              </h1>
              <p className="text-xs text-[#94a3b8]">
                {vehicle["Sub-Modelo/Trim Level"]}
              </p>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-[#0a1128] border border-white/10 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-[#94a3b8] block">Precio Publicado</span>
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {formatCurrency(priceNum)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#ffb703] font-bold block">Pago Estimado</span>
                <span className="text-xl sm:text-2xl font-black text-[#00b4d8]">
                  ${monthlyCalc}
                  <span className="text-xs font-normal text-[#94a3b8]">/mes</span>
                </span>
              </div>
            </div>

            {/* Dynamic Payment Calculator */}
            <div className="space-y-4 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="flex items-center gap-1.5 text-[#ffb703]">
                  <Calculator size={15} />
                  <span>Calculadora de Pago Mensual</span>
                </span>
                <span className="text-neutral-400 font-normal text-[11px]">7.95% APR ref.</span>
              </div>

              {/* Slider Pronto Pago */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#94a3b8]">Pronto aportado:</span>
                  <span className="text-white font-bold">{formatCurrency(downPayment)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.min(15000, Math.round(priceNum * 0.5))}
                  step="500"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full accent-[#00b4d8] cursor-pointer"
                />
              </div>

              {/* Term Selector */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#94a3b8]">Plazo de financiamiento:</span>
                  <span className="text-white font-bold">{termMonths} meses</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[48, 60, 72, 84].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTermMonths(t)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        termMonths === t
                          ? "bg-[#00b4d8] text-[#0a1128] border-[#00b4d8]"
                          : "bg-[#0a1128] text-neutral-300 border-white/10 hover:border-white/20"
                      }`}
                    >
                      {t}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Direct CTA Buttons: Shakira, Agenda & Lead Form */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(
                      new CustomEvent('open-chat-with-car', {
                        detail: {
                          year: vehicle["Año"],
                          make: vehicle.Marca,
                          model: vehicle.Modelo,
                          trim: vehicle["Sub-Modelo/Trim Level"] || '',
                          price: priceNum,
                          estimated_monthly_payment: monthlyCalc,
                          dealer: dealer,
                          municipality: municipio,
                          photo: photos[0] || ''
                        }
                      })
                    );
                  } else {
                    openAmigoChat(
                      `¡Hola Shakira! Me interesa la ficha técnica del ${vehicle["Año"]} ${vehicle.Marca} ${vehicle.Modelo} (${dealer}). ¿Está disponible para prueba de manejo?`
                    );
                  }
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#00b4d8] text-[#0a1128] font-black text-sm shadow-[0_0_25px_rgba(0,180,216,0.45)] hover:brightness-110 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare size={18} />
                <span>Hablar con Shakira sobre este Auto</span>
              </button>

              <button
                onClick={() => {
                  onBookAppointment(vehicle);
                  navigate("/agenda");
                }}
                className="w-full py-3.5 rounded-2xl bg-[#1c2d5a] hover:bg-[#253970] text-white font-bold text-xs sm:text-sm border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Calendar size={16} className="text-[#ffb703]" />
                <span>Coordinar Cita / Prueba de Manejo</span>
              </button>

              <button
                onClick={() => setShowLeadModal(true)}
                className="w-full py-3 rounded-2xl bg-[#0a1128] hover:bg-[#101f42] text-[#48cae4] font-bold text-xs border border-[#00b4d8]/30 transition-all flex items-center justify-center gap-2"
              >
                <PhoneCall size={14} />
                <span>Solicitar Pre-Cualificación & Asignación</span>
              </button>
            </div>

            {/* Mandatory Disclosures Compact */}
            <LegalDisclosures variant="compact" />
          </div>
        </div>
      </div>

      {/* Similar Vehicles Section */}
      {relatedVehicles.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#00b4d8] uppercase tracking-wider">
                Opciones Similares
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                Otros vehículos que te pueden interesar
              </h2>
            </div>
            <button
              onClick={() => navigate("/inventario")}
              className="text-xs text-[#48cae4] font-bold hover:underline"
            >
              Ver todo el catálogo →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedVehicles.map((v, i) => (
              <div
                key={i}
                onClick={() => {
                  const slug = getVehicleSlug(v);
                  navigate(`/inventario/${slug}` as PageRoute);
                }}
                className="bg-[#101f42] border border-white/10 rounded-2xl p-4 space-y-3 cursor-pointer hover:border-[#00b4d8]/50 transition-all hover:scale-[1.02]"
              >
                <div className="aspect-[16/10] bg-[#0a1128] rounded-xl overflow-hidden">
                  <img
                    referrerPolicy="no-referrer"
                    src={String(v.FotoWeblink || "").split(",")[0]}
                    alt={`${v.Marca} ${v.Modelo}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-bold text-sm">
                      {v["Año"]} {v.Marca} {v.Modelo}
                    </h4>
                    <p className="text-[#94a3b8] text-xs">{v.Municipio || "Puerto Rico"}</p>
                  </div>
                  <span className="text-[#00b4d8] font-black text-sm">
                    {formatCurrency(parsePrice(v.Precio))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lead Capture Modal for Pre-Qualification */}
      <LeadModal
        isOpen={showLeadModal}
        vehicle={toVehicleData(vehicle)}
        onClose={() => setShowLeadModal(false)}
        onSuccess={() => setShowLeadModal(false)}
      />
    </div>
  );
};
export default VehicleDetailPage;
