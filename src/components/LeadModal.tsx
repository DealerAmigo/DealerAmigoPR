import React, { useState } from 'react';
import { X, Shield, CheckCircle2, Lock } from 'lucide-react';
import { VehicleData } from './VehicleCard';

interface LeadModalProps {
  vehicle?: VehicleData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (leadData: any) => void;
}

export default function LeadModal({ vehicle, isOpen, onClose, onSuccess }: LeadModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [hasTradeIn, setHasTradeIn] = useState(false);
  const [financingInterest, setFinancingInterest] = useState(true);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      alert('Por favor autorice el consentimiento para procesar su solicitud.');
      return;
    }
    setSubmitting(true);

    const payload = {
      name,
      phone,
      email,
      municipality,
      has_trade_in: hasTradeIn,
      financing_interest: financingInterest,
      vehicle_id: vehicle?.vehicle_id || null,
      vehicle_summary: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Consulta General',
      assigned_dealer: vehicle?.seller_name || 'DealerAmigo Hub',
      consent_status: true,
      Fuente: "LeadModal", timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        onSuccess(payload);
      }
    } catch (err) {
      console.error('Error submitting lead:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#101f42] border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-full bg-white/5"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <div className="text-[10px] text-[#00b4d8] font-black uppercase tracking-widest mb-1">
            DealerAmigo Concierge
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {vehicle ? `Solicitar Información: ${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Coordinar Orientación Personalizada'}
          </h2>
          <p className="text-xs text-neutral-300 mt-1">
            Conectamos directamente con el representante autorizado sin intermediarios innecesarios.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-neutral-300 uppercase tracking-wider text-[10px] mb-1">Nombre Completo *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Carlos Rivera"
              className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#00b4d8] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-300 uppercase tracking-wider text-[10px] mb-1">Teléfono Móvil *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="787-000-0000"
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#00b4d8] outline-none"
              />
            </div>
            <div>
              <label className="block text-neutral-300 uppercase tracking-wider text-[10px] mb-1">Municipio *</label>
              <input
                type="text"
                required
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                placeholder="Ej. Bayamón, Caguas..."
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#00b4d8] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 uppercase tracking-wider text-[10px] mb-1">Correo Electrónico (Opcional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="carlos@gmail.com"
              className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#00b4d8] outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-neutral-300 select-none">
              <input
                type="checkbox"
                checked={hasTradeIn}
                onChange={(e) => setHasTradeIn(e.target.checked)}
                className="accent-[#00b4d8] w-4 h-4 rounded"
              />
              <span>Tengo Trade-in</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-neutral-300 select-none">
              <input
                type="checkbox"
                checked={financingInterest}
                onChange={(e) => setFinancingInterest(e.target.checked)}
                className="accent-[#00b4d8] w-4 h-4 rounded"
              />
              <span>Interés en Financiamiento</span>
            </label>
          </div>

          {/* Legal Consent Box & Mandatory Disclosures */}
          <div className="p-3 bg-[#0a1128] border border-white/10 rounded-xl space-y-2.5">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="accent-[#00b4d8] w-4 h-4 rounded mt-0.5"
              />
              <span className="text-[11px] text-neutral-300 leading-relaxed font-normal">
                Autorizo a <strong>DealerAmigo Puerto Rico</strong> a compartir mi información con el dealer asignado y a recibir mensajes y llamadas por teléfono, SMS o WhatsApp respecto a mi consulta. Puedo responder STOP para cancelar.
              </span>
            </label>
            <div className="text-[10px] text-neutral-400 border-t border-white/5 pt-2 leading-relaxed">
              * DealerAmigo es una plataforma tecnológica independiente. Los pagos mensuales son cálculos estimados orientativos no vinculantes. Términos finales, garantías y aprobación deben confirmarse con el concesionario y la entidad financiera.
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#00b4d8] hover:bg-[#00b4d8]/90 text-[#0a1128] font-black py-3.5 rounded-xl uppercase tracking-wider text-xs transition-all shadow-lg shadow-[#00b4d8]/20 flex items-center justify-center gap-2"
          >
            <Lock size={14} />
            <span>{submitting ? 'Enviando...' : 'Enviar Solicitud Segura'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export { LeadModal };
