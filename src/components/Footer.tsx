import React from "react";
import { PageRoute } from "../types";
import { Car, Shield, MapPin, Phone, Mail, Sparkles, Building2 } from "lucide-react";

interface FooterProps {
  navigate: (route: PageRoute) => void;
  openAmigoChat: (msg?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate, openAmigoChat }) => {
  return (
    <footer className="bg-[#0a1128] border-t border-white/10 text-white pt-12 pb-8 px-4 sm:px-6">
      <div className="max-w-[1300px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
        {/* Col 1: Brand & Positioning */}
        <div className="lg:col-span-2 space-y-4">
          <div 
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00b4d8] to-[#1c2d5a] flex items-center justify-center text-white shadow-md border border-white/10">
              <Car size={22} className="text-[#f1f5f9]" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-white">
                Dealer<span className="text-[#00b4d8]">Amigo</span>
              </div>
              <div className="text-[10px] text-[#94a3b8] uppercase font-semibold">
                Plataforma Automotriz de Puerto Rico
              </div>
            </div>
          </div>
          
          <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed max-w-md">
            DealerAmigo es la plataforma tecnológica independiente que conecta a compradores de autos en Puerto Rico con dealers y vendedores autorizados en toda la Isla, con la orientación 24/7 de nuestro asistente inteligente <strong>Amigo AI</strong>.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#101f42] text-[#48cae4] border border-[#00b4d8]/30 font-semibold flex items-center gap-1">
              <Sparkles size={10} /> Concierge Amigo 24/7
            </span>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#101f42] text-[#ffb703] border border-[#ffb703]/30 font-semibold flex items-center gap-1">
              <Shield size={10} /> Inventario Verificado
            </span>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#101f42] text-[#f1f5f9] border border-white/10 font-semibold flex items-center gap-1">
              🇵🇷 Toda la Isla
            </span>
          </div>
        </div>

        {/* Col 2: Para Compradores */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#48cae4]">Para Compradores</div>
          <ul className="space-y-2 text-xs text-[#94a3b8]">
            <li>
              <button onClick={() => navigate("/inventario")} className="hover:text-white transition-colors">
                Explorar Inventario
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/buscar-carro")} className="hover:text-white transition-colors flex items-center gap-1">
                <span>Buscador AI con Amigo</span>
                <span className="text-[9px] bg-[#00b4d8]/30 text-[#48cae4] px-1 rounded">Nuevo</span>
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/agenda")} className="hover:text-white transition-colors">
                Agendar Prueba de Manejo
              </button>
            </li>
            <li>
              <button onClick={() => openAmigoChat("¿Cómo puedo calcular mi pago mensual con trade-in?")} className="hover:text-white transition-colors">
                Calculadora de Pagos Estimados
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/preguntas-frecuentes")} className="hover:text-white transition-colors">
                Preguntas Frecuentes (FAQ)
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Para Dealers & Aliados */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#ffb703] flex items-center gap-1">
            <Building2 size={12} />
            <span>Para Concesionarios</span>
          </div>
          <ul className="space-y-2 text-xs text-[#94a3b8]">
            <li>
              <button onClick={() => window.open("https://atiende-recepcionista-ia.ai.studio", "_blank")} className="hover:text-white transition-colors">
                Soluciones para Dealers
              </button>
            </li>
            <li>
              <button onClick={() => window.open("https://atiende-recepcionista-ia.ai.studio", "_blank")} className="hover:text-[#ffb703] transition-colors font-semibold">
                Unirse a la Red de Dealers
              </button>
            </li>
            <li>
              <button onClick={() => window.open("https://atiende-recepcionista-ia.ai.studio", "_blank")} className="hover:text-white transition-colors">
                Cualificación Automática de Leads
              </button>
            </li>
            <li>
              <button onClick={() => window.open("https://atiende-recepcionista-ia.ai.studio", "_blank")} className="hover:text-white transition-colors">
                Sincronización de Inventario
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Legal & Transparencia */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#f1f5f9]">Institucional & Legal</div>
          <ul className="space-y-2 text-xs text-[#94a3b8]">
            <li>
              <button onClick={() => navigate("/nosotros")} className="hover:text-white transition-colors">
                Sobre Nosotros
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/privacidad")} className="hover:text-white transition-colors">
                Política de Privacidad
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/terminos")} className="hover:text-white transition-colors">
                Términos y Condiciones
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/privacidad")} className="hover:text-white transition-colors">
                Consentimiento de Mensajería SMS/WhatsApp
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Mandatory Disclosures & Compliance Blocks */}
      <div className="max-w-[1300px] mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] text-[#94a3b8] leading-relaxed">
          <div className="p-4 rounded-2xl bg-[#101f42]/60 border border-white/5 space-y-1.5">
            <div className="font-bold text-[#f1f5f9] flex items-center gap-1.5 text-xs">
              <Shield size={13} className="text-[#00b4d8]" />
              <span>Plataforma Independiente</span>
            </div>
            <p>
              DealerAmigo es una plataforma tecnológica independiente de búsqueda, orientación y conexión entre compradores y dealers participantes en Puerto Rico. No somos dueños de todos los vehículos publicados. La disponibilidad, precio final, condición, garantías aplicables, financiamiento, cargos por tablillas, ACAA y términos contractuales finales deben ser confirmados directamente con el dealer o vendedor correspondiente.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#101f42]/60 border border-white/5 space-y-1.5">
            <div className="font-bold text-[#f1f5f9] flex items-center gap-1.5 text-xs">
              <Sparkles size={13} className="text-[#ffb703]" />
              <span>Financiamiento y Pagos</span>
            </div>
            <p>
              Los pagos mensuales mostrados en esta plataforma son cálculos estimados para fines estrictamente orientativos y no constituyen una oferta formal, cotización vinculante ni aprobación de crédito. El pago mensual final será determinado por la entidad bancaria o cooperativa financiera seleccionada, sujeto a la evaluación crediticia, pronto pago aportado, tasa de interés aplicable y plazo acordado.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#101f42]/60 border border-white/5 space-y-1.5">
            <div className="font-bold text-[#f1f5f9] flex items-center gap-1.5 text-xs">
              <MapPin size={13} className="text-emerald-400" />
              <span>Verificación y Disponibilidad</span>
            </div>
            <p>
              DealerAmigo no garantiza la disponibilidad ininterrumpida de ningún vehículo ni el precio publicado tras el vencimiento de ofertas del dealer. Cada vehículo cuenta con una fecha de última verificación visible en su ficha técnica.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1300px] mx-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94a3b8]">
        <div>
          &copy; {new Date().getFullYear()} DealerAmigo Puerto Rico. Todos los derechos reservados.
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate("/privacidad")} className="hover:text-white transition-colors">
            Privacidad
          </button>
          <button onClick={() => navigate("/terminos")} className="hover:text-white transition-colors">
            Términos
          </button>
          <button onClick={() => navigate("/preguntas-frecuentes")} className="hover:text-white transition-colors">
            Ayuda
          </button>
          <button onClick={() => window.open("https://atiende-recepcionista-ia.ai.studio", "_blank")} className="text-[#48cae4] hover:underline font-bold">
            Portal Dealer
          </button>
        </div>
      </div>
    </footer>
  );
};
