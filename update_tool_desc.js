import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const oldDesc = 'description: "Ejecuta inmediatamente la captura y guardado del Lead en la Hoja de Ventas y el Calendario tras obtener el consentimiento SMS o agendar cita.",';
const newDesc = 'description: "¡MANDATORIO! Llama a esta función inmediatamente en 2 casos: 1) Cuando el cliente acepta recibir SMS. 2) Cuando el cliente confirma el día y hora de su cita (para agendar en el calendario). No respondas con texto sin llamar a esta herramienta en esos momentos.",';

code = code.replace(oldDesc, newDesc);
fs.writeFileSync('server.ts', code);
