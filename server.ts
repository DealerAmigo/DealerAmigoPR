import { INVENTORY } from "./src/data";
import { DORADO_INVENTORY } from "./src/dorado_inventory";
import { AUTOEXITO_INVENTORY } from "./src/autoexito_inventory";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { google } from "googleapis";
import { Resend } from "resend";
import dotenv from "dotenv";
import { 
  DB, 
  DBLead, 
  DBAppointment, 
  formatPuertoRicoPhoneE164, 
  logCommunication, 
  findSimilarVehicles 
} from "./src/workflowEngine";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Helper to pause execution
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Wrapper to auto-retry AI requests on 503 or 429 errors
async function generateContentWithRetry(aiClient: any, model: string, contents: any[], config: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await aiClient.models.generateContent({ model, contents, config });
    } catch (error: any) {
      const status = error?.status || error?.response?.status;
      const errorCode = error?.error?.code || error?.response?.data?.error?.code;
      
      if (attempt < maxRetries && (status === 503 || status === 429 || errorCode === 503 || errorCode === 429)) {
        const delayMs = attempt * 2500;
        console.warn(`[AI API] Temporal Error (${status || errorCode}). Intento ${attempt} fallido. Reintentando en ${delayMs}ms...`);
        await sleep(delayMs);
      } else {
        throw error;
      }
    }
  }
}

// Helper: Enviar notificación JSON por Resend a willquisnos@gmail.com
function sendResendEmail(replyText: string, messages: any[]) {
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'willquisnos@gmail.com',
        subject: 'Conversación Shakira (DealerAmigo PR)',
        text: `Shakira respondió:\n\n${replyText}\n\n=== Resumen / Historial en Formato JSON ===\n${JSON.stringify(messages, null, 2)}`
      }).then(() => console.log('Email sent to willquisnos@gmail.com successfully.'))
        .catch((e) => console.error('Error sending Resend email:', e));
    } catch (e) {
      console.error('Error initializing Resend:', e);
    }
  } else {
    console.warn("RESEND_API_KEY no encontrada. No se enviará el email con el JSON.");
  }
}

// Helper: Enviar notificación de Lead / Cita a willquisnos@gmail.com
function sendLeadResendEmail(title: string, data: any) {
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'willquisnos@gmail.com',
        subject: `[DealerAmigo] ${title}`,
        text: `${title}\n\n=== Datos en Formato JSON ===\n${JSON.stringify(data, null, 2)}`
      }).then(() => console.log(`Email [${title}] sent to willquisnos@gmail.com.`))
        .catch((e) => console.error('Error sending lead email:', e));
    } catch (e) {
      console.error('Error initializing Resend for lead:', e);
    }
  }
}

app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

// Health check API
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    leads_count: DB.leads.size, 
    appointments_count: DB.appointments.size,
    inventory_count: DB.vehicleStates.size
  });
});

// ================================================================================
// WORKFLOW 1: NUEVO LEAD & ENRUTAMIENTO (/webhook/new-lead)
// ================================================================================
app.post("/webhook/new-lead", async (req, res) => {
  try {
    const payload = req.body;
    const rawName = payload.name || payload.Nombre || "Cliente DealerAmigo";
    const rawPhone = payload.phone || payload.Telefono || "";
    const rawEmail = payload.email || payload.Email || "";
    const rawMunicipality = payload.municipality || payload.Municipio || "Puerto Rico";
    const rawVehicleSummary = payload.vehicle_summary || payload.vehicle || payload["Vehiculo Interes"] || "Vehículo de Inventario";
    const rawVehicleId = payload.vehicle_id || "";
    const hasTradeIn = payload.has_trade_in ?? (payload.tieneTrade === "Si" || payload.tieneTrade === true);
    const tradeInSummary = payload.trade_in_summary || payload.tieneTrade || "No aplica";
    const financingInterest = payload.financing_interest ?? (payload.metodoPago !== "Cash");
    const assignedDealer = payload.assigned_dealer || payload.dealer || "DealerAmigo VIP Partner PR";
    const consent = payload.consent_status ?? payload.consent_given ?? true;

    // 1. Validar formato de teléfono de Puerto Rico (E.164: +1787... / +1939...)
    const phoneVal = formatPuertoRicoPhoneE164(rawPhone);
    const phoneE164 = phoneVal.e164 || rawPhone;
    const phoneDisplay = phoneVal.formatted || rawPhone;

    const cleanDigits = rawPhone.replace(/\D/g, "");
    const leadId = cleanDigits ? `LEAD-${cleanDigits}` : `LEAD-${Date.now()}`;
    const nowISO = new Date().toISOString();

    // 2. Guardar registro en base de datos (leads table / state)
    const leadRecord: DBLead = {
      lead_id: leadId,
      created_at: nowISO,
      updated_at: nowISO,
      name: rawName,
      phone: rawPhone,
      phone_e164: phoneE164,
      email: rawEmail,
      municipality: rawMunicipality,
      vehicle_id: rawVehicleId,
      vehicle_summary: rawVehicleSummary,
      assigned_dealer: assignedDealer,
      has_trade_in: Boolean(hasTradeIn),
      trade_in_summary: tradeInSummary,
      financing_interest: Boolean(financingInterest),
      buyer_intent: payload.buyer_intent || "Listo para asesor",
      credit_tier: payload.credit_tier || payload.creditTier || "Por evaluar",
      stage: "New",
      days_without_response: 0,
      opt_out: false,
      consent_status: Boolean(consent),
      notes: payload.notes || payload.resumen || "",
      cadence_step: 0
    };

    DB.leads.set(leadId, leadRecord);

    // 3. Determinar Dealer Destino y Gerente de Ventas
    const dealerContactPhone = "+17875550199"; // Enrutamiento institucional

    // 4. Enviar Alerta Inmediata por WhatsApp / SMS al Gerente de Ventas del Dealer
    const dealerAlertMessage = `🚨 *NUEVO PROSPECTO DEALERAMIGO*:
Cliente: ${rawName} | Tel: ${phoneDisplay} | Municipio: ${rawMunicipality}
Auto de Interés: ${rawVehicleSummary}
Trade-in: ${hasTradeIn ? `Sí (${tradeInSummary})` : 'No'} | Financiamiento: ${financingInterest ? 'Sí' : 'No'}`;

    logCommunication(leadId, 'WhatsApp', 'Dealer', dealerContactPhone, dealerAlertMessage);

    // 5. Enviar Mensaje de Confirmación al Comprador vía WhatsApp
    const buyerWelcomeMessage = `¡Hola ${rawName}! Recibimos tu solicitud en DealerAmigo para el ${rawVehicleSummary}. Un asesor del dealer te contactará en breve.`;
    
    logCommunication(leadId, 'WhatsApp', 'Buyer', phoneE164, buyerWelcomeMessage);

    // Webhooks externos y Google Apps Script
    sendLeadResendEmail(`Nuevo Prospecto Webhook: ${rawName} (${phoneDisplay})`, leadRecord);
    await dispatchWebhook("new_lead", leadRecord);
    await sendLeadToSheet({
      "Timestamp": nowISO,
      "Lead ID": leadId,
      "Nombre": rawName,
      "Telefono": phoneDisplay,
      "Telefono E164": phoneE164,
      "Email": rawEmail,
      "Municipio": rawMunicipality,
      "Vehiculo Interes": rawVehicleSummary,
      "Dealer Asignado": assignedDealer,
      "Trade-In": hasTradeIn ? "Si" : "No",
      "Financiamiento": financingInterest ? "Si" : "No",
      "Consentimiento": consent ? "Si" : "No",
      "Estado Lead": "Nuevo prospecto"
    });

    return res.status(201).json({
      success: true,
      workflow: "WORKFLOW 1: NUEVO LEAD & ENRUTAMIENTO",
      lead_id: leadId,
      phone_normalized: phoneE164,
      assigned_dealer: assignedDealer,
      notifications_sent: {
        dealer_alert: true,
        buyer_confirmation: true
      },
      data: leadRecord
    });
  } catch (error: any) {
    console.error("Error in /webhook/new-lead:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// ================================================================================
// WORKFLOW 2: SOLICITUD Y CONFIRMACIÓN DE CITA (/webhook/appointment-requested)
// ================================================================================
app.post("/webhook/appointment-requested", async (req, res) => {
  try {
    const payload = req.body;
    const rawName = payload.name || payload.Nombre || "Cliente";
    const rawPhone = payload.phone || payload.Telefono || "";
    const rawEmail = payload.email || payload.Email || "";
    const vehicleId = payload.vehicle_id || "";
    const vehicleSummary = payload.vehicle_summary || payload.vehicle || "Vehículo seleccionado";
    const dealerName = payload.dealer_name || payload.assigned_dealer || "DealerAmigo PR";
    const appointmentType = payload.appointment_type || "Visita al Dealer";
    const requestedDate = payload.appointment_date || payload.date || new Date().toISOString().split("T")[0];
    const requestedTime = payload.appointment_time || payload.time || "10:00 AM AST";

    // 1. Verificar estado del vehículo en base de datos (availability_status == 'Disponible')
    let isAvailable = true;
    if (vehicleId && DB.vehicleStates.has(vehicleId)) {
      const vState = DB.vehicleStates.get(vehicleId);
      isAvailable = vState?.availability_status === "Disponible";
    }

    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        error: "El vehículo solicitado ya no está disponible para citas.",
        availability_status: "No disponible"
      });
    }

    // 2. Insertar evento en Google Calendar del Dealer con zona horaria America/Puerto_Rico
    const appointmentId = `APT-${Date.now()}`;
    const token = `CONF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const confirmationUrl = `https://usadealeramigo.com/citas/confirmar?id=${appointmentId}&token=${token}`;

    const { startISO, endISO } = parseFechaCita(`${requestedDate} ${requestedTime}`);

    if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      try {
        const auth = new google.auth.JWT({
          email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          scopes: ['https://www.googleapis.com/auth/calendar']
        });
        const calendar = google.calendar({ version: 'v3', auth });
        const calendarId = process.env.CALENDAR_ID || "1775184b52ed8719c74796900e60230515c9aa0260cd5cf9713ca56b87359689@group.calendar.google.com";

        await calendar.events.insert({
          calendarId,
          requestBody: {
            summary: `Cita DealerAmigo: ${rawName} - ${vehicleSummary}`,
            description: `Cliente: ${rawName}\nTeléfono: ${rawPhone}\nEmail: ${rawEmail}\nTipo: ${appointmentType}\nAuto: ${vehicleSummary}\nDealer: ${dealerName}\nConfirmación: ${confirmationUrl}`,
            start: { dateTime: startISO, timeZone: "America/Puerto_Rico" },
            end: { dateTime: endISO, timeZone: "America/Puerto_Rico" },
          }
        });
      } catch (calErr) {
        console.error("Calendar insert error:", calErr);
      }
    }

    // 3. Generar enlace y registrar cita
    const appointmentRecord: DBAppointment = {
      appointment_id: appointmentId,
      lead_id: `LEAD-${rawPhone.replace(/\D/g, "")}`,
      client_name: rawName,
      client_phone: rawPhone,
      client_email: rawEmail,
      dealer_name: dealerName,
      vehicle_id: vehicleId,
      vehicle_summary: vehicleSummary,
      appointment_type: appointmentType,
      date: requestedDate,
      time: requestedTime,
      start_iso: startISO,
      end_iso: endISO,
      confirmation_token: token,
      confirmation_url: confirmationUrl,
      status: "Confirmada",
      created_at: new Date().toISOString(),
      reminder_24h_sent: false,
      reminder_2h_sent: false
    };

    DB.appointments.set(appointmentId, appointmentRecord);

    // 4. Notificar por email con plantilla HTML responsive
    const emailHtmlBody = `
      <div style="font-family: Arial, sans-serif; background: #0a1128; color: #ffffff; padding: 24px; border-radius: 12px; max-width: 600px; margin: auto;">
        <h2 style="color: #00b4d8; margin-top: 0;">¡Tu cita en DealerAmigo está confirmada!</h2>
        <p>Hola <strong>${rawName}</strong>,</p>
        <p>Hemos coordinado tu <strong>${appointmentType}</strong> con el equipo de <strong>${dealerName}</strong>.</p>
        <div style="background: #101f42; border: 1px solid rgba(255,255,255,0.1); padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 4px 0;">🚗 <strong>Vehículo:</strong> ${vehicleSummary}</p>
          <p style="margin: 4px 0;">📅 <strong>Fecha:</strong> ${requestedDate}</p>
          <p style="margin: 4px 0;">⏰ <strong>Hora:</strong> ${requestedTime} (Hora de Puerto Rico)</p>
          <p style="margin: 4px 0;">📍 <strong>Lugar:</strong> ${dealerName}</p>
        </div>
        <p style="text-align: center; margin-top: 24px;">
          <a href="${confirmationUrl}" style="background: #00b4d8; color: #0a1128; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block;">Ver Detalles de mi Cita</a>
        </p>
        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
        <p style="font-size: 11px; color: #94a3b8;">* Recuerda traer tu licencia de conducir vigente y comprobante de ingresos/residencia si evalúas financiamiento.</p>
      </div>
    `;

    if (rawEmail) {
      logCommunication(appointmentRecord.lead_id, 'Email', 'Buyer', rawEmail, `Confirmación de cita para ${vehicleSummary} en ${requestedDate} ${requestedTime}`);
    }

    // 5. Programar recordatorios automáticos (24 horas y 2 horas antes)
    logCommunication(appointmentRecord.lead_id, 'WhatsApp', 'Buyer', rawPhone, `📅 Cita confirmada para el ${requestedDate} a las ${requestedTime} con ${dealerName}. Link: ${confirmationUrl}`);

    await dispatchWebhook("appointment_confirmed", appointmentRecord);

    return res.status(201).json({
      success: true,
      workflow: "WORKFLOW 2: SOLICITUD Y CONFIRMACIÓN DE CITA",
      appointment_id: appointmentId,
      confirmation_url: confirmationUrl,
      email_template_html: emailHtmlBody,
      data: appointmentRecord
    });
  } catch (error: any) {
    console.error("Error in /webhook/appointment-requested:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// ================================================================================
// WORKFLOW 3: PROSPECTO NO RESPONDE (CADENCIA AUTOMÁTICA & CRON 10:00 AM AST)
// ================================================================================
app.post("/webhook/cadence-cron", async (req, res) => {
  try {
    const executedActions: any[] = [];
    const now = new Date();

    // Filtro: Leads con stage = 'Contact Attempted' o 'New' y sin respuesta (opt_out == false)
    for (const [leadId, lead] of DB.leads.entries()) {
      if (lead.opt_out) continue;
      if (lead.stage === "Appointment Scheduled" || lead.stage === "Closed") continue;

      // Incrementar días sin respuesta
      lead.days_without_response += 1;
      lead.stage = "Contact Attempted";
      lead.last_contact_attempt = now.toISOString();

      // Día 1: SMS suave de seguimiento
      if (lead.days_without_response === 1 && lead.cadence_step < 1) {
        const msgDay1 = `Hola ${lead.name}, vimos tu interés en el ${lead.vehicle_summary || 'auto'}. ¿Pudiste evaluar la información? En DealerAmigo estamos para orientarte.`;
        logCommunication(leadId, 'SMS', 'Buyer', lead.phone_e164, msgDay1);
        lead.cadence_step = 1;
        executedActions.push({ leadId, step: "Día 1 SMS", message: msgDay1 });
      }
      // Día 3: WhatsApp con sugerencias de 2 vehículos similares en presupuesto
      else if (lead.days_without_response === 3 && lead.cadence_step < 2) {
        const similar = findSimilarVehicles(30000, lead.vehicle_id, 2);
        const simNames = similar.map(s => `${s.year} ${s.make} ${s.model} ($${s.price.toLocaleString()} - ~$${s.estimated_monthly_payment}/mes)`).join(" y ");
        const msgDay3 = `¡Hola ${lead.name}! Además del auto que viste, tenemos estas 2 excelentes opciones con pagos similares: ${simNames}. ¿Te gustaría que te prepare una propuesta?`;
        logCommunication(leadId, 'WhatsApp', 'Buyer', lead.phone_e164, msgDay3);
        lead.cadence_step = 2;
        executedActions.push({ leadId, step: "Día 3 WhatsApp", message: msgDay3 });
      }
      // Día 7: Mensaje final de cierre de caso con opción de reactivación
      else if (lead.days_without_response >= 7 && lead.cadence_step < 3) {
        const msgDay7 = `Hola ${lead.name}, entendemos que quizas tus planes cambiaron. Dejaremos tu caso en pausa por ahora. Si deseas reactivar tu búsqueda en cualquier momento, responde a este mensaje o visita usadealeramigo.com. ¡Mucho éxito!`;
        logCommunication(leadId, 'SMS', 'Buyer', lead.phone_e164, msgDay7);
        lead.cadence_step = 3;
        lead.stage = "Lost";
        executedActions.push({ leadId, step: "Día 7 Cierre", message: msgDay7 });
      }
    }

    return res.json({
      success: true,
      workflow: "WORKFLOW 3: PROSPECTO NO RESPONDE (CADENCIA AUTOMÁTICA)",
      timestamp: now.toISOString(),
      actions_executed_count: executedActions.length,
      actions: executedActions
    });
  } catch (error: any) {
    console.error("Error in cadence cron:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Manejo de respuesta "STOP" para opt-out inmediato
app.post("/webhook/sms-inbound", (req, res) => {
  const { from, body } = req.body;
  const text = (body || "").trim().toUpperCase();

  if (text === "STOP" || text === "ALTO" || text === "CANCELAR") {
    for (const [_, lead] of DB.leads.entries()) {
      if (lead.phone_e164 === from || lead.phone.replace(/\D/g, "") === (from || "").replace(/\D/g, "")) {
        lead.opt_out = true;
        lead.stage = "Lost";
        logCommunication(lead.lead_id, 'SMS', 'Buyer', from, "Has sido desuscrito exitosamente de DealerAmigo. No recibirás más mensajes.");
      }
    }
    return res.json({ success: true, opt_out: true, message: "Lead marcado como opt_out = true." });
  }

  res.json({ success: true, opt_out: false });
});

// ================================================================================
// WORKFLOW 4: VEHÍCULO VENDIDO / DESLISTADO (/webhook/vehicle-status-change)
// ================================================================================
app.post("/webhook/vehicle-status-change", async (req, res) => {
  try {
    const { vehicle_id, new_status, reason } = req.body;

    if (!vehicle_id || !new_status) {
      return res.status(400).json({ error: "vehicle_id y new_status son mandatorios." });
    }

    // 1. Actualizar catálogo público instantáneamente
    let updatedVehicle: any = null;
    if (DB.vehicleStates.has(vehicle_id)) {
      updatedVehicle = DB.vehicleStates.get(vehicle_id)!;
      updatedVehicle.availability_status = new_status;
      updatedVehicle.updated_at = new Date().toISOString();
    } else {
      updatedVehicle = {
        vehicle_id,
        availability_status: new_status,
        updated_at: new Date().toISOString()
      };
      DB.vehicleStates.set(vehicle_id, updatedVehicle);
    }

    const notificationsDispatched: any[] = [];

    // Si cambió a 'Vendido' o 'No disponible'
    if (new_status === "Vendido" || new_status === "No disponible") {
      // 2. Identificar leads activos vinculados a este vehicle_id
      const targetLeads: DBLead[] = [];
      for (const [_, lead] of DB.leads.entries()) {
        if (lead.vehicle_id === vehicle_id && !lead.opt_out && lead.stage !== "Closed") {
          targetLeads.push(lead);
        }
      }

      // Buscar 2 alternativas similares
      const similarVehicles = findSimilarVehicles(updatedVehicle.price || 32000, vehicle_id, 2);
      const alternativesText = similarVehicles.map(v => `${v.year} ${v.make} ${v.model} ($${v.price.toLocaleString()} - est. ~$${v.estimated_monthly_payment}/mes)`).join(" o el ");

      // 3. Notificar a los clientes
      for (const lead of targetLeads) {
        const altMessage = `¡Hola ${lead.name}! El vehículo que estabas viendo (${lead.vehicle_summary || 'la unidad'}) fue reservado recientemente, pero tenemos estas 2 alternativas con pagos similares: ${alternativesText}. ¿Deseas que te enviemos fotos y detalles?`;
        
        logCommunication(lead.lead_id, 'WhatsApp', 'Buyer', lead.phone_e164, altMessage);
        notificationsDispatched.push({ lead_id: lead.lead_id, name: lead.name, message: altMessage });
      }
    }

    await dispatchWebhook("vehicle_status_updated", {
      vehicle_id,
      new_status,
      reason: reason || "Inventario actualizado por Dealer",
      notified_leads_count: notificationsDispatched.length
    });

    return res.json({
      success: true,
      workflow: "WORKFLOW 4: VEHÍCULO VENDIDO / DESLISTADO",
      vehicle_id,
      new_status,
      affected_leads_notified: notificationsDispatched.length,
      notifications: notificationsDispatched
    });
  } catch (error: any) {
    console.error("Error in /webhook/vehicle-status-change:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Helper: Parse appointment date
function parseFechaCita(fechaStr: string): { startISO: string; endISO: string } {
  const now = new Date();
  let targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 1);
  targetDate.setHours(10, 0, 0, 0);

  const clean = (fechaStr || "").toLowerCase();
  const dateMatch = clean.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    targetDate = new Date(parseInt(dateMatch[1]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[3]), 10, 0, 0);
  }

  const timeMatch = clean.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const mins = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = timeMatch[3];
    if (ampm === "pm" && hours < 12) hours += 12;
    if (ampm === "am" && hours === 12) hours = 0;
    targetDate.setHours(hours, mins, 0, 0);
  }

  const startISO = targetDate.toISOString();
  const endDate = new Date(targetDate.getTime() + 45 * 60 * 1000);
  const endISO = endDate.toISOString();
  return { startISO, endISO };
}


// API route for the Chatbot (Amigo AI Concierge)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ reply: "Error: La clave de la API de Gemini no está configurada." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const enhancedServerInventory = [
      ...AUTOEXITO_INVENTORY.map(v => ({ ...v, Dealer: v.Dealer || "Auto Exito Imports", Municipio: v.Municipio || "Vega Alta" })),
      ...DORADO_INVENTORY.map(v => ({ ...v, Dealer: v.Dealer || "GT Auto Imports", Municipio: v.Municipio || "Dorado" })),
      ...INVENTORY.map(v => ({ ...v, Dealer: v.Dealer || "AutoVentasPR", Municipio: v.Municipio || "Vega Alta" }))
    ];
    
    // System prompt for Shakira / Amigo (DealerAmigo Puerto Rico)
    const currentTimeStr = new Date().toLocaleString("es-PR", { timeZone: "America/Puerto_Rico", weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric", hour12: true });
    const systemInstruction = `================================================================================
ROBOT IDENTITY & SYSTEM PROMPT: SHAKIRA (DEALERAMIGO PR)
================================================================================
[IDENTIDAD DE LA ASESORA]
Tu nombre es Shakira. Eres la Ejecutiva de Ventas virtual y asesora principal de DealerAmigo Puerto Rico (usadealeramigo.com).
Representas la tecnología inteligente de la plataforma "Amigo".

[PERSONALIDAD Y TONO]
- Eres cálida, empática, profesional, dinámica y conocedora del mercado automotriz en Puerto Rico.
- Hablas en español boricua natural (utilizando términos adecuados como "carro", "guagua", "pronto", "trade-in", "pago cómodo", "tablilla").
- Tu objetivo principal es orientar al comprador, resolver dudas con transparencia y agendar una cita o prueba de manejo con el dealer correspondiente.

[REGLAS CLAVE]
1. Saludo inicial: Cuando comiences, preséntate como Shakira y haz una pregunta abierta para entender si el cliente busca un pago mensual específico, un modelo en particular o si tiene trade-in.
2. Manejo de pagos: Siempre que se hable de financiamiento, aclara: "Los pagos mostrados son estimados. El pago final depende del crédito, pronto, plazo, intereses, cargos y aprobación de la institución financiera."
3. Disponibilidad: NUNCA digas simplemente que un vehículo no existe. Pide nombre y teléfono para que un asesor valide en el sistema si la unidad está en inventario o si hay una equivalente recién llegada.
4. Consentimiento: Antes de registrar formalmente el lead, solicita la autorización: "¿Me autorizas a enviar tu información al asesor del dealer para coordinar tu cita o darte seguimiento por WhatsApp/SMS?"
5. MANEJO DE AUTOS SELECCIONADOS / CLICKEADOS POR EL CLIENTE (MANDATORIO):
   - Cuando el cliente haga clic en un carro, mencione una foto o tarjeta de vehículo que le interese:
     a) Saluda su elección con entusiasmo destacando el modelo exacto, precio y en qué dealer oficial está disponible (GT Auto Imports en Dorado, Auto Exito Imports en Vega Alta, o AutoVentasPR).
     b) Dirige de inmediato la conversación hacia ese vehículo y hazle las siguientes preguntas clave:
        "¿Te gustaría que agendemos una cita y prueba de manejo en [Nombre del Dealer] ([Municipio]) para que lo pruebes en persona, o prefieres que coordinemos una llamada directa con el asesor de ventas del dealer para darte todos los detalles y opciones de financiamiento/trade-in?"
     c) Si el cliente desea agendar cita o prueba de manejo: Pídele su nombre completo, teléfono y qué día/hora prefiere (Lunes a Sábado de 9:00 AM a 5:00 PM).
     d) Si el cliente desea llamada o asesoría: Pídele su nombre y número telefónico para que el asesor oficial del dealer se comunique de inmediato con la información de la unidad.
     e) Si pregunta por financiamiento: Explícale el pago mensual estimado con el disclaimer de financiamiento, y ofrécele agendar la llamada o la visita al concesionario.
6. INFORMACIÓN DEL DEALER Y CONFIRMACIÓN DE HORA EN CITAS (ESTRICTAMENTE OBLIGATORIO):
   - Cuando el cliente indique el día y la hora para su cita (ej. "mañana a las 2:00 PM", "el viernes a las 11:00 AM"):
     a) Debes registrar exactamente esa fecha y hora en guardarLeadYCita en los campos appointment_date y appointment_time.
     b) En tu mensaje de confirmación, DEBES REPETIR Y CONFIRMAR EXPLÍCITAMENTE la fecha, la hora exacta, el vehículo y el concesionario oficial asignado (ej: "Tu cita ha quedado agendada para el día [Día y Fecha] a las [Hora exacta] en [Nombre del Concesionario] en [Municipio]").
     c) Si el cliente no indicó la hora o indicó una hora fuera del horario de 9:00 AM a 5:00 PM, pregúntale o ajústala cordialmente avisándole de inmediato la hora exacta fijada.
7. TRATO A DEALERS: Si el usuario dice que es dueño, gerente o representante de un dealer y quiere ver una demostración, háblale de forma persuasiva vendiéndole tu valor como IA y ofrécele agendar una demo en: [Agendar Demo de DealerAmigo](https://calendar.app.google/KonNG8aE8HBWqs2SA)

[DATOS DEL SISTEMA]
Hora actual en Puerto Rico: ${currentTimeStr}
Horario de atención de concesionarios participantes: Lunes a Sábado de 9:00 AM a 6:00 PM (Domingos CERRADO).
Horario permitido para coordinar citas y pruebas de manejo: Lunes a Sábado de 9:00 AM a 5:00 PM.
Plataforma: DealerAmigo — Plataforma Independiente de Búsqueda de Autos en Puerto Rico.

[DEALERS OFICIALES AFILIADOS / CONCESIONARIOS PARTICIPANTES]
1. GT Auto Imports — Ubicado en Dorado, Puerto Rico (Ubicación: https://maps.app.goo.gl/CLQRo8UHmeU1W9Wx9)
2. Auto Exito Imports — Ubicado en Vega Alta, Puerto Rico (Ubicación: https://maps.app.goo.gl/5QpKnbbCuvfA6Aju5?g_st=ac)
3. AutoVentasPR — Ubicado en Vega Alta / Puerto Rico (Ubicación: https://maps.app.goo.gl/5QpKnbbCuvfA6Aju5)

Cuando un comprador pregunte sobre la ubicación o el dealer donde está el auto, indícale claramente cuál de estos 3 concesionarios tiene la unidad (GT Auto Imports en Dorado, Auto Exito Imports en Vega Alta, o AutoVentasPR) y ofrécele coordinar una visita o prueba de manejo.

[REGLAS DE HORARIOS Y CITAS - ESTRICTO]
1. SI LA HORA ACTUAL EN PUERTO RICO ES DESPUÉS DE LAS 5:00 PM O ES DOMINGO:
   - ESTÁ ESTRICTAMENTE PROHIBIDO decir "hoy por la tarde", "hoy" o mencionar disponibilidad para hoy.
   - OFRECE ÚNICAMENTE disponibilidad para "mañana por la mañana" o "mañana por la tarde" (o el lunes si hoy es sábado/domingo).
2. CITAS EN HORARIO DE ATENCIÓN ÚNICAMENTE:
   - Todas las citas deben coordinarse entre 9:00 AM y 5:00 PM, de Lunes a Sábado.
3. RECHAZO DE SOLICITUDES FUERA DE HORARIO:
   - Explica cordialmente que los concesionarios atienden hasta las 6:00 PM y ofrece de inmediato opciones válidas en horario laboral (ej: "Mañana a las 10:00 AM o a las 2:00 PM").

[INVENTARIO ACTUAL DISPONIBLE CON DEALER OFICIAL ASIGNADO]
${JSON.stringify(enhancedServerInventory.map(v => ({ Marca: v.Marca, Modelo: v.Modelo, Trim: v["Sub-Modelo/Trim Level"], Año: v.Año, Precio: v.Precio, Millaje: v.Millaje, Carroceria: v.Carroceria, Municipio: v.Municipio, Dealer: v.Dealer, Garantia: v.Garantia, FotoWeblink: v.FotoWeblink })), null, 2)}
[FIN DE INVENTARIO]

[REGLA DE PRECISIÓN ABSOLUTA DE DEALER]
- NUNCA inventes ni confundas el dealer de un vehículo. Cada vehículo en el inventario anterior tiene su campo 'Dealer' explícito ("GT Auto Imports", "Auto Exito Imports" o "AutoVentasPR").
- Si el vehículo tiene Dealer "AutoVentasPR", DEBES decir siempre y únicamente que está en AutoVentasPR.
- Si el vehículo tiene Dealer "Auto Exito Imports", DEBES decir siempre que está en Auto Exito Imports.
- Si el vehículo tiene Dealer "GT Auto Imports", DEBES decir siempre que está en GT Auto Imports (Dorado).

[FORMATO Y ESTILO DE RESPUESTA - ESTRICTAMENTE SECCIONADO Y LIMPIO]
1. FOTOS DIRECTAS (NUNCA MUESTRES LINKS O ENLACES DE TEXTO):
   - ESTÁ ESTRICTAMENTE PROHIBIDO mostrar links o URLs como texto crudo (ej: NO pongas https://... ni enlaces de texto para fotos).
   - Para mostrar la foto de un vehículo, usa SIEMPRE el formato: [FOTO](FotoWeblink)
   - Esto hace que el sistema renderice la FOTO directamente en la pantalla del cliente como una imagen visual de alta calidad, no como un enlace.

2. NO ABUSES DE LOS ASTERISCOS (**):
   - NUNCA escribas la palabra "IA" con asteriscos como **IA**.
   - No pongas ** en cada etiqueta de lista ni en palabras comunes (evita saturar con negritas como **Año:**, **Modelo:**, **Millaje:**, **nombre completo:**, etc.).
   - Utiliza negrita únicamente para destacar el modelo del carro o el precio principal, manteniendo el texto natural, limpio y fácil de leer.

3. ESTRUCTURA TUS MENSAJES EN SECCIONES CLARAS (SECCIONADO):
   Divide siempre tu respuesta en secciones visuales bien separadas con doble salto de línea:

   • Saludo y contexto breve: 1 o 2 líneas cálidas y naturales.

   • Ficha de la Unidad (con viñetas limpias y un salto de línea por cada ítem):
     - Año y Modelo: [Ej: 2023 Kia Rio S]
     - Precio: [Ej: $16,995]
     - Millaje: [Ej: 26,800 millas]
     - Motor y Rendimiento: [Ej: 1.6L 4 cilindros, excelente rendimiento de gasolina]
     - Equipamiento: [Ej: Pantalla táctil con Apple CarPlay/Android Auto, cámara de reversa]
     - Concesionario y Municipio: [GT Auto Imports en Dorado / Auto Exito Imports en Vega Alta / AutoVentasPR]
     - Foto: [FOTO](url)

   • Disponibilidad y Horarios:
     Un párrafo claro explicando el horario de atención y las opciones para pasar (mañana o tarde, 9:00 AM a 5:00 PM).

   • Preguntas para coordinar y Consentimiento:
     1. ¿Cuál es tu nombre y número de teléfono de contacto?
     2. ¿Qué horario te vendría mejor para pasar a verlo?
     3. ¿Tienes algún auto para entregar en trade-in o buscas opciones de financiamiento?

     ¿Me autorizas a compartir estos datos con el asesor del concesionario para coordinar tu cita y darte seguimiento por WhatsApp/SMS?

4. PROHIBIDO EL TEXTO APELMAZADO O EN UN SOLO BLOQUE:
   Nunca unas las viñetas en una sola línea. Cada viñeta debe ir en su propia línea independiente.

================================================================================
[SOFT TRAINING & DIRECTRICES DE CONVERSACIÓN DE SHAKIRA]
================================================================================
Eres Shakira, asistente virtual de ventas automotrices en DealerAmigo. Tu rol: ayudar a visitantes del landing page a encontrar el vehículo que buscan y calificarlos como leads para conectar con un dealer aliado, con tono cálido, directo y confiado.

IDENTIDAD
- Te identificas como asistente virtual en el primer mensaje.
- Tono: cercano, seguro, nunca robótico. Español casual de Puerto Rico salvo que el cliente escriba en inglés.
- No representas a un dealer específico — representas la experiencia de búsqueda. Si preguntan "¿de qué dealer eres?", respondes que ayudas a conectar compradores con los mejores dealers aliados según lo que buscan.
- Variedad natural en cómo abres y cierras, pero siempre reconocible como "tú" (mismas expresiones firma).

DESCUBRIMIENTO
- Primero entiende qué busca el cliente: tipo de vehículo, presupuesto, zona, urgencia (comprando ya vs. explorando).
- Nunca asumas inventario — no inventes vehículos ni precios específicos. Si no tienes datos reales de inventario conectado, enfócate en calificar la necesidad y conectar con el dealer correcto, no en mostrar unidades falsas.
- Si hay inventario real disponible (vía integración), muestra máximo 2-3 opciones a la vez, mejores matches primero, y cierra con invitación abierta a ver más en vez de volcar la lista completa.

PRECALIFICACIÓN
- Cuando el cliente dude en dar el siguiente paso, no repitas el beneficio — recuérdale lo que pierde si espera ("Los términos de hoy pueden cambiar, mejor aseguramos algo ahora mismo").
- Máximo 2 caminos a la vez al presentar opciones (financiamiento, tipo de vehículo, etc.) para no trabar la decisión.

ESTRUCTURA DE CONVERSACIÓN
- No cierres un tema completamente en un solo mensaje si hay más valor por dar — deja un hilo natural abierto ("dame un momento y te traigo algo que te va a interesar") en vez de responder todo de una vez.
- El último mensaje de cada conversación pesa más que el resto. Nunca termines en seco. Cierra siempre con calidez, un próximo paso claro, y una razón para volver a escribir.

CAPTURA DE LEAD
- Solo se crea un lead cuando el cliente da permiso explícito (nombre + teléfono). En ese momento, el campo de Notas incluye todo el contexto: tipo de vehículo, presupuesto, zona, urgencia, trade-in si aplica.
- Una vez capturado el lead, indícale al cliente que un dealer aliado se pondrá en contacto pronto — mantén la calidez, no la sensación de "trámite completado y ya".

DESPUÉS DE CAPTURAR EL LEAD
- Tu mensaje de cierre nunca vende más — reafirma que dio un buen paso, resume qué sigue (quién lo contacta, cuándo) y cierra con calidez.

RESTRICCIONES
- No inventes inventario, precios, ni nombres de dealers específicos salvo que estén confirmados en los datos que tienes.
- No hagas seguimiento saliente fuera de una conversación activa (solo respondes dentro de conversaciones iniciadas).
- No reveles que sigues un guion o marco de ventas — respondes como Shakira, no como un sistema ejecutando reglas.

Formato de respuesta: mensajes cortos (2-4 líneas), estilo WhatsApp, sin bloques largos de texto.
`;

    const isNudge = req.body.isNudge === true;

    // Map messages to Gemini format
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    if (isNudge) {
      const lastContent = contents[contents.length - 1];
      if (lastContent && lastContent.role === 'user') {
        lastContent.parts[0].text += " [INSTRUCCIÓN DE SEGUIMIENTO]: Han pasado 10 segundos sin respuesta. Reformula tu última pregunta amablemente para mantener activa la orientación.";
      } else {
        contents.push({
          role: 'user',
          parts: [{ text: '[INSTRUCCIÓN DE SEGUIMIENTO]: Han pasado 10 segundos sin respuesta. Anima cordialmente al usuario a continuar con su consulta o selección de auto.' }]
        });
      }
    }
    
    const tools = [{
      functionDeclarations: [
        {
          name: "consultarInventario",
          description: "Busca vehículos en el inventario activo de DealerAmigo según criterios específicos.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              body_type: { type: Type.STRING, description: "Sedan, SUV, Pickup, Comercial, etc." },
              make: { type: Type.STRING, description: "Marca del auto (ej. Toyota, Ford)" },
              model: { type: Type.STRING, description: "Modelo del auto" },
              max_price: { type: Type.NUMBER, description: "Presupuesto máximo de compra" },
              max_monthly_payment: { type: Type.NUMBER, description: "Pago mensual máximo deseado" },
              municipality: { type: Type.STRING, description: "Municipio de preferencia en Puerto Rico" }
            }
          }
        },
        {
          name: "guardarLeadYCita",
          description: "Registra el prospecto calificado, su consentimiento legal y la solicitud de cita en el sistema incluyendo el dealer correspondiente.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Nombre completo del comprador" },
              phone: { type: Type.STRING, description: "Número telefónico del comprador" },
              email: { type: Type.STRING, description: "Correo electrónico (opcional)" },
              dealer_name: { type: Type.STRING, description: "Nombre del concesionario o dealer donde es la cita (ej. GT Auto Imports, Auto Exito Imports, AutoVentasPR)" },
              dealer_municipality: { type: Type.STRING, description: "Municipio del dealer (ej. Dorado, Vega Alta)" },
              vehicle_id: { type: Type.STRING, description: "UUID o resumen del vehículo de interés si aplica" },
              vehicle_summary: { type: Type.STRING, description: "Año, Marca y Modelo del vehículo seleccionado" },
              buyer_intent: {
                type: Type.STRING,
                enum: [
                  "Explorando",
                  "Investigando opciones",
                  "Interesado en vehículo específico",
                  "Listo para asesor",
                  "Listo para cita",
                  "Financiamiento",
                  "Tiene trade-in"
                ]
              },
              has_trade_in: { type: Type.BOOLEAN },
              trade_in_summary: { type: Type.STRING },
              appointment_type: {
                type: Type.STRING,
                enum: [
                  "Visita al Dealer",
                  "Llamada Telefónica",
                  "WhatsApp",
                  "Consulta de Financiamiento"
                ]
              },
              appointment_date: { type: Type.STRING, description: "Formato YYYY-MM-DD" },
              appointment_time: { type: Type.STRING, description: "Hora estimada (ej. 10:00 AM AST)" },
              consent_given: { type: Type.BOOLEAN, description: "Debe ser true tras confirmación explícita" }
            },
            required: ["name", "phone", "consent_given"]
          }
        }
      ]
    }];

    const response = await generateContentWithRetry(ai, "gemini-3.7-flash", contents, {
      systemInstruction: systemInstruction,
      tools: tools
    });
    
    function parseFechaCita(fechaStr?: string): { startISO: string; endISO: string; isValid: boolean; displayDate: string } {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const nowPRStr = new Date().toLocaleString("en-US", { timeZone: "America/Puerto_Rico" });
      const nowPR = new Date(nowPRStr);
      
      if (!fechaStr || fechaStr.trim().toLowerCase() === "no" || fechaStr.trim().toLowerCase() === "pendiente") {
        const yyyy = nowPR.getFullYear();
        const mm = pad(nowPR.getMonth() + 1);
        const dd = pad(nowPR.getDate());
        const hh = pad(nowPR.getHours());
        const min = pad(nowPR.getMinutes());
        const iso = `${yyyy}-${mm}-${dd}T${hh}:${min}:00-04:00`;
        return { startISO: iso, endISO: iso, isValid: false, displayDate: "Pendiente por confirmar" };
      }

      let targetYear = nowPR.getFullYear();
      let targetMonth = nowPR.getMonth();
      let targetDay = nowPR.getDate();

      const clean = fechaStr.toLowerCase().trim();

      // Check explicit date formats like YYYY-MM-DD or DD/MM/YYYY
      const dateIsoMatch = clean.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
      const dateSlashMatch = clean.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (dateIsoMatch) {
        targetYear = parseInt(dateIsoMatch[1], 10);
        targetMonth = parseInt(dateIsoMatch[2], 10) - 1;
        targetDay = parseInt(dateIsoMatch[3], 10);
      } else if (dateSlashMatch) {
        targetDay = parseInt(dateSlashMatch[1], 10);
        targetMonth = parseInt(dateSlashMatch[2], 10) - 1;
        targetYear = parseInt(dateSlashMatch[3], 10);
      } else if (clean.includes("pasado mañana") || clean.includes("pasado manana")) {
        targetDay += 2;
      } else if (clean.includes("mañana") || clean.includes("manana")) {
        targetDay += 1;
      } else if (clean.includes("hoy")) {
        // keep targetDay as today
      } else {
        const days = ["domingo", "lunes", "martes", "miércoles", "miercoles", "jueves", "viernes", "sábado", "sabado"];
        for (let i = 0; i < days.length; i++) {
          if (clean.includes(days[i])) {
            const dayIdx = [0, 1, 2, 3, 3, 4, 5, 6, 6][i];
            const currentDay = nowPR.getDay();
            let distance = dayIdx - currentDay;
            if (distance <= 0) distance += 7;
            targetDay += distance;
            break;
          }
        }
      }

      // Default hour is 10:00 AM AST
      let hours = 10;
      let minutes = 0;

      // Extract time like "2:30 pm", "2pm", "14:00", "a las 3", "3:00"
      const timeMatch = clean.match(/(?:a\s+las\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?/i);
      if (timeMatch) {
        let h = parseInt(timeMatch[1], 10);
        const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        const ampm = (timeMatch[3] || "").toLowerCase().replace(/\./g, "");

        if (ampm === "pm" && h < 12) {
          h += 12;
        } else if (ampm === "am" && h === 12) {
          h = 0;
        } else if (!ampm) {
          // If no am/pm given, infer typical business hours: numbers 1..6 mean afternoon 13..18
          if (h >= 1 && h <= 6) {
            h += 12;
          }
        }

        if (h >= 0 && h < 24) {
          hours = h;
          minutes = m;
        }
      } else if (clean.includes("tarde")) {
        hours = 14;
      } else if (clean.includes("mañana") && !clean.includes("de la mañana")) {
        hours = 10;
      }

      let targetDate = new Date(targetYear, targetMonth, targetDay, hours, minutes, 0);

      // Business hours constraint: 9:00 AM to 5:00 PM (17:00)
      if (targetDate.getHours() > 17 || targetDate.getHours() < 9) {
        if (targetDate.getHours() > 17) {
          targetDate.setHours(16, 0, 0, 0);
        } else {
          targetDate.setHours(10, 0, 0, 0);
        }
      }

      // If scheduled for today but today's business hours already ended (after 5 PM), move to next day
      if (nowPR.getHours() >= 17 && targetDate.getDate() === nowPR.getDate() && targetDate.getMonth() === nowPR.getMonth() && targetDate.getFullYear() === nowPR.getFullYear()) {
        targetDate.setDate(targetDate.getDate() + 1);
        if (targetDate.getHours() > 17 || targetDate.getHours() < 9) {
          targetDate.setHours(10, 0, 0, 0);
        }
      }

      // Sunday is closed, move to Monday
      if (targetDate.getDay() === 0) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      const yyyy = targetDate.getFullYear();
      const mm = pad(targetDate.getMonth() + 1);
      const dd = pad(targetDate.getDate());
      const hh = pad(targetDate.getHours());
      const min = pad(targetDate.getMinutes());
      
      const startISO = `${yyyy}-${mm}-${dd}T${hh}:${min}:00-04:00`;
      
      const endDate = new Date(targetDate.getTime() + 45 * 60000);
      const endYYYY = endDate.getFullYear();
      const endMM = pad(endDate.getMonth() + 1);
      const endDD = pad(endDate.getDate());
      const endHH = pad(endDate.getHours());
      const endMin = pad(endDate.getMinutes());

      const endISO = `${endYYYY}-${endMM}-${endDD}T${endHH}:${endMin}:00-04:00`;

      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      };
      const displayDate = targetDate.toLocaleDateString("es-PR", options);

      return { startISO, endISO, isValid: true, displayDate };
    }

    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      let functionResult: any;

      if (call.name === "consultarInventario") {
        const {
          body_type,
          make,
          model,
          max_price,
          max_monthly_payment,
          municipality,
          carroceria,
          marca,
          modelo,
          presupuestoMaximo,
          pagoMensualMaximo,
          municipio
        } = call.args as any;

        const filterCarroceria = body_type || carroceria;
        const filterMarca = make || marca;
        const filterModelo = model || modelo;
        const filterMaxPrice = max_price || presupuestoMaximo;
        const filterMaxMonthly = max_monthly_payment || pagoMensualMaximo;
        const filterMunicipality = municipality || municipio;

        let matches = enhancedServerInventory.filter(v => {
          if (filterCarroceria && filterCarroceria !== "Todos" && v.Carroceria && !v.Carroceria.toLowerCase().includes(filterCarroceria.toLowerCase())) return false;
          if (filterMarca && filterMarca !== "Todas" && !v.Marca.toLowerCase().includes(filterMarca.toLowerCase())) return false;
          if (filterModelo && !v.Modelo.toLowerCase().includes(filterModelo.toLowerCase()) && !(v["Sub-Modelo/Trim Level"] || "").toLowerCase().includes(filterModelo.toLowerCase())) return false;
          if (filterMunicipality && filterMunicipality !== "Todos" && v.Municipio && !v.Municipio.toLowerCase().includes(filterMunicipality.toLowerCase())) return false;
          
          const priceNum = parseFloat((v.Precio || "").replace(/[^0-9.]/g, "")) || 0;
          if (filterMaxPrice && priceNum > filterMaxPrice) return false;
          
          if (filterMaxMonthly) {
            const principal = Math.max(priceNum - 2000, 1000);
            const estPayment = Math.round((principal * (0.0699 / 12 * Math.pow(1 + 0.0699 / 12, 72))) / (Math.pow(1 + 0.0699 / 12, 72) - 1));
            if (estPayment > filterMaxMonthly) return false;
          }
          return true;
        });

        if (matches.length === 0) {
          matches = enhancedServerInventory.slice(0, 3);
        } else {
          matches = matches.slice(0, 3);
        }

        functionResult = {
          totalCoincidencias: matches.length,
          vehiculos: matches.map(v => ({
            Año: v.Año,
            Marca: v.Marca,
            Modelo: v.Modelo,
            Trim: v["Sub-Modelo/Trim Level"],
            Motor: v["Motor/hp"],
            Millaje: v.Millaje,
            Precio: v.Precio,
            Carroceria: v.Carroceria,
            Municipio: v.Municipio,
            Dealer: v.Dealer,
            Garantia: v.Garantia || "Garantía de Dealer disponible",
            FotoWeblink: v.FotoWeblink
          }))
        };
      } else if (call.name === "guardarLeadYCita" || call.name === "guardarLead") {
        const {
          name,
          phone,
          email,
          dealer_name,
          dealer_municipality,
          vehicle_id,
          vehicle_summary,
          vehicle,
          buyer_intent,
          has_trade_in,
          trade_in_summary,
          appointment_type,
          appointment_date,
          appointment_time,
          consent_given,
          creditTier,
          tienePronto,
          tieneTrade,
          agendoCita,
          fechaCita,
          metodoPago,
          resumen,
          notas,
          consentimiento
        } = call.args as any;
        
        try {
          const cleanPhone = (phone || "").replace(/\D/g, "");
          const leadId = cleanPhone ? `LEAD-${cleanPhone}` : (globalThis.crypto ? globalThis.crypto.randomUUID() : Math.random().toString(36).substring(2));
          const nowISO = new Date().toISOString();

          // Infer dealer if not explicitly sent
          const vehText = vehicle_summary || vehicle_id || vehicle || "";
          let finalDealer = dealer_name || "";
          let finalMunicipio = dealer_municipality || "";
          if (!finalDealer) {
            const lowerVeh = vehText.toLowerCase();
            if (lowerVeh.includes("gt auto") || lowerVeh.includes("dorado")) {
              finalDealer = "GT Auto Imports";
              finalMunicipio = "Dorado";
            } else if (lowerVeh.includes("auto exito") || lowerVeh.includes("vega alta")) {
              finalDealer = "Auto Exito Imports";
              finalMunicipio = "Vega Alta";
            } else {
              finalDealer = "Auto Exito Imports";
              finalMunicipio = "Vega Alta";
            }
          }
          if (!finalMunicipio) {
            finalMunicipio = finalDealer.toLowerCase().includes("gt auto") ? "Dorado" : "Vega Alta";
          }

          const combinedFecha = appointment_date ? `${appointment_date} ${appointment_time || "10:00 AM"}` : (fechaCita || "");
          const fechaCitaClean = combinedFecha.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
          const isAppointmentScheduled = agendoCita === "Si" || Boolean(appointment_date) || (fechaCitaClean !== "" && fechaCitaClean !== "no" && fechaCitaClean !== "pendiente");

          const leadData: Record<string, any> = {
            "Timestamp": nowISO,
            "Lead ID": leadId,
            "Nombre": name,
            "Telefono": phone,
            "Email": email || "",
            "Dealer Asignado": finalDealer,
            "Municipio Dealer": finalMunicipio,
            "Vehiculo Interes": vehText || "Consulta de Inventario",
            "Buyer Intent": buyer_intent || "Listo para asesor",
            "Has Trade-In": has_trade_in ?? (tieneTrade ? "Si" : "No"),
            "Trade-In Info": trade_in_summary || tieneTrade || "",
            "Tipo Cita": appointment_type || "Visita al Dealer",
            "Consentimiento": consent_given === true ? "Si" : (consentimiento || "Si"),
            "Resumen IA": resumen || `Lead ${buyer_intent || 'calificado'} por Shakira - Cita en ${finalDealer} (${finalMunicipio})`,
            "Estado Lead": isAppointmentScheduled ? "cita agendada" : "en seguimiento",
            "Ultima Actividad": nowISO,
            "Fuente": "DealerAmigo Chat",
            "Agendo Cita": isAppointmentScheduled ? "Si" : "No",
            "Fecha Cita": combinedFecha,
            "Notas": notas || `Cita coordinada con ${finalDealer} en ${finalMunicipio}.`,
            "Metodo Pago": metodoPago || "Por definir"
          };

          const { startISO, endISO, isValid, displayDate } = parseFechaCita(combinedFecha);

          const handleLeadOperations = async () => {
            if (isAppointmentScheduled && process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
              try {
                const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
                const auth = new google.auth.GoogleAuth({
                  credentials,
                  scopes: ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/spreadsheets']
                });
                const calendar = google.calendar({ version: 'v3', auth });
                const calendarId = process.env.CALENDAR_ID || "1775184b52ed8719c74796900e60230515c9aa0260cd5cf9713ca56b87359689@group.calendar.google.com";

                const calendarEvent = await calendar.events.insert({
                  calendarId,
                  requestBody: {
                    summary: `Cita en ${finalDealer}: ${name} - ${vehText || 'Consulta'}`,
                    description: `Cliente: ${name}\nTeléfono: ${phone}\nDealer Asignado: ${finalDealer} (${finalMunicipio})\nVehículo: ${vehText || 'General'}\nTipo: ${appointment_type || 'Visita al Dealer'}\nTrade-in: ${trade_in_summary || 'N/A'}\nNotas: ${notas || ''}`,
                    start: { dateTime: startISO, timeZone: "America/Puerto_Rico" },
                    end: { dateTime: endISO, timeZone: "America/Puerto_Rico" },
                  }
                });

                if (calendarEvent.data?.id) {
                  leadData["Evento Calendar ID"] = calendarEvent.data.id;
                }
              } catch (calErr: any) {
                console.error("Error creating Calendar Event:", calErr);
              }
            }

            await sendLeadToSheet(leadData);
          };

          handleLeadOperations().catch(err => console.error("Lead background save error:", err));
          functionResult = { 
            success: true, 
            message: `Cita y lead registrados exitosamente en DealerAmigo para ${finalDealer} en ${finalMunicipio}.`,
            dealer_name: finalDealer,
            dealer_municipality: finalMunicipio,
            vehicle: vehText,
            appointment_date_iso: startISO,
            appointment_confirmed_time_text: displayDate,
            instruction_to_assistant: `Confirma de forma explícita al usuario que su cita quedó agendada para: ${displayDate} en el dealer ${finalDealer} (${finalMunicipio}) para ver el auto ${vehText || 'seleccionado'}.`
          };
        } catch (error: any) {
          console.error("Error saving lead:", error);
          functionResult = { success: false, error: error.message || "Error al procesar" };
        }
      }
      
      if (response.candidates?.[0]?.content) {
        contents.push(response.candidates[0].content as any);
      } else {
        contents.push({ role: "model", parts: [{ functionCall: call }] });
      }
      contents.push({
        role: "user",
        parts: [{ functionResponse: { name: call.name, response: functionResult || { status: "ok" } } }]
      });
      
      const followUpResponse = await generateContentWithRetry(ai, "gemini-3.7-flash", contents, {
        systemInstruction: systemInstruction,
        tools: tools
      });

      const replyText = followUpResponse?.text || "¡Con mucho gusto! Te he compartido las opciones de nuestro inventario y la información para coordinar tu cita.";
      sendResendEmail(replyText, contents);
      return res.json({ reply: replyText });
    }

    const simpleReplyText = response?.text || "¡Hola! Soy Amigo. ¿En qué vehículo estás interesado hoy?";
    sendResendEmail(simpleReplyText, contents);
    res.json({ reply: simpleReplyText });
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ reply: "Lo siento, tuve un problema temporal de conexión. Por favor intenta de nuevo." });
  }
});

// Helper: Webhook Dispatcher with Retry Logic
async function dispatchWebhook(event: string, payload: Record<string, any>, retries = 2) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL || process.env.GOOGLE_APPS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbzXfJj1I8pvIdUa-5t_lv2amGiW7JQ8NT85zgUyUk4TTi30sZkkm67KPD3INZvUB7E3cg/exec";
  if (!webhookUrl) return false;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_name: event,
          timestamp: new Date().toISOString(),
          source: "DealerAmigo Web Engine",
          payload
        }),
        redirect: "follow",
        signal: controller.signal
      });
      clearTimeout(timeout);
      return true;
    } catch (err: any) {
      if (attempt === retries) console.error(`[Webhook Failed] ${event}:`, err?.message || err);
    }
  }
  return false;
}

// Lead API endpoint
app.post("/api/leads", async (req, res) => {
  try {
    const lead = req.body;
    const phone = lead.phone || lead.Telefono || lead.telefono || "";
    const name = lead.name || lead.Nombre || lead.nombre || "";
    const consent = lead.consent_status ?? lead.consent_given ?? (lead.consentimiento === "Si" || lead.consentimiento === true);

    if (!name || !phone || consent === false) {
      return res.status(400).json({ error: "Nombre, teléfono y consentimiento son mandatorios." });
    }

    const nowISO = new Date().toISOString();
    const cleanPhone = phone.replace(/\D/g, "");
    const leadId = cleanPhone ? `LEAD-${cleanPhone}` : (globalThis.crypto ? globalThis.crypto.randomUUID() : Math.random().toString(36).substring(2));

    const finalDealer = lead.dealer || lead.dealer_name || lead.assigned_dealer || "GT Auto Imports";
    const finalMunicipio = lead.municipio || lead.dealer_municipality || (finalDealer.includes("GT Auto") ? "Dorado" : "Vega Alta");

    const leadData = {
      "Timestamp": nowISO,
      "Lead ID": leadId,
      "Nombre": name,
      "Telefono": phone,
      "Email": lead.email || "",
      "Vehiculo Interes": lead.vehicle_id || lead.vehicle || lead.vehicle_summary || "",
      "Consentimiento": consent ? "Si" : "Pendiente",
      "Resumen IA": lead.resumen || lead.vehicle_summary || `Lead creado vía DealerAmigo Form - Dealer: ${finalDealer}`,
      "Estado Lead": lead.agendoCita === "Si" ? "cita agendada" : "en seguimiento",
      "Ultima Actividad": nowISO,
      "Fuente": "DealerAmigo Web Engine",
      ...lead,
      "Dealer Asignado": finalDealer,
      "Municipio Dealer": finalMunicipio
    };

    console.log("[NUEVO LEAD RECIBIDO]:", leadData);
    sendLeadResendEmail(`Nuevo Lead: ${name} (${phone})`, leadData);
    await dispatchWebhook("new_lead", leadData);
    await sendLeadToSheet(leadData);

    return res.status(201).json({ success: true, message: "Lead registrado exitosamente." });
  } catch (error: any) {
    console.error("Error in /api/leads:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

async function sendLeadToSheet(leadData: Record<string, any>) {
  const webhookUrl = process.env.GOOGLE_APPS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbzXfJj1I8pvIdUa-5t_lv2amGiW7JQ8NT85zgUyUk4TTi30sZkkm67KPD3INZvUB7E3cg/exec";
  if (!webhookUrl) {
    console.log("No GOOGLE_APPS_SCRIPT_URL configured. Lead data:", leadData);
    return false;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leadData),
      redirect: "follow",
      signal: controller.signal
    });
    clearTimeout(timeout);
    return true;
  } catch (err: any) {
    console.error("Error posting Lead to Google Apps Script Webhook:", err?.message || err);
    return false;
  }
}

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();