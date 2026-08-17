export interface Vehicle {
  "Año": string;
  "Marca": string;
  "Modelo": string;
  "Sub-Modelo/Trim Level": string;
  "Motor/hp": string;
  "Transmisión": string;
  "MPG": string;
  "Color": string;
  "Precio": string;
  "Millaje": string;
  "FotoWeblink": string;
  "Clase": string;
  "Disponibles": string;
  // Enriched fields for DealerAmigo
  "Carroceria"?: string;
  "Municipio"?: string;
  "Dealer"?: string;
  "Condicion"?: string;
  "Garantia"?: string;
  "Descripcion"?: string;
}

export type PageRoute = 
  | "/" 
  | "/inventario" 
  | "/buscador-ai"
  | "/buscar-carro" 
  | "/agenda" 
  | "/para-dealers" 
  | "/registro-dealer" 
  | "/nosotros" 
  | "/preguntas-frecuentes" 
  | "/privacidad" 
  | "/terminos"
  | `/inventario/${string}`;

export interface FilterState {
  search?: string;
  carroceria?: string;
  marca?: string;
  modelo?: string;
  anoMin?: string | number;
  anoMax?: string | number;
  minYear?: number;
  maxYear?: number;
  precioMax?: string | number;
  maxPrice?: number;
  pagoMax?: string | number;
  maxPayment?: number;
  minMPG?: number;
  maxMiles?: number;
  municipio?: string;
  condicion?: string;
  cobertura?: string;
  tradeIn?: string;
  sortBy?: "relevancia" | "precio-asc" | "precio-desc" | "ano-desc" | "millaje-asc" | "price_asc" | "price_desc" | "year_desc" | "mileage_asc";
}

export interface AppointmentData {
  tipo: "Visita al Dealer" | "Llamada Telefónica" | "Pregunta por WhatsApp" | "Consulta de Financiamiento";
  vehiculo: string;
  municipio: string;
  dealer: string;
  nombre: string;
  telefono: string;
  email: string;
  fecha: string;
  hora: string;
  notas: string;
  tieneTrade: boolean;
  tradeInfo: string;
  prontoDisponible: string;
  consentimiento: boolean;
}

export interface DealerRegistrationData {
  nombreLegal: string;
  nombreComercial: string;
  personaContacto: string;
  telefono: string;
  whatsapp: string;
  email: string;
  municipio: string;
  webRedes: string;
  licenciaDealer: string;
  cantidadUnidades: string;
  metodoSync: string;
  crmUtilizado: string;
}
