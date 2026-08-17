import React, { useState } from "react";
import { PageRoute } from "../types";
import { ShieldCheck, FileText, Lock, BellOff, ArrowLeft } from "lucide-react";

interface PrivacyTermsPageProps {
  initialTab?: "privacidad" | "terminos";
  navigate: (route: PageRoute) => void;
}

export const PrivacyTermsPage: React.FC<PrivacyTermsPageProps> = ({ initialTab = "privacidad", navigate }) => {
  const [activeTab, setActiveTab] = useState<"privacidad" | "terminos">(initialTab);

  return (
    <div className="max-w-[950px] mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101f42] border border-white/10 text-xs font-bold text-[#f1f5f9] uppercase tracking-widest">
          <Lock size={12} className="text-[#00b4d8]" />
          <span>MARCO LEGAL Y PROTECCIÓN AL CONSUMIDOR</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {activeTab === "privacidad" ? "Política de Privacidad" : "Términos y Condiciones de Uso"}
        </h1>
        <p className="text-[#94a3b8] text-xs sm:text-sm">
          Última actualización: Agosto 2026 | Puerto Rico
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => {
            setActiveTab("privacidad");
            navigate("/privacidad");
          }}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all border ${
            activeTab === "privacidad"
              ? "bg-[#00b4d8] text-[#0a1128] border-[#00b4d8]"
              : "bg-[#101f42] text-[#94a3b8] border-white/10 hover:text-white"
          }`}
        >
          Política de Privacidad
        </button>
        <button
          onClick={() => {
            setActiveTab("terminos");
            navigate("/terminos");
          }}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all border ${
            activeTab === "terminos"
              ? "bg-[#00b4d8] text-[#0a1128] border-[#00b4d8]"
              : "bg-[#101f42] text-[#94a3b8] border-white/10 hover:text-white"
          }`}
        >
          Términos y Condiciones
        </button>
      </div>

      {/* Content Container */}
      <div className="bg-[#101f42] border border-white/10 rounded-3xl p-6 sm:p-10 text-xs sm:text-sm text-[#94a3b8] leading-relaxed space-y-6">
        {activeTab === "privacidad" ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            <section className="space-y-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#00b4d8]" />
                <span>1. Compromiso de Privacidad y Recopilación de Datos</span>
              </h3>
              <p>
                DealerAmigo valora la confianza de nuestros usuarios en Puerto Rico. Recopilamos información proporcionada de manera voluntaria, tal como nombre, número telefónico, correo electrónico, municipio, preferencias de vehículos, estimaciones de pronto pago y detalles referenciales de trade-in con el único fin de facilitar la búsqueda, orientación y coordinación de citas con concesionarios autorizados.
              </p>
            </section>

            <section className="space-y-2 bg-[#0a1128] p-5 rounded-2xl border border-[#00b4d8]/30 text-white">
              <h3 className="text-sm font-bold text-[#48cae4] uppercase tracking-wider">
                2. Cláusula de Consentimiento Expreso (Llamadas, SMS y WhatsApp)
              </h3>
              <p className="text-xs leading-relaxed text-[#f1f5f9]">
                Al ingresar tu número de teléfono y solicitar una cotización, orientación o cita a través de DealerAmigo o nuestro asistente virtual Amigo AI, <strong>otorgas tu consentimiento expreso</strong> para que DealerAmigo y el concesionario autorizado participante asignado se comuniquen contigo mediante llamadas telefónicas, mensajes de texto (SMS) automatizados o mensajes de WhatsApp con fines relacionados a tu solicitud, confirmación de citas y disponibilidad de vehículos. El consentimiento no es una condición obligatoria para la compra de bienes.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock size={18} className="text-[#ffb703]" />
                <span>3. Transferencia Exclusiva hacia el Dealer Asignado</span>
              </h3>
              <p>
                Tus datos de contacto e interés <strong>NO son vendidos ni transferidos a redes masivas de publicidad no autorizadas</strong>. La transferencia de tu información se realiza única y exclusivamente hacia el concesionario particular o vendedor oficial dueño de la unidad sobre la cual solicitaste orientación o agendaste una prueba de manejo.
              </p>
            </section>

            <section className="space-y-2 bg-[#1c2d5a]/60 p-5 rounded-2xl border border-white/10">
              <h3 className="text-sm font-bold text-[#ffb703] flex items-center gap-2">
                <BellOff size={16} />
                <span>4. Mecanismo de Cancelación Voluntaria (Opt-out enviando STOP)</span>
              </h3>
              <p className="text-xs text-[#f1f5f9]">
                Puedes revocar tu consentimiento para recibir comunicaciones en cualquier momento. Para dejar de recibir mensajes SMS o WhatsApp, simplemente responde con la palabra <strong>STOP</strong> a cualquier mensaje recibido. Para solicitar la eliminación definitiva de tus registros, puedes escribir a <strong className="text-white">privacidad@dealeramigo.com</strong>.
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-200">
            <section className="space-y-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText size={18} className="text-[#00b4d8]" />
                <span>1. Naturaleza del Servicio</span>
              </h3>
              <p>
                DealerAmigo es un portal tecnológico y orientativo independiente en el Estado Libre Asociado de Puerto Rico. DealerAmigo no es un concesionario de vehículos de motor, ni un banco, ni una cooperativa de ahorro y crédito. No vendemos vehículos directamente ni aprobamos préstamos en nombre propio.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-white">2. Precios, Pagos Estimados y Disponibilidad</h3>
              <p>
                Los precios de venta, pagos mensuales estimados, tasas de interés, garantías y términos de financiamiento expuestos en el sitio o comunicados por el asistente Amigo AI tienen carácter orientativo y referencial. El precio contractual final, los cargos oficiales (tales como tablillas, ACAA, arbitrios aplicables) y el pago mensual exacto son determinados exclusivamente por el concesionario vendedor y la institución financiera participante tras la evaluación formal de la solicitud de crédito del cliente.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-white">3. Revalidación de Inventario</h3>
              <p>
                A pesar de nuestros continuos esfuerzos por mantener el catálogo en sincronía con los concesionarios participantes, las unidades están sujetas a venta previa o reservación en tienda. La confirmación de disponibilidad debe ser revalidada directamente con el dealer antes de la visita física.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-white">4. Jurisdicción y Ley Aplicable</h3>
              <p>
                Estos términos se rigen e interpretan de conformidad con las leyes del Estado Libre Asociado de Puerto Rico y las normativas aplicables de protección al consumidor administradas por el Departamento de Asuntos del Consumidor (DACO).
              </p>
            </section>
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2.5 rounded-xl bg-[#1c2d5a] text-[#48cae4] text-xs font-bold hover:bg-[#00b4d8] hover:text-[#0a1128] transition-all border border-[#00b4d8]/30 inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          <span>Volver al Inicio</span>
        </button>
      </div>
    </div>
  );
};
