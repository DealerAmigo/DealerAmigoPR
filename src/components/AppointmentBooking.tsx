import React, { useState } from "react";
import { Vehicle, AppointmentData, PageRoute } from "../types";
import { MUNICIPIOS_PR, DEALERS_PR } from "../utils/helpers";
import { 
  Calendar, 
  Clock, 
  Car, 
  Phone, 
  MessageSquare, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  FileCheck2
} from "lucide-react";

interface AppointmentBookingProps {
  inventory: Vehicle[];
  selectedVehicle?: Vehicle | null;
  navigate: (route: PageRoute) => void;
  openAmigoChat: (msg?: string) => void;
}

export const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  inventory,
  selectedVehicle,
  navigate,
  openAmigoChat
}) => {
  const [tipoCita, setTipoCita] = useState<AppointmentData["tipo"]>("Visita al Dealer");
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(
    selectedVehicle ? `${selectedVehicle["Año"]} ${selectedVehicle.Marca} ${selectedVehicle.Modelo}` : ""
  );
  const [municipio, setMunicipio] = useState(selectedVehicle?.Municipio || "Dorado");
  const [dealer, setDealer] = useState(selectedVehicle?.Dealer || "GT Auto Imports");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("10:00 AM");
  const [notas, setNotas] = useState("");
  const [tieneTrade, setTieneTrade] = useState(false);
  const [tradeInfo, setTradeInfo] = useState("");
  const [prontoDisponible, setProntoDisponible] = useState("$2,000");
  const [consentimiento, setConsentimiento] = useState(true);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const foundDealerObj = DEALERS_PR.find(d => d.nombre === dealer);
  const dealerMapsUrl = foundDealerObj?.mapsUrl || "https://maps.google.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const leadPayload = {
      tipo: tipoCita,
      vehiculo_summary: vehiculoSeleccionado || "Interés General",
      dealer,
      dealer_name: dealer,
      assigned_dealer: dealer,
      municipio,
      dealer_municipality: municipio,
      name: nombre,
      phone: telefono,
      email,
      fecha,
      hora,
      tieneTrade,
      tradeInfo,
      prontoDisponible,
      notas,
      Fuente: "AppointmentBooking",
      agendoCita: "Si",
      timestamp: new Date().toISOString()
    };

    try {
      // Save locally
      const stored = JSON.parse(localStorage.getItem("dealeramigo_citas") || "[]");
      stored.unshift(leadPayload);
      localStorage.setItem("dealeramigo_citas", JSON.stringify(stored));

      // Send to backend
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload)
      });
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="max-w-[950px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101f42] border border-[#00b4d8]/40 text-xs font-bold text-[#48cae4] uppercase tracking-widest">
          <Calendar size={13} className="text-[#00b4d8]" />
          <span>COORDINACIÓN DIRECTA CON DEALERS AUTORIZADOS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Coordinar Orientación o Prueba de Manejo
        </h1>
        <p className="text-[#94a3b8] text-sm sm:text-base max-w-2xl mx-auto">
          Selecciona el día y la hora que mejor te convenga. Notificaremos al dealer para confirmar disponibilidad.
        </p>
      </div>

      {submitted ? (
        <div className="bg-[#101f42] border border-[#00b4d8]/40 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center justify-center mx-auto text-2xl">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              ¡Solicitud de Cita Recibida con Éxito!
            </h2>
            <p className="text-sm sm:text-base text-[#48cae4] font-semibold max-w-xl mx-auto">
              "Recibimos tu solicitud. La disponibilidad del vehículo y la cita deben ser confirmadas por el representante correspondiente."
            </p>
          </div>

          {/* Appointment details recap with prominent Dealer info */}
          <div className="bg-[#0a1128] p-6 rounded-2xl border border-white/10 max-w-lg mx-auto text-left text-xs space-y-3 text-[#94a3b8]">
            <div className="text-white font-bold pb-2 border-b border-white/10 flex items-center justify-between">
              <span className="text-sm text-[#00b4d8] font-black">Detalles de tu solicitud</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ffb703]/20 text-[#ffb703] font-bold">{tipoCita}</span>
            </div>

            {/* Prominent Dealer Info Box */}
            <div className="p-3.5 bg-[#101f42] rounded-xl border border-[#00b4d8]/40 space-y-1.5 text-white">
              <div className="text-[10px] text-[#48cae4] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Building2 size={13} className="text-[#00b4d8]" />
                <span>Concesionario Oficial Asignado</span>
              </div>
              <div className="text-sm font-black">{dealer}</div>
              <div className="text-xs text-neutral-300 flex items-center justify-between">
                <span>📍 {municipio}, Puerto Rico</span>
                {dealerMapsUrl && (
                  <a
                    href={dealerMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00b4d8] hover:text-[#48cae4] underline font-semibold text-[11px]"
                  >
                    Ver en Google Maps →
                  </a>
                )}
              </div>
            </div>

            <div><strong>Cliente:</strong> {nombre} ({telefono})</div>
            <div><strong>Vehículo Seleccionado:</strong> {vehiculoSeleccionado || "Unidad en inventario"}</div>
            <div><strong>Fecha y Hora:</strong> {fecha || "Por coordinar"} a las {hora} (Hora de Puerto Rico)</div>
            {tieneTrade && <div><strong>Trade-in:</strong> {tradeInfo || "Sí"}</div>}
          </div>

          {/* Required Documents Callout */}
          <div className="p-4 rounded-2xl bg-[#1c2d5a]/60 border border-[#ffb703]/30 max-w-lg mx-auto text-left text-xs text-[#f1f5f9] space-y-1.5">
            <div className="font-bold text-[#ffb703] flex items-center gap-1.5">
              <FileCheck2 size={15} />
              <span>Documentos recomendados para tu visita:</span>
            </div>
            <ul className="list-disc list-inside text-[#94a3b8] space-y-1 pl-1">
              <li>Licencia de conducir vigente</li>
              <li>Tarjeta de Seguro Social</li>
              <li>Comprobante de ingresos (talonarios o W2)</li>
              <li>Recibo de agua o luz reciente</li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSubmitted(false);
                navigate("/inventario");
              }}
              className="px-6 py-3 rounded-xl bg-[#00b4d8] text-[#0a1128] font-black text-xs hover:bg-[#48cae4] transition-all cursor-pointer"
            >
              Explorar Más Autos
            </button>

            <button
              onClick={() => openAmigoChat(`¡Hola Shakira! Acabo de registrar una solicitud de cita para ver el ${vehiculoSeleccionado || "vehículo"} en ${dealer} (${municipio}). ¿Me puedes orientar sobre qué esperar en el concesionario?`)}
              className="px-6 py-3 rounded-xl bg-[#1c2d5a] text-[#f1f5f9] font-bold text-xs hover:bg-[#1c2d5a]/80 transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare size={14} className="text-[#00b4d8]" />
              <span>Hablar con Shakira sobre mi cita</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-[#101f42]/90 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-8">
          
          {/* Selector de Tipo de Cita */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#48cae4] mb-3">
              1. Selecciona el Tipo de Cita o Consulta:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { title: "Visita al Dealer", icon: Building2 },
                { title: "Llamada Telefónica", icon: Phone },
                { title: "Pregunta por WhatsApp", icon: MessageSquare },
                { title: "Consulta de Financiamiento", icon: ShieldCheck }
              ].map((item) => {
                const Icon = item.icon;
                const active = tipoCita === item.title;
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setTipoCita(item.title as any)}
                    className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all ${
                      active
                        ? "bg-[#00b4d8] text-[#0a1128] font-black border-[#00b4d8] shadow-[0_0_15px_rgba(0,180,216,0.4)]"
                        : "bg-[#0a1128] text-[#94a3b8] hover:text-white border-white/10 hover:border-white/20"
                    }`}
                  >
                    <Icon size={18} className={active ? "text-[#0a1128]" : "text-[#48cae4]"} />
                    <span className="text-xs font-bold leading-tight">{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vehicle & Location Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5 flex items-center gap-1.5">
                <Car size={14} className="text-[#00b4d8]" />
                <span>Vehículo de Interés</span>
              </label>
              <select
                value={vehiculoSeleccionado}
                onChange={(e) => {
                  const val = e.target.value;
                  setVehiculoSeleccionado(val);
                  const matchedVeh = inventory.find(v => `${v["Año"]} ${v.Marca} ${v.Modelo} (${v.Precio})` === val);
                  if (matchedVeh) {
                    if (matchedVeh.Dealer) setDealer(matchedVeh.Dealer);
                    if (matchedVeh.Municipio) setMunicipio(matchedVeh.Municipio);
                  }
                }}
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00b4d8]"
              >
                <option value="">Selecciona del inventario (o escribe en notas)</option>
                {inventory.map((v, i) => (
                  <option key={i} value={`${v["Año"]} ${v.Marca} ${v.Modelo} (${v.Precio})`}>
                    {v["Año"]} {v.Marca} {v.Modelo} — {v.Precio} {v.Dealer ? `• ${v.Dealer}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5 flex items-center gap-1.5">
                <Building2 size={14} className="text-[#ffb703]" />
                <span>Dealer / Municipio Preferido</span>
              </label>
              <select
                value={dealer}
                onChange={(e) => {
                  setDealer(e.target.value);
                  const found = DEALERS_PR.find(d => d.nombre === e.target.value);
                  if (found) setMunicipio(found.municipio);
                }}
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00b4d8]"
              >
                {DEALERS_PR.map((d) => (
                  <option key={d.nombre} value={d.nombre}>
                    {d.nombre} ({d.municipio})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5 flex items-center gap-1.5">
                <Calendar size={14} className="text-[#00b4d8]" />
                <span>Fecha Deseada (Lunes a Sábado)</span>
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00b4d8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5 flex items-center gap-1.5">
                <Clock size={14} className="text-[#00b4d8]" />
                <span>Horario Disponible (9:00 AM - 5:00 PM)</span>
              </label>
              <select
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00b4d8]"
              >
                {["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"].map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="ej. Juan del Pueblo"
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#00b4d8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5">
                Teléfono de Contacto (PR/USA) *
              </label>
              <input
                type="tel"
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="ej. (787) 555-0199"
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#00b4d8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5">
                Correo Electrónico (Opcional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ej. juan@email.com"
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#00b4d8]"
              />
            </div>
          </div>

          {/* Trade-In and Financial Details */}
          <div className="p-4 rounded-2xl bg-[#0a1128] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#f1f5f9]">¿Tienes un auto para entregar en Trade-In?</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTieneTrade(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    tieneTrade ? "bg-[#ffb703] text-[#0a1128]" : "bg-[#1c2d5a] text-[#94a3b8]"
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => setTieneTrade(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    !tieneTrade ? "bg-[#00b4d8] text-[#0a1128]" : "bg-[#1c2d5a] text-[#94a3b8]"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {tieneTrade && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 animate-in fade-in duration-200">
                <input
                  type="text"
                  value={tradeInfo}
                  onChange={(e) => setTradeInfo(e.target.value)}
                  placeholder="Detalles de tu trade (Año, Marca, Modelo, Millaje)"
                  className="w-full bg-[#101f42] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#00b4d8]"
                />
                <input
                  type="text"
                  value={prontoDisponible}
                  onChange={(e) => setProntoDisponible(e.target.value)}
                  placeholder="Pronto disponible estimado (ej. $2,000)"
                  className="w-full bg-[#101f42] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#00b4d8]"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5">
              Preguntas o notas adicionales para el asesor:
            </label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="¿Alguna pregunta sobre pagos, bancos o especificaciones del auto?"
              className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#00b4d8]"
            />
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-2.5 pt-2">
            <input
              type="checkbox"
              id="consent"
              checked={consentimiento}
              onChange={(e) => setConsentimiento(e.target.checked)}
              required
              className="mt-0.5 rounded border-white/20 bg-[#0a1128] text-[#00b4d8] focus:ring-0"
            />
            <label htmlFor="consent" className="text-[11px] text-[#94a3b8] leading-tight cursor-pointer">
              Acepto ser contactado por DealerAmigo y el dealer autorizado participante asignado mediante llamada, SMS o WhatsApp para coordinar mi cita y brindar orientación sobre el vehículo. Entiendo que puedo cancelar en cualquier momento enviando STOP.
            </label>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#ffb703] text-[#0a1128] font-black text-sm sm:text-base shadow-[0_0_25px_rgba(0,180,216,0.4)] hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <span>Enviando solicitud...</span>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Confirmar Solicitud de Cita con el Dealer</span>
                </>
              )}
            </button>
          </div>

          {/* Mandatory Sub-disclaimer */}
          <div className="text-center text-[11px] text-[#94a3b8]">
            La disponibilidad final de cada unidad y el horario exacto serán revalidados directamente por el concesionario asignado.
          </div>

        </form>
      )}
    </div>
  );
};
