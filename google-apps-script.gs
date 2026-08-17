/**
 * Shakira Autos PR - Google Apps Script (Code.gs)
 * 
 * Instrucciones de Instalación:
 * 1. Abre tu hoja de Google Sheets (Lead Data Sheet).
 * 2. Ve al menú superior: Extensiones > Apps Script.
 * 3. Borra cualquier código existente y pega este archivo completo.
 * 4. Guarda y haz clic en "Desplegar" > "Nuevo despliegue" > selecciona "Aplicación web".
 * 5. Configura:
 *    - Ejecutar como: Tu cuenta (Yo)
 *    - Quién tiene acceso: Cualquier persona (Anyone)
 * 6. Copia la URL del Webhook generada para conectarla a tu web app (GOOGLE_APPS_SCRIPT_URL).
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Determinar a qué pestaña (tab) enviar los datos
    var sheetName = "Leads_Cotizaciones";
    
    if (data["Fuente"] === "DealerRegistration") {
      sheetName = "Dealers_Registrados";
    } else if (data["Fuente"] === "AppointmentBooking" || data["Estado Lead"] === "cita agendada") {
      sheetName = "Citas_Agendadas";
    }

    var sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
    }
    
    // Si la hoja está vacía, creamos los encabezados exactos dependiendo del tipo de hoja
    if (sheet.getLastRow() === 0) {
      if (sheetName === "Dealers_Registrados") {
         sheet.appendRow([
           "Timestamp", "Nombre Legal", "Nombre Comercial", "Teléfono", "Email", "Contacto",
           "Puesto", "Municipio", "Inventario Estimado", "Método Sync", "Licencia"
         ]);
      } else {
         sheet.appendRow([
           "Timestamp", "Lead ID", "Nombre", "Telefono", "Email", "Vehiculo Interes",
           "Consentimiento", "Resumen IA", "Estado Lead", "Ultima Actividad", "Fuente",
           "Agendo Cita", "Fecha Cita", "Notas", "Metodo Pago", "Reactivacion Enviada",
           "Reactivacion Fecha", "Clase Interes", "Intencion", "Handoff Enviado",
           "Handoff Fecha", "Evento Calendar ID", "Idempotency Key", "Ultimo Mensaje Entrante",
           "Canal Preferido", "Opt-Out", "Twilio SID"
         ]);
      }
    }

    var existingRowIndex = -1;
    var row = [];

    // Mapear datos según la hoja
    if (sheetName === "Dealers_Registrados") {
      row = [
        data["Timestamp"] || new Date().toISOString(),
        data["nombreLegal"] || "",
        data["nombreComercial"] || "",
        data["phone"] || data["telefono"] || "",
        data["email"] || "",
        data["name"] || data["personaContacto"] || "",
        data["puesto"] || "",
        data["municipio"] || data["pueblo"] || "",
        data["inventarioEstimado"] || "",
        data["metodoSync"] || "",
        data["licenciaVigente"] || ""
      ];
      
      // Buscar si existe (por nombre de negocio o email)
      var values = sheet.getDataRange().getValues();
      for (var i = 1; i < values.length; i++) {
        var rowEmail = values[i][4] ? values[i][4].toString() : "";
        if (data["email"] && rowEmail === data["email"]) {
          existingRowIndex = i + 1;
          break;
        }
      }
    } else {
      var leadId = data["Lead ID"] || "";
      var phone = data["Telefono"] || data["phone"] || "";
      var cleanPhone = phone ? phone.toString().replace(/\D/g, "") : "";

      row = [
        data["Timestamp"] || new Date().toISOString(),
        leadId || Utilities.getUuid(),
        data["Nombre"] || data["name"] || "",
        phone,
        data["Email"] || data["email"] || "",
        data["Vehiculo Interes"] || data["vehiculo_summary"] || "",
        data["Consentimiento"] || "Si",
        data["Resumen IA"] || "",
        data["Estado Lead"] || (sheetName === "Citas_Agendadas" ? "cita agendada" : "en seguimiento"),
        data["Ultima Actividad"] || new Date().toISOString(),
        data["Fuente"] || "Web Chat",
        data["Agendo Cita"] || (sheetName === "Citas_Agendadas" ? "Si" : "No"),
        data["Fecha Cita"] || data["fecha"] || "",
        data["Notas"] || data["notas"] || "",
        data["Metodo Pago"] || "Por definir",
        data["Reactivacion Enviada"] || "No",
        data["Reactivacion Fecha"] || "",
        data["Clase Interes"] || "",
        data["Intencion"] || "",
        data["Handoff Enviado"] || "No",
        data["Handoff Fecha"] || "",
        data["Evento Calendar ID"] || "",
        data["Idempotency Key"] || leadId || Utilities.getUuid(),
        data["Ultimo Mensaje Entrante"] || "",
        data["Canal Preferido"] || "Web Chat",
        data["Opt-Out"] || "No",
        data["Twilio SID"] || ""
      ];

      // Buscar si la fila ya existe para actualizarla en lugar de duplicarla
      var values = sheet.getDataRange().getValues();
      for (var i = 1; i < values.length; i++) {
        var rowLeadId = values[i][1] ? values[i][1].toString() : "";
        var rowPhone = values[i][3] ? values[i][3].toString().replace(/\D/g, "") : "";

        if ((leadId && rowLeadId === leadId) || (cleanPhone && rowPhone && rowPhone === cleanPhone)) {
          existingRowIndex = i + 1; // 1-indexed para la hoja de cálculo
          break;
        }
      }
      
      // Preservar Evento Calendar ID anterior si el nuevo viene vacío
      if (existingRowIndex > 0) {
        if (!row[21] && values[existingRowIndex - 1][21]) {
          row[21] = values[existingRowIndex - 1][21];
        }
      }
    }

    if (existingRowIndex > 0) {
      sheet.getRange(existingRowIndex, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    // Enviar correo organizado a willquisnos@gmail.com
    var emailRecipient = "willquisnos@gmail.com";
    var isUpdate = existingRowIndex > 0;
    var emailSubject = (isUpdate ? "🔄 ACTUALIZADO: " : "🚨 NUEVO: ") + (data["Nombre"] || data["name"] || data["nombreLegal"] || "Cliente/Dealer");
    
    var emailBody = "Se ha " + (isUpdate ? "actualizado" : "capturado") + " un registro en DealerAmigo.\n\n" +
      "=========================================\n" +
      "TAB ASIGNADO: " + sheetName + "\n" +
      "=========================================\n\n";
      
    if (sheetName === "Dealers_Registrados") {
      emailBody += "Dealer: " + (data["nombreLegal"] || "No provisto") + "\n" +
                   "Contacto: " + (data["personaContacto"] || "No provisto") + "\n" +
                   "Teléfono: " + (data["telefono"] || "No provisto") + "\n";
    } else {
      emailBody += "👤 DETALLES DEL CLIENTE\n" +
        "Nombre: " + (row[2] || "No provisto") + "\n" +
        "Teléfono: " + (row[3] || "No provisto") + "\n" +
        "Email: " + (row[4] || "No provisto") + "\n\n" +
        "🚗 INTERÉS Y CITA\n" +
        "Vehículo de Interés: " + (row[5] || "No especificado") + "\n" +
        "Agendó Cita: " + (row[11] || "No") + "\n" +
        "Fecha Cita: " + (row[12] || "Pendiente") + "\n\n" +
        "📝 NOTAS E INFO\n" +
        (row[7] || "Sin resumen de IA.") + "\n" +
        (row[13] ? "Notas extras: " + row[13] : "");
    }

    MailApp.sendEmail({
      to: emailRecipient,
      subject: emailSubject,
      body: emailBody
    });

    return ContentService.createTextOutput(JSON.stringify({ status: "success", rowUpdated: isUpdate, sheet: sheetName }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
