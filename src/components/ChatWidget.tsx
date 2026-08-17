import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, Sparkles, ShieldCheck, ExternalLink, Calendar, Car, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

// Imagen oficial de Shakira en el showroom (con fallback estético de alta calidad)
const SHAKIRA_AVATAR = "/assets/shakira.jpg";
const SHAKIRA_FALLBACK = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300";

interface MessageItemProps {
  content: string;
  role: string;
  onQuickReply?: (text: string) => void;
}

const FormattedMessage: React.FC<MessageItemProps> = ({ content, role, onQuickReply }) => {
  if (role === "user") {
    return <div className="text-white font-medium text-xs whitespace-pre-wrap">{content}</div>;
  }

  // Custom markdown renderer for assistant responses to create elegant sections
  return (
    <div className="space-y-3 text-xs leading-relaxed text-slate-200">
      <Markdown
        components={{
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 text-slate-200 leading-relaxed font-normal">{children}</p>
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
          a: ({ href, children }) => {
            // Check if it's an image link like [FOTO](url)
            const textStr = String(children);
            if (textStr.toUpperCase().includes("FOTO") && href) {
              return (
                <div className="my-3 rounded-2xl overflow-hidden border border-[#00b4d8]/40 bg-[#0a1128] shadow-lg group">
                  <div className="relative h-36 w-full bg-slate-900 overflow-hidden">
                    <img
                      referrerPolicy="no-referrer"
                      src={href}
                      alt="Foto de la unidad"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00b4d8] text-[#0a1128] text-[10px] font-black shadow"
                      >
                        <span>Ver Foto Completa</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00b4d8] hover:text-[#48cae4] underline font-semibold inline-flex items-center gap-1"
              >
                <span>{children}</span>
                <ExternalLink size={10} />
              </a>
            );
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
      const { year, make, model } = e.detail || {};
      setOpen(true);
      const text = `¡Excelente elección! Noté que te interesa el ${year} ${make} ${model}.\n\n¿Te gustaría que verifiquemos pagos mensuales estimados o coordinemos una prueba de manejo en el dealer?`;
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

  const quickPrompts = [
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
                    <FormattedMessage content={m.content} role={m.role} onQuickReply={handleSend} />
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
            {msgs.length <= 3 && !loading && (
              <div className="px-3.5 py-2 border-t border-white/5 bg-[#080d1f] flex gap-1.5 overflow-x-auto no-scrollbar">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(qp)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-[#14234b] hover:bg-[#1c2d5a] border border-white/10 text-[10.5px] text-slate-300 hover:text-white transition-all flex items-center gap-1 shrink-0"
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

