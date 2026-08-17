import React, { useState, useEffect } from "react";
import { INVENTORY } from "./data";
import { DORADO_INVENTORY } from "./dorado_inventory";
import { AUTOEXITO_INVENTORY } from "./autoexito_inventory";
import { Vehicle, FilterState, PageRoute } from "./types";
import { inferCarroceria, inferMunicipio, inferDealer, findVehicleBySlug, getVehicleSlug } from "./utils/helpers";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { RootDealerLanding } from "./components/RootDealerLanding";
import { InventoryPage } from "./components/InventoryPage";
import { VehicleDetailPage } from "./components/VehicleDetailPage";
import { AiVehicleFinder } from "./components/AiVehicleFinder";
import { AppointmentBooking } from "./components/AppointmentBooking";
import { ForDealers } from "./components/ForDealers";
import { DealerRegistration } from "./components/DealerRegistration";
import { AboutUsPage } from "./components/AboutUsPage";
import { FaqPage } from "./components/FaqPage";
import { PrivacyTermsPage } from "./components/PrivacyTermsPage";
import { VehicleModal } from "./components/VehicleModal";
import ChatWidget from "./components/ChatWidget";

export default function App() {
  // Enhanced inventory dataset with normalized metadata and combined catalogs
  const enhancedInventory: Vehicle[] = React.useMemo(() => {
    const combined = [...AUTOEXITO_INVENTORY, ...DORADO_INVENTORY, ...INVENTORY];
    return combined.map((v, index) => {
      const copy: Vehicle = { ...v };
      if (!copy.Carroceria) {
        copy.Carroceria = inferCarroceria(v);
      }
      if (!copy.Municipio) {
        copy.Municipio = inferMunicipio(v, index);
      }
      if (!copy.Dealer) {
        copy.Dealer = inferDealer(v, index);
      }
      return copy;
    });
  }, []);

  // Routing State
  const [currentRoute, setCurrentRoute] = useState<PageRoute>(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname as PageRoute;
      if (path && (path.startsWith("/inventario/") || [
        "/",
        "/inventario",
        "/buscador-ai",
        "/buscar-carro",
        "/agenda",
        "/para-dealers",
        "/registro-dealer",
        "/nosotros",
        "/preguntas-frecuentes",
        "/privacidad",
        "/terminos"
      ].includes(path))) {
        return path;
      }
    }
    return "/";
  });

  // Global Filter State for Inventory
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    carroceria: "Todos",
    marca: "Todas",
    modelo: "",
    anoMin: "2018",
    anoMax: "2026",
    minYear: 2018,
    maxYear: 2026,
    precioMax: "",
    maxPrice: 60000,
    pagoMax: "",
    maxPayment: 850,
    minMPG: 0,
    maxMiles: 120000,
    municipio: "Todos",
    condicion: "Todos",
    cobertura: "Todos",
    tradeIn: "No",
    sortBy: "price_asc"
  });

  // Selected Vehicle for Detailed Inspection Modal
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Selected Vehicle specifically forwarded to the Appointment form
  const [appointmentVehicle, setAppointmentVehicle] = useState<Vehicle | null>(null);

  // Synchronize history state for browser back/forward buttons
  const navigate = (route: PageRoute) => {
    setCurrentRoute(route);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", route);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname as PageRoute;
      setCurrentRoute(path || "/");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Check if current route is a vehicle detail slug: /inventario/[slug]
  const isSlugRoute = currentRoute.startsWith("/inventario/") && currentRoute !== "/inventario";
  const currentSlug = isSlugRoute ? currentRoute.replace("/inventario/", "") : "";
  const slugVehicle = isSlugRoute ? findVehicleBySlug(enhancedInventory, currentSlug) : undefined;

  // Global trigger for Amigo AI Chat
  const openAmigoChat = (initialMessage?: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-amigo-chat", {
          detail: { message: initialMessage }
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1128] text-white flex flex-col selection:bg-[#00b4d8]/30 selection:text-white">
      {/* Announcement Bar */}
      <div className="bg-[#101f42] border-b border-[#00b4d8]/30 text-white text-[11px] sm:text-xs font-semibold text-center py-2 px-4 flex items-center justify-center gap-2 tracking-wide">
        <span>🇵🇷</span>
        <span>
          <strong>DealerAmigo</strong> • Plataforma Independiente de Búsqueda y Captación Automotriz en Puerto Rico
        </span>
      </div>

      {/* Main Navigation Header */}
      <Navbar
        currentRoute={currentRoute}
        navigate={navigate}
        openAmigoChat={openAmigoChat}
      />

      {/* Dynamic Page Views */}
      <main className="flex-1">
        {/* /: Página institucional y de captación para Dealers */}
        {currentRoute === "/" && (
          <RootDealerLanding
            inventory={enhancedInventory}
            navigate={navigate}
            openAmigoChat={openAmigoChat}
          />
        )}

        {/* /inventario: El Marketplace completo B2C para compradores */}
        {currentRoute === "/inventario" && (
          <InventoryPage
            inventory={enhancedInventory}
            filters={filters}
            setFilters={setFilters}
            navigate={navigate}
            openAmigoChat={openAmigoChat}
            onSelectVehicle={(v) => {
              const slug = getVehicleSlug(v);
              navigate(`/inventario/${slug}` as PageRoute);
            }}
          />
        )}

        {/* /inventario/[slug]: La ficha técnica de cada auto con botón directo para hablar con Shakira o calcular el pago */}
        {isSlugRoute && (
          slugVehicle ? (
            <VehicleDetailPage
              vehicle={slugVehicle}
              inventory={enhancedInventory}
              navigate={navigate}
              openAmigoChat={openAmigoChat}
              onBookAppointment={(v) => {
                setAppointmentVehicle(v);
                navigate("/agenda");
              }}
            />
          ) : (
            <div className="max-w-[800px] mx-auto py-24 px-4 text-center space-y-4">
              <div className="text-4xl">🚗🔍</div>
              <h2 className="text-2xl font-black text-white">Vehículo no encontrado</h2>
              <p className="text-[#94a3b8] text-sm">
                Es posible que esta unidad haya sido vendida o actualizada en el catálogo.
              </p>
              <button
                onClick={() => navigate("/inventario")}
                className="px-6 py-3 bg-[#00b4d8] text-[#0a1128] font-bold rounded-xl text-xs hover:bg-[#48cae4] transition-colors"
              >
                Ver inventario disponible en Puerto Rico
              </button>
            </div>
          )
        )}

        {(currentRoute === "/buscador-ai" || currentRoute === "/buscar-carro") && (
          <AiVehicleFinder
            inventory={enhancedInventory}
            navigate={navigate}
            openAmigoChat={openAmigoChat}
            onApplyFilters={(newFilters) => {
              setFilters(prev => ({ ...prev, ...newFilters }));
            }}
            onSelectVehicle={(v) => {
              const slug = getVehicleSlug(v);
              navigate(`/inventario/${slug}` as PageRoute);
            }}
          />
        )}

        {currentRoute === "/agenda" && (
          <AppointmentBooking
            inventory={enhancedInventory}
            selectedVehicle={appointmentVehicle}
            navigate={navigate}
            openAmigoChat={openAmigoChat}
          />
        )}

        {currentRoute === "/para-dealers" && (
          <ForDealers
            navigate={navigate}
            openAmigoChat={openAmigoChat}
          />
        )}

        {currentRoute === "/registro-dealer" && (
          <DealerRegistration
            navigate={navigate}
            openAmigoChat={openAmigoChat}
          />
        )}

        {currentRoute === "/nosotros" && (
          <AboutUsPage
            navigate={navigate}
            openAmigoChat={openAmigoChat}
          />
        )}

        {currentRoute === "/preguntas-frecuentes" && (
          <FaqPage
            navigate={navigate}
            openAmigoChat={openAmigoChat}
          />
        )}

        {(currentRoute === "/privacidad" || currentRoute === "/terminos") && (
          <PrivacyTermsPage
            initialTab={currentRoute === "/terminos" ? "terminos" : "privacidad"}
            navigate={navigate}
          />
        )}
      </main>

      {/* Universal Footer with Full Legal Disclaimers */}
      <Footer
        navigate={navigate}
        openAmigoChat={openAmigoChat}
      />

      {/* Interactive Vehicle Inspection & Specs Modal (Fallback when opened directly) */}
      {selectedVehicle && (
        <VehicleModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          navigate={navigate}
          openAmigoChat={openAmigoChat}
          onBookAppointment={(v) => {
            setSelectedVehicle(null);
            setAppointmentVehicle(v);
            navigate("/agenda");
          }}
        />
      )}

      {/* Persistent Amigo AI Chat Assistant with Shakira */}
      <ChatWidget />
    </div>
  );
}
