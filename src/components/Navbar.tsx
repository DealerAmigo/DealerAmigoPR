import React, { useState } from "react";
import { PageRoute } from "../types";
import { Car, MessageSquare, Menu, X, Sparkles, Shield, Building2 } from "lucide-react";

interface NavbarProps {
  currentRoute: PageRoute;
  navigate: (route: PageRoute) => void;
  openAmigoChat: (initialMsg?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate, openAmigoChat }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks: { label: string; route: PageRoute; badge?: string }[] = [
    { label: "Inicio", route: "/" },
    { label: "Inventario", route: "/inventario" },
    { label: "Buscador AI", route: "/buscar-carro", badge: "Amigo" },
    { label: "Citas & Pruebas", route: "/agenda" },
    { label: "Para Dealers", route: "/para-dealers" },
    { label: "Sobre Nosotros", route: "/nosotros" },
    { label: "Preguntas", route: "/preguntas-frecuentes" }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#101f42]/95 backdrop-blur-md border-b border-white/10 shadow-lg">
      {/* Main Nav */}
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00b4d8] to-[#1c2d5a] flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,180,216,0.4)] group-hover:scale-105 transition-transform border border-white/10">
            <Car size={22} className="text-[#f1f5f9]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-2xl font-black tracking-tight text-white">Dealer<span className="text-[#00b4d8]">Amigo</span></span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#00b4d8]/20 text-[#48cae4] font-bold border border-[#00b4d8]/30">PR</span>
            </div>
            <div className="text-[10px] text-[#94a3b8] tracking-wider uppercase font-semibold mt-0.5">
              Tu Aliado Automotriz en Puerto Rico
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((item) => {
            const active = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => navigate(item.route)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative flex items-center gap-1.5 ${
                  active 
                    ? "text-[#48cae4] bg-[#1c2d5a] shadow-[0_0_10px_rgba(0,180,216,0.2)] border border-[#00b4d8]/40" 
                    : "text-[#94a3b8] hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#00b4d8]/20 text-[#48cae4] font-bold flex items-center gap-0.5">
                    <Sparkles size={9} />
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          <button
            onClick={() => openAmigoChat("¡Hola Amigo! Ayúdame a buscar el mejor carro para mi presupuesto.")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#48cae4] text-[#0a1128] font-black text-xs shadow-[0_0_20px_rgba(0,180,216,0.35)] hover:brightness-110 transition-all hover:scale-105 active:scale-95"
          >
            <MessageSquare size={14} className="fill-[#0a1128]" />
            <span>Hablar con Amigo</span>
          </button>
          
          <button
            onClick={() => window.open("https://atiende-recepcionista-ia.ai.studio", "_blank")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1c2d5a]/60 hover:bg-[#1c2d5a] text-[#f1f5f9] border border-white/10 text-xs font-bold transition-all"
          >
            <Building2 size={13} className="text-[#ffb703]" />
            <span>Soy Dealer</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-[#94a3b8] hover:text-white p-2 rounded-lg bg-white/5 border border-white/10"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a1128] border-b border-white/10 px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((item) => (
            <button
              key={item.route}
              onClick={() => {
                navigate(item.route);
                setMobileOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                currentRoute === item.route
                  ? "bg-[#00b4d8]/20 text-[#48cae4] border border-[#00b4d8]/40"
                  : "text-[#94a3b8] hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00b4d8]/30 text-[#48cae4] font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={() => {
                openAmigoChat();
                setMobileOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#48cae4] text-[#0a1128] font-bold text-sm shadow-lg"
            >
              <MessageSquare size={16} />
              <span>Hablar con Amigo (AI Concierge)</span>
            </button>
            <button
              onClick={() => {
                window.open("https://atiende-recepcionista-ia.ai.studio", "_blank");
                setMobileOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1c2d5a] text-[#f1f5f9] font-bold text-xs border border-white/10"
            >
              <Building2 size={14} className="text-[#ffb703]" />
              <span>Acceso para Dealers Participantes</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
