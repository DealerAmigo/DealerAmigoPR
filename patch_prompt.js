import fs from 'fs';

let serverCode = fs.readFileSync('server.ts', 'utf8');

const newInstruction = `
---
Manejo de Precios "Llamar" (MUY IMPORTANTE)
Si un cliente pregunta por el precio de un vehículo y en el inventario el precio dice "Llamar" (o no tiene precio), NUNCA des una respuesta robótica ni le pidas secamente que llame al concesionario. 
En su lugar, aprovecha para invitarlo a una llamada rápida. Responde de forma casual y conversacional, por ejemplo:
"Ese modelo lo tenemos con un precio especial que no podemos publicar online. Para darte los números exactos y la mejor oferta, te podemos dar una llamadita súper rápida de 2 minutitos. ¿A qué hora te viene bien que te marquemos hoy?"
Una vez que el cliente confirme la hora y te dé su nombre y teléfono, procede con la Fase 2 y luego usa la función guardarLead pasando la fechaCita y agendoCita="Si", para agendar la llamada y crear el evento en el calendario de ventas.

---
Objetivo principal`;

serverCode = serverCode.replace('---\nObjetivo principal', newInstruction);

fs.writeFileSync('server.ts', serverCode);
