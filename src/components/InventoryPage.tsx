import React, { useState } from "react";
import { Vehicle, FilterState, PageRoute } from "../types";
import { 
  CARROCERIAS, 
  MARCAS_POPULARES, 
  MUNICIPIOS_PR, 
  filterAndSortVehicles,
  formatCurrency
} from "../utils/helpers";
import { VehicleCard } from "./VehicleCard";
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Sparkles, 
  ArrowUpDown, 
  AlertCircle,
  Car,
  RotateCcw
} from "lucide-react";

interface InventoryPageProps {
  inventory: Vehicle[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSelectVehicle: (v: Vehicle) => void;
  openAmigoChat: (msg?: string) => void;
  navigate: (route: PageRoute) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
  inventory,
  filters,
  setFilters,
  onSelectVehicle,
  openAmigoChat,
  navigate
}) => {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filteredVehicles = filterAndSortVehicles(inventory, filters);

  const resetFilters = () => {
    setFilters({
      search: "",
      carroceria: "Todos",
      marca: "Todas",
      modelo: "",
      anoMin: "2018",
      anoMax: "2026",
      precioMax: "",
      pagoMax: "",
      municipio: "Todos",
      condicion: "Todos",
      cobertura: "Todos",
      tradeIn: "No",
      sortBy: "relevancia"
    });
  };

  const hasActiveFilters = 
    filters.search !== "" ||
    filters.carroceria !== "Todos" ||
    filters.marca !== "Todas" ||
    filters.modelo !== "" ||
    filters.precioMax !== "" ||
    filters.pagoMax !== "" ||
    filters.municipio !== "Todos" ||
    filters.condicion !== "Todos" ||
    filters.cobertura !== "Todos";

  return (
    <div className="max-w-[1300px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-white/10 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#00b4d8] uppercase tracking-widest flex items-center gap-1.5">
              <Car size={14} />
              <span>Puerto Rico Multi-Dealer Catalog</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mt-1">
              Inventario de Autos en Puerto Rico
            </h1>
            <p className="text-[#94a3b8] text-sm sm:text-base max-w-2xl mt-1">
              Explora vehículos verificados de dealers y vendedores participantes en toda la Isla.
            </p>
          </div>

          <button
            onClick={() => openAmigoChat("¡Hola Amigo! Ayúdame a buscar un auto con las mejores opciones de financiamiento.")}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#48cae4] text-[#0a1128] font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,180,216,0.3)] hover:brightness-110 transition-all"
          >
            <Sparkles size={14} />
            <span>Consultar con Amigo AI</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Vehicle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between gap-3 bg-[#101f42] p-3.5 rounded-2xl border border-white/10">
          <div className="text-xs text-[#f1f5f9] font-bold">
            {filteredVehicles.length} {filteredVehicles.length === 1 ? "vehículo" : "vehículos"} encontrados
          </div>
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="px-3 py-1.5 rounded-xl bg-[#1c2d5a] text-[#48cae4] text-xs font-bold flex items-center gap-1.5 border border-[#00b4d8]/30"
          >
            <SlidersHorizontal size={14} />
            <span>{mobileFilterOpen ? "Ocultar Filtros" : "Filtrar Resultados"}</span>
          </button>
        </div>

        {/* SIDEBAR FILTERS (Desktop & Mobile Drawer) */}
        <aside className={`lg:col-span-3 space-y-6 ${mobileFilterOpen ? "block" : "hidden lg:block"}`}>
          <div className="bg-[#101f42]/90 border border-white/10 rounded-2xl p-5 shadow-lg space-y-5 sticky top-24 backdrop-blur-md">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="text-sm font-black text-white flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-[#00b4d8]" />
                <span>Filtros Avanzados</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-[#ffb703] hover:underline flex items-center gap-1 font-semibold"
                >
                  <RotateCcw size={12} />
                  <span>Limpiar</span>
                </button>
              )}
            </div>

            {/* Search input */}
            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5">
                Búsqueda por texto
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="ej. 'Tucson 2024', 'Tacoma 4x4'..."
                  className="w-full bg-[#0a1128] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-[#94a3b8] focus:outline-none focus:border-[#00b4d8]"
                />
              </div>
            </div>

            {/* Ordenar por */}
            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5 flex items-center gap-1">
                <ArrowUpDown size={12} className="text-[#00b4d8]" />
                <span>Ordenar por</span>
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00b4d8]"
              >
                <option value="relevancia">Recomendados / Relevancia</option>
                <option value="precio-asc">Menor precio primero</option>
                <option value="precio-desc">Mayor precio primero</option>
                <option value="ano-desc">Año más reciente</option>
                <option value="millaje-asc">Menor millaje</option>
              </select>
            </div>

            {/* Tipo de Carrocería */}
            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5">
                Tipo de Carrocería
              </label>
              <select
                value={filters.carroceria}
                onChange={(e) => setFilters(prev => ({ ...prev, carroceria: e.target.value }))}
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00b4d8]"
              >
                {CARROCERIAS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Marca */}
            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5">
                Marca
              </label>
              <select
                value={filters.marca}
                onChange={(e) => setFilters(prev => ({ ...prev, marca: e.target.value }))}
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00b4d8]"
              >
                {MARCAS_POPULARES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Presupuesto Máximo */}
            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5">
                Rango de Precio Máximo
              </label>
              <select
                value={filters.precioMax}
                onChange={(e) => setFilters(prev => ({ ...prev, precioMax: e.target.value }))}
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00b4d8]"
              >
                <option value="">Cualquier precio</option>
                <option value="18000">Hasta $18,000</option>
                <option value="22000">Hasta $22,000</option>
                <option value="26000">Hasta $26,000</option>
                <option value="30000">Hasta $30,000</option>
                <option value="36000">Hasta $36,000</option>
                <option value="45000">Hasta $45,000</option>
              </select>
            </div>

            {/* Pago Mensual Estimado */}
            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5 flex items-center justify-between">
                <span>Pago Estimado Máximo</span>
                <span className="text-[10px] text-[#ffb703] font-bold">/mes</span>
              </label>
              <select
                value={filters.pagoMax}
                onChange={(e) => setFilters(prev => ({ ...prev, pagoMax: e.target.value }))}
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00b4d8]"
              >
                <option value="">Cualquier pago</option>
                <option value="250">Menos de $250 / mes</option>
                <option value="350">Menos de $350 / mes</option>
                <option value="450">Menos de $450 / mes</option>
                <option value="550">Menos de $550 / mes</option>
              </select>
            </div>

            {/* Municipio */}
            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5">
                Municipio en Puerto Rico
              </label>
              <select
                value={filters.municipio}
                onChange={(e) => setFilters(prev => ({ ...prev, municipio: e.target.value }))}
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00b4d8]"
              >
                {MUNICIPIOS_PR.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Garantía */}
            <div>
              <label className="block text-xs font-semibold text-[#f1f5f9] mb-1.5">
                Garantía / Cobertura
              </label>
              <select
                value={filters.cobertura}
                onChange={(e) => setFilters(prev => ({ ...prev, cobertura: e.target.value }))}
                className="w-full bg-[#0a1128] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00b4d8]"
              >
                <option value="Todos">Todas las coberturas</option>
                <option value="Con Garantía">Con Garantía</option>
                <option value="Venta As-Is / Sin Garantía">Venta As-Is / Sin Garantía</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate("/buscar-carro")}
                className="w-full py-2.5 rounded-xl bg-[#1c2d5a] hover:bg-[#00b4d8] text-[#48cae4] hover:text-[#0a1128] text-xs font-bold transition-all border border-[#00b4d8]/30 flex items-center justify-center gap-1.5"
              >
                <Sparkles size={13} />
                <span>Usar Asistente de 4 Pasos</span>
              </button>
            </div>

          </div>
        </aside>

        {/* MAIN RESULTS GRID */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* Active Chips & Result Counter */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#101f42]/60 p-4 rounded-2xl border border-white/5">
            <div className="text-xs text-[#94a3b8] font-medium">
              Mostrando <strong className="text-[#00b4d8] font-black">{filteredVehicles.length}</strong> {filteredVehicles.length === 1 ? "unidad disponible" : "unidades disponibles"}
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-1.5">
                {filters.marca !== "Todas" && (
                  <span className="text-[10px] bg-[#00b4d8]/20 text-[#48cae4] px-2.5 py-0.5 rounded-full border border-[#00b4d8]/30 flex items-center gap-1">
                    {filters.marca}
                    <X size={11} className="cursor-pointer" onClick={() => setFilters(p => ({ ...p, marca: "Todas" }))} />
                  </span>
                )}
                {filters.carroceria !== "Todos" && (
                  <span className="text-[10px] bg-[#00b4d8]/20 text-[#48cae4] px-2.5 py-0.5 rounded-full border border-[#00b4d8]/30 flex items-center gap-1">
                    {filters.carroceria}
                    <X size={11} className="cursor-pointer" onClick={() => setFilters(p => ({ ...p, carroceria: "Todos" }))} />
                  </span>
                )}
                {filters.municipio !== "Todos" && (
                  <span className="text-[10px] bg-[#ffb703]/20 text-[#ffb703] px-2.5 py-0.5 rounded-full border border-[#ffb703]/30 flex items-center gap-1">
                    {filters.municipio}
                    <X size={11} className="cursor-pointer" onClick={() => setFilters(p => ({ ...p, municipio: "Todos" }))} />
                  </span>
                )}
                {filters.precioMax && (
                  <span className="text-[10px] bg-white/10 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    Hasta ${filters.precioMax}
                    <X size={11} className="cursor-pointer" onClick={() => setFilters(p => ({ ...p, precioMax: "" }))} />
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Grid */}
          {filteredVehicles.length === 0 ? (
            <div className="text-center py-20 bg-[#101f42]/40 rounded-3xl border border-white/5 p-8 space-y-4">
              <div className="text-5xl">🚗💨</div>
              <h3 className="text-xl font-bold text-white">No encontramos vehículos con esos filtros</h3>
              <p className="text-[#94a3b8] text-sm max-w-md mx-auto">
                Prueba relajando el rango de precio o consultando a Amigo AI para que busque alternativas en otros municipios.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 rounded-xl bg-[#1c2d5a] text-white text-xs font-bold hover:bg-[#1c2d5a]/80"
                >
                  Restablecer Filtros
                </button>
                <button
                  onClick={() => openAmigoChat("No encontré el auto exacto en los filtros, ¿puedes buscarme alternativas?")}
                  className="px-5 py-2.5 rounded-xl bg-[#00b4d8] text-[#0a1128] text-xs font-bold hover:bg-[#48cae4]"
                >
                  Consultar a Amigo AI
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {filteredVehicles.map((v, i) => (
                <VehicleCard
                  key={i}
                  v={v}
                  onClick={() => onSelectVehicle(v)}
                />
              ))}
            </div>
          )}

          {/* MANDATORY INVENTORY DISCLAIMER */}
          <div className="p-4 rounded-2xl bg-[#0a1128] border border-white/10 flex items-start gap-3 text-xs text-[#94a3b8] leading-relaxed">
            <AlertCircle size={18} className="text-[#ffb703] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#f1f5f9]">Disclaimer Obligatorio de Inventario: </strong>
              Los precios, disponibilidad, condición, garantía, financiamiento y términos finales deben confirmarse directamente con el dealer o vendedor participante.
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};
