import { INVENTORY } from "./data";
import { parsePrice } from "./utils/helpers";

export interface DBLead {
  lead_id: string;
  created_at: string;
  updated_at: string;
  name: string;
  phone: string;
  phone_e164: string;
  email?: string;
  municipality: string;
  vehicle_id?: string;
  vehicle_summary?: string;
  assigned_dealer: string;
  has_trade_in: boolean;
  trade_in_summary?: string;
  financing_interest: boolean;
  buyer_intent?: string;
  credit_tier?: string;
  stage: 'New' | 'Contact Attempted' | 'Engaged' | 'Appointment Scheduled' | 'Appointment Completed' | 'Lost' | 'Closed';
  days_without_response: number;
  last_contact_attempt?: string;
  opt_out: boolean;
  consent_status: boolean;
  notes?: string;
  tags?: string[];
  cadence_step: number;
}

export interface DBAppointment {
  appointment_id: string;
  lead_id: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  dealer_name: string;
  vehicle_id: string;
  vehicle_summary: string;
  appointment_type: 'Visita al Dealer' | 'Llamada Telefónica' | 'WhatsApp' | 'Consulta de Financiamiento';
  date: string;
  time: string;
  start_iso: string;
  end_iso: string;
  confirmation_token: string;
  confirmation_url: string;
  status: 'Confirmada' | 'Pendiente' | 'Cancelada' | 'Completada';
  created_at: string;
  reminder_24h_sent: boolean;
  reminder_2h_sent: boolean;
}

export interface DBVehicleState {
  vehicle_id: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  price: number;
  estimated_monthly_payment: number;
  municipality: string;
  seller_name: string;
  availability_status: 'Disponible' | 'Pendiente de confirmación' | 'Vendido' | 'No disponible';
  updated_at: string;
}

export interface DBLogEntry {
  log_id: string;
  lead_id: string;
  channel: 'WhatsApp' | 'SMS' | 'Email';
  recipient_type: 'Dealer' | 'Buyer';
  recipient: string;
  message: string;
  timestamp: string;
  status: 'Sent' | 'Failed';
}

export interface DBStore {
  leads: Map<string, DBLead>;
  appointments: Map<string, DBAppointment>;
  vehicleStates: Map<string, DBVehicleState>;
  communicationLogs: DBLogEntry[];
}

export const DB: DBStore = {
  leads: new Map<string, DBLead>(),
  appointments: new Map<string, DBAppointment>(),
  vehicleStates: new Map<string, DBVehicleState>(),
  communicationLogs: []
};

// Initialize vehicle database from static inventory
INVENTORY.forEach((v, idx) => {
  const year = parseInt(v.Año, 10) || 2023;
  const price = parsePrice(v.Precio);
  const vId = `veh-${v.Marca.toLowerCase()}-${v.Modelo.toLowerCase().replace(/\s+/g, '-')}-${year}-${idx + 1}`;
  
  DB.vehicleStates.set(vId, {
    vehicle_id: vId,
    year,
    make: v.Marca,
    model: v.Modelo,
    trim: v["Sub-Modelo/Trim Level"] || "",
    price,
    estimated_monthly_payment: Math.max(Math.round(price / 72), 220),
    municipality: v.Municipio || "Bayamón",
    seller_name: v.Dealer || "DealerAmigo PR",
    availability_status: "Disponible",
    updated_at: new Date().toISOString()
  });
});

/**
 * 1. Validar y normalizar formato de teléfono de Puerto Rico (E.164: +1787... / +1939...)
 */
export function formatPuertoRicoPhoneE164(phone: string): { valid: boolean; e164: string; formatted: string } {
  if (!phone) return { valid: false, e164: "", formatted: "" };
  
  // Extract only digits
  const digits = phone.replace(/\D/g, "");
  
  // Standard 10 digit PR numbers: (787/939) xxx-xxxx
  if (digits.length === 10) {
    const area = digits.substring(0, 3);
    const validArea = area === "787" || area === "939";
    const e164 = `+1${digits}`;
    const formatted = `(${area}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
    return { valid: validArea, e164, formatted };
  }
  
  // 11 digit numbers with leading 1: 1787xxxxxxx / 1939xxxxxxx
  if (digits.length === 11 && digits.startsWith("1")) {
    const pure10 = digits.substring(1);
    const area = pure10.substring(0, 3);
    const validArea = area === "787" || area === "939";
    const e164 = `+${digits}`;
    const formatted = `(${area}) ${pure10.substring(3, 6)}-${pure10.substring(6)}`;
    return { valid: validArea, e164, formatted };
  }

  // 7 digit local numbers (assume 787 default)
  if (digits.length === 7) {
    const e164 = `+1787${digits}`;
    const formatted = `(787) ${digits.substring(0, 3)}-${digits.substring(3)}`;
    return { valid: true, e164, formatted };
  }

  // Fallback
  return { valid: false, e164: digits ? `+${digits}` : "", formatted: phone };
}

/**
 * Helper to log communication events
 */
export function logCommunication(
  lead_id: string,
  channel: 'WhatsApp' | 'SMS' | 'Email',
  recipient_type: 'Dealer' | 'Buyer',
  recipient: string,
  message: string
): DBLogEntry {
  const logEntry: DBLogEntry = {
    log_id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    lead_id,
    channel,
    recipient_type,
    recipient,
    message,
    timestamp: new Date().toISOString(),
    status: 'Sent'
  };
  DB.communicationLogs.push(logEntry);
  console.log(`\n📬 [NOTIFICACIÓN ENVIADA] Canal: ${channel} | Para: ${recipient_type} (${recipient})\n${message}\n`);
  return logEntry;
}

/**
 * Find similar vehicles in inventory based on budget/type
 */
export function findSimilarVehicles(targetPrice: number, excludeId?: string, limit = 2): DBVehicleState[] {
  const all = Array.from(DB.vehicleStates.values()).filter(
    v => v.availability_status === "Disponible" && v.vehicle_id !== excludeId
  );

  // Sort by price delta
  all.sort((a, b) => Math.abs(a.price - targetPrice) - Math.abs(b.price - targetPrice));
  return all.slice(0, limit);
}
