import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Sparkles, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

// Imagen oficial de Shakira en el showroom (con fallback estético de alta calidad)
const SHAKIRA_AVATAR = "/assets/shakira.jpg";
const SHAKIRA_FALLBACK = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300";

interface MessageItemProps {
  content: string;
  role: string;
}

// Helper to extract vehicle name from image URL or context
function getVehicleInfoFromImage(content: string, imgSrc: string): { title: string; query: string } {
  // Try to find the section right above this image
  const parts = content.split(imgSrc);
  if (parts.length > 1) {
    const textBefore = parts[0];
    const lines = textBefore.split("\n").filter(l => l.trim().length > 0);
    // Scan backwards from image location
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      // Match patterns like "2023 Jeep Renegade" or "2021 Chevrolet Trailblazer"
      const matchYearMake = line.match(/\b(20\d\d\s+[A-Za-z0-9\-\s]{3,30})/);
      if (matchYearMake && !line.toLowerCase().includes("dealer") && !line.toLowerCase().includes("tel")) {
        const cleanTitle = matchYearMake[1].replace(/[*_#\[\]]/g, "").trim();
        return { title: cleanTitle, query: cleanTitle };
      }
    }
  }

  // Fallback: Check if URL or content has specific keywords
  return { title: "Ver Ficha Técnica", query: imgSrc };
}

const FormattedMessage: React.FC<MessageItemProps> = ({ content, role }) => {
  if (role === "user") {
    return <div className="text-white font-medium text-xs whitespace-pre-wrap">{content}</div>;
  }

  const handleCarCardClick = (imgSrc: string, customTitle?: string) => {
    const { title, query } = getVehicleInfoFromImage(content, imgSrc);
    const finalQuery = customTitle || title !== "Ver Ficha Técnica" ? (customTitle || title) : imgSrc;

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-vehicle-card", {
          detail: {
            query: finalQuery,
            imgSrc: imgSrc,
            exactPhoto: imgSrc
          }
        })
      );
    }
  };

  return (
    <div className="space-y-3 text-xs leading-relaxed text-slate-200">
      <Markdown
        components={{
          p: ({ children }) => (
            <div className="mb-2.5 last:mb-0 text-slate-200 leading-relaxed font-normal">{children}</div>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-white text-[12.5px]">{children}</strong>
          ),
          ul: ({ children }) => (
            <ul className="my-2.5 space-y-1.5 bg-[#0a1128]/70 border border-white/10 rounded-xl p-3 text-[11.5px] text-slate-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2.5 space-y-1.5 list-decimal pl-4 text-[11.5px] text-slate-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-snug">
              {children}
            </li>
          ),
          h3: ({ children }) => (
            <div className="text-xs font-black text-[#00b4d8] uppercase tracking-wider mt-3 mb-1.5 flex items-center gap-1.5 border-b border-white/10 pb-1">
              <Sparkles size={12} className="text-[#00b4d8]" />
              <span>{children}</span>
            </div>
          ),
          h4: ({ children }) => (
            <div className="text-xs font-bold text-white mt-2 mb-1">{children}</div>
          ),
          hr: () => <hr className="my-2.5 border-white/10" />,
          img: ({ src, alt }) => {
            if (!src) return null;
            const info = getVehicleInfoFromImage(content, src);
            const cardTitle = alt && alt !== "Foto del vehículo" && alt !== "image" ? alt : info.title;

            return (
              <div 
                onClick={() => handleCarCardClick(src, cardTitle)}
                className="my-3 rounded-2xl overflow-hidden border border-[#00b4d8]/40 bg-[#0a1128] shadow-lg cursor-pointer group hover:border-[#00b4d8] transition-all hover:scale-[1.01]"
                title={`Toca para ver la ficha técnica de ${cardTitle}`}
              >
                <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                  <img
                    referrerPolicy="no-referrer"
                    src={src}
                    alt={cardTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3 pointer-events-none">
                    <span className="text-[11px] font-black text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm max-w-[70%] truncate">
                      {cardTitle}
                    </span>
                    <span className="text-[10px] text-[#48cae4] font-bold bg-[#101f42]/90 border border-[#00b4d8]/40 px-2 py-0.5 rounded-full shadow shrink-0">
                      Toca para ver tarjeta ↗
                    </span>
                  </div>
                </div>
              </div>
            );
          },
          a: ({ href, children }) => {
            const textStr = String(children);
            const isImageUrl = href && (
              href.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) || 
              href.includes("supabase.co/storage") ||
              href.includes("unsplash.com") ||
              href.includes("images") ||
              textStr.toUpperCase().includes("FOTO") ||
              textStr.toUpperCase().includes("VER FOTO") ||
              textStr.toUpperCase().includes("IMAGEN")
            );

            if (isImageUrl && href) {
              const info = getVehicleInfoFromImage(content, href);
              const cardTitle = textStr && !textStr.toUpperCase().includes("FOTO") ? textStr : info.title;

              return (
                <div 
                  onClick={() => handleCarCardClick(href, cardTitle)}
                  className="my-3 rounded-2xl overflow-hidden border border-[#00b4d8]/40 bg-[#0a1128] shadow-lg cursor-pointer group hover:border-[#00b4d8] transition-all hover:scale-[1.01]"
                  title={`Toca para ver la ficha técnica de ${cardTitle}`}
                >
                  <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                    <img
                      referrerPolicy="no-referrer"
                      src={href}
                      alt={cardTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3 pointer-events-none">
                      <span className="text-[11px] font-black text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm max-w-[70%] truncate">
                        {cardTitle}
                      </span>
                      <span className="text-[10px] text-[#48cae4] font-bold bg-[#101f42]/90 border border-[#00b4d8]/40 px-2 py-0.5 rounded-full shadow shrink-0">
                        Toca para ver tarjeta ↗
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            // If it's a regular text link, render as clean bold text without showing raw URLs
            if (href && (href.startsWith("http://") || href.startsWith("https://"))) {
              // If it looks like an image URL by query params or extension, show as image
              if (href.includes("autoventas") || href.includes("gtauto") || href.includes("autoexito") || href.includes("cars")) {
                const info = getVehicleInfoFromImage(content, href);
                const cardTitle = info.title;

                return (
                  <div 
                    onClick={() => handleCarCardClick(href, cardTitle)}
                    className="my-3 rounded-2xl overflow-hidden border border-[#00b4d8]/40 bg-[#0a1128] shadow-lg cursor-pointer group hover:border-[#00b4d8] transition-all hover:scale-[1.01]"
                    title={`Toca para ver la ficha técnica de ${cardTitle}`}
                  >
                    <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                      <img
                        referrerPolicy="no-referrer"
                        src={href}
                        alt={cardTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3 pointer-events-none">
                        <span className="text-[11px] font-black text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm max-w-[70%] truncate">
                          {cardTitle}
                        </span>
                        <span className="text-[10px] text-[#48cae4] font-bold bg-[#101f42]/90 border border-[#00b4d8]/40 px-2 py-0.5 rounded-full shadow shrink-0">
                          Toca para ver tarjeta ↗
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <span className="text-[#00b4d8] font-bold">
                  {children}
                </span>
              );
            }

            return <span className="font-semibold text-white">{children}</span>;
          }
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(SHAKIRA_AVATAR);
  const [msgs, setMsgs] = useState<{ role: string; content: string }[]>([
    { 
      role: "assistant", 
      content: "¡Hola! Soy Shakira, tu asesora de ventas en DealerAmigo.\n\nEstoy lista para orientarte y ayudarte a conseguir el vehículo que buscas con un pago mensual cómodo.\n\n¿Qué tipo de carro o guagua tienes en mente hoy?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-open after 8 seconds to give a warm welcome
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleOpenAmigo = (e: any) => {
      const msg = e.detail?.message;
      setOpen(true);
      if (msg) {
        const userMsg = { role: "user", content: msg };
        setMsgs(prev => [...prev, userMsg]);
        setLoading(true);

        fetch('/api/chat', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [...msgs, userMsg] })
        })
          .then(res => res.json())
          .then(data => {
            setMsgs(prev => [...prev, { role: "assistant", content: data?.reply || "¡Hola! Con gusto te oriento sobre ese vehículo o tu consulta." }]);
          })
          .catch(err => {
            console.error("Chat error", err);
            setMsgs(prev => [...prev, { role: "assistant", content: "¡Hola! Estoy lista para ayudarte a conseguir el auto que buscas en Puerto Rico." }]);
          })
          .finally(() => setLoading(false));
      }
    };

    const handleCarClick = (e: any) => {
      const { year, make, model, trim, price, estimated_monthly_payment, dealer, municipality, photo } = e.detail || {};
      setOpen(true);

      const dealerName = dealer || "GT Auto Imports";
      const munName = municipality || (dealerName.includes("GT Auto") ? "Dorado" : "Vega Alta");
      const priceText = price ? `$${Number(price).toLocaleString()}` : "precio de oportunidad";
      const paymentText = estimated_monthly_payment ? ` (pago est. ~$${estimated_monthly_payment}/mes)` : "";
      const photoMarkdown = photo ? `\n\n[FOTO](${photo})\n\n` : "\n\n";

      const text = `¡Excelente elección! Veo que estás viendo el **${year || ''} ${make || ''} ${model || ''} ${trim || ''}**${photoMarkdown}Esta unidad está disponible en **${dealerName}** (${munName}) por **${priceText}**${paymentText}.\n\n¿Te gustaría que **agendemos una cita y prueba de manejo** en el dealer para que lo veas en persona, o prefieres que **coordinemos una llamada directa con el asesor de ventas** de ${dealerName} para darte los detalles de financiamiento y evaluar tu trade-in?`;

      setMsgs(prev => [...prev, { role: "assistant", content: text }]);
    };

    window.addEventListener('open-amigo-chat', handleOpenAmigo);
    window.addEventListener('open-chat-with-car', handleCarClick);

    return () => {
      window.removeEventListener('open-amigo-chat', handleOpenAmigo);
      window.removeEventListener('open-chat-with-car', handleCarClick);
    };
  }, [msgs]);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [msgs, loading]);

  async function handleSend(textToSend?: string) {
    const rawText = textToSend || input;
    if (!rawText.trim() || loading) return;
    const userMsg = { role: "user", content: rawText.trim() };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs })
      });
      const data = await response.json();
      setMsgs(p => [...p, { role: "assistant", content: data.reply || "Hubo un detalle de conexión, pero seguimos aquí." }]);
    } catch (e) {
      setMsgs(p => [...p, { role: "assistant", content: "Lo siento, tuve una pequeña interrupción. ¿Me repites tu mensaje?" }]);
    } finally {
      setLoading(false);
    }
  }

  const lastMsg = msgs[msgs.length - 1];
  const isCarContext = lastMsg && lastMsg.role === "assistant" && (
    lastMsg.content.includes("disponible en") || 
    lastMsg.content.includes("prueba de manejo") || 
    lastMsg.content.includes("cita") ||
    lastMsg.content.includes("asesor")
  );

  const activePrompts = isCarContext
    ? [
        "📅 Agendar Cita y Prueba de Manejo",
        "📞 Coordinar llamada con Asesor de Ventas",
        "💵 Consultar Pago Mensual & Pronto",
        "🚗 Tengo auto para entregar en trade-in"
      ]
    : [
        "Quiero ver opciones de pago cómodo",
        "¿Qué SUV familiares tienen disponibles?",
        "Tengo un carro para trade-in",
        "Quiero coordinar una prueba de manejo"
      ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-[#0a1128] border border-[#00b4d8]/40 rounded-3xl mb-4 flex flex-col shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-2xl"
          >
            {/* Header con foto real de Shakira */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-[#101f42] via-[#0d1b3a] to-[#0a1128] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <img
                    referrerPolicy="no-referrer"
                    src={avatarSrc}
                    onError={() => setAvatarSrc(SHAKIRA_FALLBACK)}
                    alt="Shakira - DealerAmigo"
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#00b4d8] shadow-md shadow-[#00b4d8]/20"
                  />
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0a1128]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white tracking-tight">Shakira</span>
                    <span className="bg-[#00b4d8]/15 text-[#00b4d8] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#00b4d8]/30">
                      Asesora Principal
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium">Ejecutiva de Ventas • DealerAmigo PR</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[#f1f5f9] hover:text-white p-2.5 rounded-full bg-white/10 hover:bg-red-500/80 border border-white/20 hover:border-red-500 transition-all shadow-md"
                title="Cerrar chat"
              >
                <X size={22} strokeWidth={2.5} />
              </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 text-xs leading-relaxed">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[90%] px-4 py-3 rounded-2xl shadow-sm ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-[#00b4d8] to-[#0096c7] text-[#0a1128] rounded-tr-none shadow-md shadow-[#00b4d8]/20"
                        : "bg-[#101f42]/95 text-slate-100 border border-white/10 rounded-tl-none"
                    }`}
                  >
                    <FormattedMessage content={m.content} role={m.role} />
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#101f42] text-slate-300 px-4 py-3 rounded-2xl rounded-tl-none border border-white/10 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00b4d8] animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-[#00b4d8] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-[#00b4d8] animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] ml-1.5 font-medium text-slate-400">Shakira está respondiendo...</span>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Quick Prompts Chips */}
            {!loading && (
              <div className="px-3.5 py-2 border-t border-white/5 bg-[#080d1f] flex gap-1.5 overflow-x-auto no-scrollbar">
                {activePrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(qp)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-[#14234b] hover:bg-[#1c2d5a] border border-[#00b4d8]/30 hover:border-[#00b4d8] text-[10.5px] text-slate-200 hover:text-white transition-all flex items-center gap-1 shrink-0 font-medium"
                  >
                    <span>{qp}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-white/10 bg-[#0a1128] flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
                placeholder="Escribe tu mensaje a Shakira..."
                className="flex-1 bg-[#101f42] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#00b4d8]"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="w-10 h-10 bg-[#00b4d8] hover:bg-[#48cae4] text-[#0a1128] rounded-xl flex items-center justify-center transition-all disabled:opacity-50 font-bold"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger con Avatar */}
      <button
        onClick={() => setOpen(!open)}
        className="group relative flex items-center gap-3 bg-[#101f42] hover:bg-[#1c2d5a] border border-[#00b4d8]/40 text-white p-1.5 pr-4 rounded-full shadow-2xl shadow-[#00b4d8]/20 transition-all hover:scale-105"
      >
        <div className="relative">
          <img
            referrerPolicy="no-referrer"
            src={avatarSrc}
            onError={() => setAvatarSrc(SHAKIRA_FALLBACK)}
            alt="Shakira"
            className="w-11 h-11 rounded-full object-cover border-2 border-[#00b4d8]"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#101f42]" />
        </div>
        <div className="text-left">
          <div className="text-[11px] font-black text-white leading-none">Hablar con Shakira</div>
          <div className="text-[9px] text-[#00b4d8] font-bold uppercase tracking-wider mt-0.5">Asesora DealerAmigo</div>
        </div>
      </button>
    </div>
  );
}

export { ChatWidget };

