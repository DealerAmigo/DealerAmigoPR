import React from 'react';
import { ShieldCheck, Info, Calculator, CheckCircle } from 'lucide-react';

export const LEGAL_DISCLOSURES = {
  marketplace:
    "DealerAmigo es una plataforma tecnológica independiente de búsqueda, orientación y conexión entre compradores y dealers participantes en Puerto Rico. No somos dueños de todos los vehículos publicados. La disponibilidad, precio final, condición, garantías aplicables, financiamiento, cargos por tablillas, ACAA y términos contractuales finales deben ser confirmados directamente con el dealer o vendedor correspondiente.",
  financing:
    "Los pagos mensuales mostrados en esta plataforma son cálculos estimados para fines estrictamente orientativos y no constituyen una oferta formal, cotización vinculante ni aprobación de crédito. El pago mensual final será determinado por la entidad bancaria o cooperativa financiera seleccionada, sujeto a la evaluación crediticia, pronto pago aportado, tasa de interés aplicable y plazo acordado.",
  availability:
    "DealerAmigo no garantiza la disponibilidad ininterrumpida de ningún vehículo ni el precio publicado tras el vencimiento de ofertas del dealer. Cada vehículo cuenta con una fecha de última verificación visible en su ficha técnica."
};

interface LegalDisclosuresProps {
  variant?: 'full' | 'compact' | 'footer' | 'chat';
  className?: string;
}

export const LegalDisclosures: React.FC<LegalDisclosuresProps> = ({ variant = 'full', className = '' }) => {
  if (variant === 'compact') {
    return (
      <div className={`p-3 bg-[#0a1128]/80 border border-white/10 rounded-xl text-[11px] text-neutral-400 space-y-1.5 ${className}`}>
        <div className="flex items-center gap-1.5 text-neutral-300 font-semibold">
          <Info size={13} className="text-[#00b4d8]" />
          <span>Aviso Legal y Transparencia Regulatoria</span>
        </div>
        <p className="leading-relaxed">
          {LEGAL_DISCLOSURES.marketplace}
        </p>
        <p className="leading-relaxed text-neutral-500">
          {LEGAL_DISCLOSURES.financing}
        </p>
      </div>
    );
  }

  if (variant === 'chat') {
    return (
      <div className={`p-2.5 bg-[#0a1128] border-t border-white/10 text-[10px] text-neutral-400 leading-snug space-y-1 ${className}`}>
        <p>
          <strong className="text-neutral-300">Nota:</strong> Pagos y disponibilidad orientativos. DealerAmigo conecta con concesionarios autorizados en PR.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 text-xs text-neutral-300 ${className}`}>
      {/* 1. General Marketplace Disclosure */}
      <div className="p-4 rounded-2xl bg-[#101f42]/70 border border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
          <ShieldCheck size={16} className="text-[#00b4d8]" />
          <span>1. Declaración General de Plataforma y Concesión Independiente</span>
        </div>
        <p className="text-neutral-300 text-[11px] leading-relaxed">
          {LEGAL_DISCLOSURES.marketplace}
        </p>
      </div>

      {/* 2. Financing & Payment Disclaimer */}
      <div className="p-4 rounded-2xl bg-[#101f42]/70 border border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
          <Calculator size={16} className="text-[#ffb703]" />
          <span>2. Descargo de Responsabilidad sobre Pagos y Financiamiento</span>
        </div>
        <p className="text-neutral-300 text-[11px] leading-relaxed">
          {LEGAL_DISCLOSURES.financing}
        </p>
      </div>

      {/* 3. Verification & Availability Warranty */}
      <div className="p-4 rounded-2xl bg-[#101f42]/70 border border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>3. Garantía de Verificación, Precios y Disponibilidad de Inventario</span>
        </div>
        <p className="text-neutral-300 text-[11px] leading-relaxed">
          {LEGAL_DISCLOSURES.availability}
        </p>
      </div>
    </div>
  );
};

export default LegalDisclosures;
