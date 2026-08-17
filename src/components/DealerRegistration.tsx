import React, { useState } from "react";
import { PageRoute, DealerRegistrationData } from "../types";
import { MUNICIPIOS_PR } from "../utils/helpers";
import { Building2, CheckCircle2, ShieldCheck, Send, Sparkles, ArrowLeft } from "lucide-react";

interface DealerRegistrationProps {
  navigate: (route: PageRoute) => void;
  openAmigoChat: (msg?: string) => void;
}

export const DealerRegistration: React.FC<DealerRegistrationProps> = ({ navigate, openAmigoChat }) => {
  const [formData, setFormData] = useState<DealerRegistrationData>({
    nombreLegal: "",
    nombreComercial: "",
    personaContacto: "",
    telefono: "",
    whatsapp: "",
    email: "",
    municipio: "San Juan",
    webRedes: "",
    licenciaDealer: "",
    cantidadUnidades: "30-50 unidades",
    metodoSync: "CSV Feed / Enlace",
    crmUtilizado: "Ninguno / WhatsApp"
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      name: formData.personaContacto,
      phone: formData.telefono,
      email: formData.email,
      dealer: formData.nombreComercial || formData.nombreLegal,
      municipio: formData.municipio,
      Fuente: "DealerRegistration",
      timestamp: new Date().toISOString()
    };

    try {
      const stored = JSON.parse(localStorage.getItem("dealeramigo_dealers_registered") || "[]");
      stored.unshift(payload);
      localStorage.setItem("dealeramigo_dealers_registered", JSON.stringify(stored));

      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="max-w-[850px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101f42] border border-[#ffb703]/40 text-xs font-bold text-[#ffb703] uppercase tracking-widest">
          <Building2 size={13} />
          <span>AFILIACIÓN DE CONCESIONARIOS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Únete a la Red de Dealers Participantes
        </h1>
        <p className="text-[#94a3b8] text-sm sm:text-base max-w-xl mx-auto">
          Completa el formulario de alta para comenzar a publicar tu inventario y recibir prospectos cualificados con Amigo AI.
        </p>
      </div>

      {submitted ? (
        <div className="bg-[#101f42] border border-[#00b4d8]/40 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              ¡Solicitud de Registro Enviada!
            </h2>
            <p className="text-sm text-[#48cae4] max-w-md mx-auto">
              Gracias, <strong>{formData.nombreComercial || formData.nombreLegal}</strong>. Un especialista de alianzas de DealerAmigo se comunicará con {formData.personaContacto} al {formData.telefono} en menos de 24 horas laborables.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0a1128] border border-white/10 max-w-md mx-auto text-xs text-[#94a3b8] text-left space-y-1">
            <div className="text-white font-bold pb-1 border-b border-white/10">Próximos pasos de activación:</div>
            <div>1. Validación de credenciales y municipio en Puerto Rico.</div>
            <div>2. Sincronización inicial de tu inventario ({formData.metodoSync}).</div>
            <div>3. Activación de tu canal de leads y citas en vivo con Amigo AI.</div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 rounded-xl bg-[#00b4d8] text-[#0a1128] font-bold text-xs hover:bg-[#48cae4]"
            >
              Volver al Inicio
            </button>
            <button
              onClick={() => navigate("/para-dealers")}
              className="px-6 py-3 rounded-xl bg-[#1c2d5a] text-white font-bold text-xs hover:bg-[#1c2d5a]/80 border border-white/10"
            >
              Ver Más Beneficios
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-[#101f42]/90 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6">
          
          <div className="text-xs font-bold uppercase tracking-wider text-[#ffb703] border-b border-white/10 pb-2">
            Información del Concesionario
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Nombre Legal */}
            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1">
                Nombre Legal del Negocio *
              </label>
              <input
                type="text"
                required
                value={formData.nombreLegal}
                onChange={(e) => setFormData({ ...formData, nombreLegal: e.target.value })}
                placeholder="ej. Auto Group LLC"
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#00b4d8]"
              />
            </div>

            {/* 2. Nombre Comercial */}
            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1">
                Nombre Comercial / Público *
              </label>
              <input
                type="text"
                required
                value={formData.nombreComercial}
                onChange={(e) => setFormData({ ...formData, nombreComercial: e.target.value })}
                placeholder="ej. Metro Auto Select"
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#00b4d8]"
              />
            </div>

            {/* 3. Persona de Contacto */}
            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1">
                Persona de Contacto / Gerente de Ventas *
              </label>
              <input
                type="text"
                required
                value={formData.personaContacto}
                onChange={(e) => setFormData({ ...formData, personaContacto: e.target.value })}
                placeholder="ej. Carlos Morales"
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#00b4d8]"
              />
            </div>

            {/* 4. Teléfono */}
            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1">
                Teléfono Directo de Ventas *
              </label>
              <input
                type="tel"
                required
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="ej. (787) 555-4000"
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#00b4d8]"
              />
            </div>

            {/* 5. WhatsApp */}
            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1">
                WhatsApp para Notificación de Citas
              </label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="ej. (787) 555-4001"
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#00b4d8]"
              />
            </div>

            {/* 6. Correo Electrónico */}
            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1">
                Correo Electrónico de Ventas *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ej. ventas@dealer.com"
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#00b4d8]"
              />
            </div>

            {/* 7. Municipio */}
            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1">
                Municipio en Puerto Rico *
              </label>
              <select
                value={formData.municipio}
                onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00b4d8]"
              >
                {MUNICIPIOS_PR.filter(m => m !== "Todos").map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* 8. Página Web / Redes */}
            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1">
                Página Web o Facebook / Instagram
              </label>
              <input
                type="text"
                value={formData.webRedes}
                onChange={(e) => setFormData({ ...formData, webRedes: e.target.value })}
                placeholder="ej. www.midealer.com o facebook.com/dealer"
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#00b4d8]"
              />
            </div>

            {/* 9. Licencia de Dealer */}
            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1">
                Número de Licencia de Dealer (DACO / Hacienda)
              </label>
              <input
                type="text"
                value={formData.licenciaDealer}
                onChange={(e) => setFormData({ ...formData, licenciaDealer: e.target.value })}
                placeholder="ej. DL-12345 (opcional para inicio)"
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#00b4d8]"
              />
            </div>

            {/* 10. Cantidad de Unidades */}
            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1">
                Cantidad promedio de unidades en inventario
              </label>
              <select
                value={formData.cantidadUnidades}
                onChange={(e) => setFormData({ ...formData, cantidadUnidades: e.target.value })}
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00b4d8]"
              >
                <option value="1-15 unidades">1 - 15 unidades</option>
                <option value="16-35 unidades">16 - 35 unidades</option>
                <option value="36-70 unidades">36 - 70 unidades</option>
                <option value="71-150 unidades">71 - 150 unidades</option>
                <option value="150+ unidades">Más de 150 unidades</option>
              </select>
            </div>

            {/* 11. Método de sincronización */}
            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1">
                Método preferido de sincronización
              </label>
              <select
                value={formData.metodoSync}
                onChange={(e) => setFormData({ ...formData, metodoSync: e.target.value })}
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00b4d8]"
              >
                <option value="CSV Feed / Enlace">Enlace CSV / Feed Automático</option>
                <option value="Carga Manual">Carga Manual / Asistida</option>
                <option value="Integración por API / Webhook">Integración por API / Webhook</option>
                <option value="Google Sheets">Sincronización vía Google Sheets</option>
              </select>
            </div>

            {/* 12. CRM Utilizado */}
            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1">
                CRM o Sistema de Ventas Utilizado
              </label>
              <select
                value={formData.crmUtilizado}
                onChange={(e) => setFormData({ ...formData, crmUtilizado: e.target.value })}
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00b4d8]"
              >
                <option value="Ninguno / WhatsApp Directo">Ninguno / WhatsApp Directo</option>
                <option value="HubSpot">HubSpot</option>
                <option value="Salesforce / VinSolutions">Salesforce / VinSolutions</option>
                <option value="Elead / CDK">Elead / CDK</option>
                <option value="DealerSocket">DealerSocket</option>
                <option value="Google Sheets / Correo">Google Sheets / Correo</option>
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#ffb703] via-[#fb8500] to-[#ffb703] text-[#0a1128] font-black text-sm sm:text-base shadow-[0_0_25px_rgba(255,183,3,0.4)] hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Enviando información...</span>
              ) : (
                <>
                  <Send size={16} />
                  <span>Enviar Solicitud de Registro</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}
    </div>
  );
};
