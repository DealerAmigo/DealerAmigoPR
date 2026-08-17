import React, { useState } from "react";
import { PageRoute } from "../types";
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";

interface FaqPageProps {
  navigate: (route: PageRoute) => void;
  openAmigoChat: (msg?: string) => void;
}

export const FaqPage: React.FC<FaqPageProps> = ({ navigate, openAmigoChat }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "¿DealerAmigo vende autos directamente?",
      a: "No. DealerAmigo es una plataforma tecnológica y de orientación. Te ayudamos a descubrir vehículos y te conectamos directamente con el dealer o vendedor autorizado dueño de la unidad."
    },
    {
      q: "¿Los pagos mensuales mostrados son finales?",
      a: "No. Los pagos mostrados son cálculos estimados orientativos. El pago mensual exacto será determinado por la institución bancaria o cooperativa tras evaluar tu crédito, pronto pago, plazo e intereses aplicables."
    },
    {
      q: "¿Cómo garantiza DealerAmigo la disponibilidad de un auto?",
      a: "El inventario se actualiza constantemente junto a los dealers participantes. Sin embargo, debido a la alta demanda, la disponibilidad final debe ser revalidada directamente antes de tu visita."
    },
    {
      q: "¿Cómo funciona la entrega o tasación de mi Trade-in?",
      a: "Puedes compartir los datos de tu auto actual (año, marca, modelo, millaje) con Amigo AI o en el formulario de citas. Te proporcionamos una orientación de valor referencial y el dealer realizará la tasación física final al momento de tu visita."
    },
    {
      q: "¿Tiene algún costo para el comprador utilizar DealerAmigo?",
      a: "No. DealerAmigo es un servicio completamente gratuito para los compradores en Puerto Rico. Puedes buscar autos, interactuar con Amigo y coordinar pruebas de manejo sin ningún cargo ni compromiso."
    },
    {
      q: "¿Qué documentos debo llevar a mi cita o prueba de manejo?",
      a: "Para agilizar tu proceso de compra o financiamiento, te recomendamos llevar: Licencia de conducir vigente, Tarjeta de Seguro Social, Comprobante de ingresos (talonarios de pago recientes o W-2) y Comprobante de residencia reciente (recibo de luz, agua o contrato de arrendamiento)."
    },
    {
      q: "¿Cómo me protege DealerAmigo contra llamadas no deseadas?",
      a: "Tus datos únicamente se comparten con el concesionario específico dueño del auto de tu interés para coordinar la cita. Además, siempre puedes darte de baja respondiendo STOP a cualquier mensaje SMS."
    }
  ];

  return (
    <div className="max-w-[950px] mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101f42] border border-[#00b4d8]/40 text-xs font-bold text-[#48cae4] uppercase tracking-widest">
          <HelpCircle size={13} className="text-[#00b4d8]" />
          <span>CENTRO DE AYUDA Y TRANSPARENCIA</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Preguntas Frecuentes
        </h1>
        <p className="text-[#94a3b8] text-sm sm:text-base max-w-xl mx-auto">
          Todo lo que necesitas saber sobre cómo funciona DealerAmigo, financiamiento, pagos estimados e inventario en Puerto Rico.
        </p>
      </div>

      {/* Accordion list */}
      <div className="space-y-3.5">
        {faqs.map((faq, i) => {
          const isOpen = openIdx === i;
          return (
            <div
              key={i}
              className={`bg-[#101f42] border rounded-2xl transition-all overflow-hidden ${
                isOpen ? "border-[#00b4d8]/50 shadow-[0_0_20px_rgba(0,180,216,0.15)]" : "border-white/10 hover:border-white/20"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4"
              >
                <span className="text-sm sm:text-base font-bold text-white leading-snug">
                  {faq.q}
                </span>
                <span className="text-[#00b4d8] shrink-0">
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-[#94a3b8] leading-relaxed border-t border-white/5 pt-3 animate-in fade-in duration-200">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still have questions card */}
      <div className="bg-gradient-to-r from-[#101f42] via-[#1c2d5a] to-[#0a1128] border border-[#ffb703]/30 rounded-3xl p-6 sm:p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-[#00b4d8]/20 text-[#48cae4] flex items-center justify-center mx-auto">
          <Sparkles size={24} />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white">
          ¿Tienes alguna otra duda específica?
        </h3>
        <p className="text-xs sm:text-sm text-[#94a3b8] max-w-lg mx-auto">
          Pregúntale a <strong>Amigo AI</strong> en tiempo real. Está capacitado con información actualizada del inventario y procesos de compra en Puerto Rico.
        </p>
        <div>
          <button
            onClick={() => openAmigoChat("¡Hola Amigo! Tengo una pregunta sobre cómo financiar un auto.")}
            className="px-6 py-3 rounded-xl bg-[#00b4d8] hover:bg-[#48cae4] text-[#0a1128] font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
          >
            <MessageSquare size={14} />
            <span>Chatear con Amigo Ahora</span>
          </button>
        </div>
      </div>
    </div>
  );
};
