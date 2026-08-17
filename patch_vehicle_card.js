const fs = require('fs');

let code = fs.readFileSync('src/components/VehicleCard.tsx', 'utf8');

// Replace the price block
const oldPriceBlock = `        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <div className="text-3xl font-black text-red-600 tracking-tight leading-none mb-1">
              {v.Precio}
            </div>
            {payment > 0 && (
              <button 
                 onClick={(e) => {
                  e.stopPropagation();
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('open-chat-with-finance', {
                      detail: { year: v.Año, make: v.Marca, model: v.Modelo, payment }
                    }));
                  }
                }}
                className="text-[11px] font-bold tracking-wide bg-red-600 hover:bg-red-500 text-white px-2.5 py-1.5 rounded-lg transition-colors w-max shadow-md shadow-red-600/20"
              >
                Pago est. $ {payment} / 72mo
              </button>
            )}
          </div>
          <div className="text-xs text-white/60 font-medium pb-2">
            {v.Millaje} millas
          </div>
        </div>`;

const newPriceBlock = `        <div className="flex items-end justify-between mt-2">
          <div className="flex flex-col">
            {priceVal > 0 ? (
              <>
                <div className="text-xs text-neutral-400 font-medium line-through decoration-red-500/50 mb-0.5">
                  MSRP: ${(priceVal + 2500).toLocaleString('en-US', { style: 'currency', currency: 'USD' }).replace('.00', '')}
                </div>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <div className="text-3xl font-black text-white tracking-tight leading-none">
                    {v.Precio}
                  </div>
                  <div className="text-[10px] bg-red-600/20 text-red-500 px-1.5 py-0.5 rounded font-bold border border-red-600/30">
                    -$2,500
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('open-chat-with-finance', {
                        detail: { year: v.Año, make: v.Marca, model: v.Modelo, payment }
                      }));
                    }
                  }}
                  className="group relative overflow-hidden text-[11px] font-extrabold tracking-wide bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-3 py-2 rounded-lg transition-all w-max shadow-[0_0_15px_rgba(220,38,38,0.4)] flex items-center gap-1.5"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                  <span>Calcula tu pago:</span>
                  <span className="bg-black/20 px-1.5 py-0.5 rounded text-white">${payment}/mo</span>
                </button>
              </>
            ) : (
              <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('open-chat-with-car', {
                        detail: { year: v.Año, make: v.Marca, model: v.Modelo }
                      }));
                    }
                  }}
                  className="group relative overflow-hidden text-[13px] font-black tracking-widest uppercase bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white px-4 py-3 rounded-xl transition-all w-full shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center justify-center gap-2 mt-2"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                  🔒 Desbloquear Precio
              </button>
            )}
          </div>
        </div>`;

// Replace chips and class badges to add "hooks"
const hooksBlock = `
      {/* Ribbon */}
      {priceVal > 0 && priceVal < 25000 && (
        <div className="absolute top-4 -right-12 bg-red-600 text-white px-12 py-1 rotate-45 text-[10px] font-black tracking-widest uppercase shadow-lg border-y border-white/20 z-20">
          Liquidación
        </div>
      )}
      
      {/* Visual Hook: Scarcity */}
      <div className="absolute bottom-4 right-4 z-20">
        <div className="flex items-center gap-1.5 bg-black/80 border border-red-500/30 text-white px-2.5 py-1.5 rounded-lg shadow-xl backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-[10px] font-bold">2 Viendo esto</span>
        </div>
      </div>
      
      {v.Clase && (
        <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/10 z-20 shadow-xl flex items-center gap-1.5">
          <span className="text-red-500">●</span> {v.Clase}
        </div>
      )}
`;

// Replace the v.Clase part with the new hooksBlock
code = code.replace(
  `      {v.Clase && (
        <div className="absolute top-4 left-4 bg-black/80 text-red-500 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-red-500/30">
          {v.Clase}
        </div>
      )}`,
  hooksBlock
);

code = code.replace(oldPriceBlock, newPriceBlock);

fs.writeFileSync('src/components/VehicleCard.tsx', code);
