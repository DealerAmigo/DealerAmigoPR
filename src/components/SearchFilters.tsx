import React, { useState } from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';

interface SearchFiltersProps {
  onFilterChange: (filters: any) => void;
}

export default function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const [make, setMake] = useState('Todos');
  const [bodyType, setBodyType] = useState('Todos');
  const [municipality, setMunicipality] = useState('Todos');
  const [maxPrice, setMaxPrice] = useState('60000');
  const [maxPayment, setMaxPayment] = useState('Todos');
  const [warrantyOnly, setWarrantyOnly] = useState(false);
  const [hasTradeIn, setHasTradeIn] = useState(false);

  const handleApply = () => {
    onFilterChange({
      make,
      bodyType,
      municipality,
      maxPrice: parseInt(maxPrice, 10),
      maxPayment,
      warrantyOnly,
      hasTradeIn,
    });
  };

  const handleReset = () => {
    setMake('Todos');
    setBodyType('Todos');
    setMunicipality('Todos');
    setMaxPrice('60000');
    setMaxPayment('Todos');
    setWarrantyOnly(false);
    setHasTradeIn(false);
    onFilterChange({});
  };

  return (
    <section className="w-full bg-[#101f42]/90 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
        <div className="flex items-center gap-2 text-white font-black text-sm uppercase tracking-wider">
          <Filter size={16} className="text-[#00b4d8]" />
          <span>Filtro de Búsqueda Inteligente</span>
        </div>
        <button
          onClick={handleReset}
          className="text-neutral-400 hover:text-white text-xs flex items-center gap-1 transition-colors"
        >
          <RotateCcw size={12} /> Limpiar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
        {/* Make */}
        <div>
          <label className="text-neutral-300 block mb-1.5 uppercase tracking-wider text-[10px]">Marca</label>
          <select
            value={make}
            onChange={(e) => setMake(e.target.value)}
            className="w-full bg-[#0a1128] border border-white/10 text-white rounded-xl px-3 py-2.5 focus:border-[#00b4d8] outline-none"
          >
            <option value="Todos">Todas las Marcas</option>
            <option value="Toyota">Toyota</option>
            <option value="Ford">Ford</option>
            <option value="Hyundai">Hyundai</option>
            <option value="Jeep">Jeep</option>
            <option value="Kia">Kia</option>
            <option value="RAM">RAM</option>
            <option value="Nissan">Nissan</option>
            <option value="Mitsubishi">Mitsubishi</option>
          </select>
        </div>

        {/* Body Type */}
        <div>
          <label className="text-neutral-300 block mb-1.5 uppercase tracking-wider text-[10px]">Tipo de Carrocería</label>
          <select
            value={bodyType}
            onChange={(e) => setBodyType(e.target.value)}
            className="w-full bg-[#0a1128] border border-white/10 text-white rounded-xl px-3 py-2.5 focus:border-[#00b4d8] outline-none"
          >
            <option value="Todos">Todos los Tipos</option>
            <option value="SUV">SUV</option>
            <option value="Pickup">Pickup / Trabajo</option>
            <option value="Sedan">Sedán</option>
            <option value="Hatchback">Hatchback</option>
            <option value="Van">Van / Comercial</option>
          </select>
        </div>

        {/* Municipality */}
        <div>
          <label className="text-neutral-300 block mb-1.5 uppercase tracking-wider text-[10px]">Municipio</label>
          <select
            value={municipality}
            onChange={(e) => setMunicipality(e.target.value)}
            className="w-full bg-[#0a1128] border border-white/10 text-white rounded-xl px-3 py-2.5 focus:border-[#00b4d8] outline-none"
          >
            <option value="Todos">Toda la Isla</option>
            <option value="Dorado">Dorado</option>
            <option value="Vega Alta">Vega Alta</option>
            <option value="Bayamón">Bayamón</option>
            <option value="San Juan">San Juan</option>
            <option value="Caguas">Caguas</option>
            <option value="Ponce">Ponce</option>
            <option value="Mayagüez">Mayagüez</option>
            <option value="Arecibo">Arecibo</option>
            <option value="Carolina">Carolina</option>
          </select>
        </div>

        {/* Desired Monthly Payment */}
        <div>
          <label className="text-neutral-300 block mb-1.5 uppercase tracking-wider text-[10px]">Pago Mensual Estimado</label>
          <select
            value={maxPayment}
            onChange={(e) => setMaxPayment(e.target.value)}
            className="w-full bg-[#0a1128] border border-white/10 text-white rounded-xl px-3 py-2.5 focus:border-[#00b4d8] outline-none"
          >
            <option value="Todos">Cualquier Pago</option>
            <option value="300">Menos de $300/mes</option>
            <option value="450">Hasta $450/mes</option>
            <option value="600">Hasta $600/mes</option>
            <option value="750">Hasta $750/mes</option>
          </select>
        </div>
      </div>

      {/* Checkboxes and Price Slider */}
      <div className="mt-4 pt-4 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-neutral-300 select-none">
            <input
              type="checkbox"
              checked={warrantyOnly}
              onChange={(e) => setWarrantyOnly(e.target.checked)}
              className="accent-[#00b4d8] w-4 h-4 rounded"
            />
            <span>Solo unidades con Garantía</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-neutral-300 select-none">
            <input
              type="checkbox"
              checked={hasTradeIn}
              onChange={(e) => setHasTradeIn(e.target.checked)}
              className="accent-[#00b4d8] w-4 h-4 rounded"
            />
            <span>Tengo Trade-in para entregar</span>
          </label>
        </div>

        <button
          onClick={handleApply}
          className="w-full md:w-auto bg-[#00b4d8] hover:bg-[#00b4d8]/90 text-[#0a1128] font-black px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider text-xs transition-all shadow-md shadow-[#00b4d8]/20"
        >
          <Search size={14} />
          <span>Aplicar Filtros</span>
        </button>
      </div>
    </section>
  );
}
