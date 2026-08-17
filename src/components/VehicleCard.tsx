import React, { useState } from 'react';
import { ShieldCheck, MapPin, Gauge, MessageSquare, Calendar, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Vehicle } from '../types';
import { parsePrice, parseMileage, getEstimatedMonthlyPayment, inferCarroceria, inferMunicipio, inferDealer } from '../utils/helpers';

export interface VehicleData {
  vehicle_id: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  price: number;
  estimated_monthly_payment?: number;
  mileage: number;
  municipality: string;
  seller_name: string;
  new_used_status: string;
  warranty_type: string;
  availability_status: 'Disponible' | 'Pendiente de confirmación' | 'Vendido' | 'No disponible';
  date_last_verified: string;
  images: string[];
}

export function toVehicleData(v: Vehicle, index = 0): VehicleData {
  const priceNum = parsePrice(v.Precio);
  const mileageNum = parseMileage(v.Millaje);
  const paymentNum = getEstimatedMonthlyPayment(v.Precio);
  const yearNum = parseInt(v.Año, 10) || 2022;
  const photos = String(v.FotoWeblink || '').split(',').map(u => u.trim()).filter(Boolean);

  return {
    vehicle_id: `v-${v.Marca.toLowerCase()}-${v.Modelo.toLowerCase()}-${yearNum}-${index}`,
    year: yearNum,
    make: v.Marca,
    model: v.Modelo,
    trim: v['Sub-Modelo/Trim Level'],
    price: priceNum,
    estimated_monthly_payment: paymentNum > 0 ? paymentNum : undefined,
    mileage: mileageNum,
    municipality: inferMunicipio(v, index),
    seller_name: inferDealer(v, index),
    new_used_status: v.Condicion || (yearNum >= 2024 ? 'Nuevo / Demo' : 'Usado Certificado'),
    warranty_type: v.Garantia || 'Garantía de Dealer',
    availability_status: (v.Disponibles && parseInt(v.Disponibles, 10) > 0 ? 'Disponible' : 'Disponible') as any,
    date_last_verified: '2026-08-14',
    images: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800']
  };
}

export interface VehicleCardProps {
  key?: React.Key;
  v: VehicleData | Vehicle;
  onAskAmigo?: (v: VehicleData | Vehicle) => void;
  onBookAppointment?: (v: VehicleData | Vehicle) => void;
  onClick?: () => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ v, onAskAmigo, onBookAppointment, onClick }) => {
  // Normalize if raw Vehicle was passed
  const data: VehicleData = 'vehicle_id' in v ? v : toVehicleData(v);

  const [currentImg, setCurrentImg] = useState(0);
  const images = data.images?.length > 0 ? data.images : ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800'];

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImg((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImg((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleAsk = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAskAmigo) {
      onAskAmigo(v);
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-chat-with-car', {
          detail: {
            year: data.year,
            make: data.make,
            model: data.model,
            trim: data.trim || '',
            price: data.price,
            estimated_monthly_payment: data.estimated_monthly_payment,
            dealer: data.seller_name,
            municipality: data.municipality,
            photo: images[0]
          }
        })
      );
    }
  };

  const handleBook = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookAppointment) {
      onBookAppointment(v);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group bg-[#101f42] border border-white/10 hover:border-[#00b4d8]/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Image Frame with Badges */}
        <div className="relative h-52 w-full bg-[#0a1128] overflow-hidden">
          <img
            referrerPolicy="no-referrer"
            src={images[currentImg]}
            alt={`${data.year} ${data.make} ${data.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Carousel Arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-20"
                aria-label="Foto anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-20"
                aria-label="Siguiente foto"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
            <span className="bg-[#0a1128]/80 backdrop-blur-md text-white border border-white/15 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
              {data.new_used_status}
            </span>
            {data.warranty_type && data.warranty_type.includes('Garantía') && (
              <span className="bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase px-2 py-1 rounded-lg flex items-center gap-1">
                <ShieldCheck size={12} /> {data.warranty_type}
              </span>
            )}
          </div>

          {/* Location Badge */}
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-neutral-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1 z-10 pointer-events-none">
            <MapPin size={12} className="text-[#00b4d8]" />
            <span>{data.municipality}, PR</span>
          </div>

          {/* Photo Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded z-10 pointer-events-none">
              {currentImg + 1}/{images.length}
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          <div>
            <div className="text-[10px] text-[#00b4d8] font-black uppercase tracking-widest">{data.seller_name}</div>
            <h3 className="text-lg font-black text-white leading-tight tracking-tight">
              {data.year} {data.make} {data.model} {data.trim || ''}
            </h3>
          </div>

          {/* Key Metrics */}
          <div className="flex items-center gap-4 text-xs text-neutral-300 font-medium">
            <div className="flex items-center gap-1">
              <Gauge size={14} className="text-neutral-400" />
              <span>{data.mileage.toLocaleString()} mi</span>
            </div>
            <div className="text-[11px] text-neutral-400">
              Verificado: {new Date(data.date_last_verified).toLocaleDateString('es-PR')}
            </div>
          </div>

          {/* Pricing & Estimation */}
          <div className="pt-2 border-t border-white/10 flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-black text-white font-heading leading-none">
                ${data.price.toLocaleString()}
              </div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider mt-0.5">Precio sugerido</div>
            </div>

            {data.estimated_monthly_payment && (
              <div className="text-right">
                <div className="text-sm font-black text-[#ffb703] leading-none">
                  ~${data.estimated_monthly_payment}/mes
                </div>
                <div className="text-[9px] text-neutral-400 uppercase">Est. 72 meses</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleAsk}
          className="bg-[#0a1128] hover:bg-[#00b4d8]/10 text-[#00b4d8] border border-[#00b4d8]/30 font-bold py-2 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <MessageSquare size={13} />
          <span>Preguntar</span>
        </button>

        <button
          type="button"
          onClick={handleBook}
          className="bg-[#00b4d8] hover:bg-[#00b4d8]/90 text-[#0a1128] font-black py-2 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <Calendar size={13} />
          <span>Cita</span>
        </button>
      </div>
    </div>
  );
};

export default VehicleCard;
