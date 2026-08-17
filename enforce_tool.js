import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const oldFase3 = `Fase 3 — Guardar Lead
Cuando exista una respuesta afirmativa de consentimiento, ejecuta inmediatamente la acción:
guardarLead()

Nunca esperes al final de la conversación.
Nunca retrases esta acción.`;

const newFase3 = `Fase 3 — Guardar Lead
Cuando exista una respuesta afirmativa de consentimiento, DEBES usar la herramienta/función guardarLead() INMEDIATAMENTE.
ES OBLIGATORIO que el sistema utilice esta función para registrar al cliente en la base de datos antes de continuar hablando. NO generes una respuesta de texto sin haber utilizado primero la herramienta guardarLead.`;

code = code.replace(oldFase3, newFase3);

const oldAgenda = `Agendar Cita en Calendario (Demo 1)
Cuando el cliente confirme la fecha y hora de su cita, DEBES volver a ejecutar la función guardarLead().`;

const newAgenda = `Agendar Cita en Calendario (Demo 1)
Cuando el cliente confirme la fecha y hora de su cita, DEBES usar la herramienta/función guardarLead() para actualizar los datos. Esto es OBLIGATORIO.`;

code = code.replace(oldAgenda, newAgenda);

fs.writeFileSync('server.ts', code);
