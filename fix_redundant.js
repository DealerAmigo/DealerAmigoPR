import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

// The tool array starts with { name: "guardarLead", ... }, then { name: "create_lead_appointment", ... }
// We can remove create_lead_appointment.

code = code.replace(/,\s*\{\s*name:\s*"create_lead_appointment"[\s\S]*?\}\s*\]/, '\n      ]');
fs.writeFileSync('server.ts', code);
