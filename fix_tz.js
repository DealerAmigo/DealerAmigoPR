import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

// We need to rewrite parseFechaCita to explicitly use -04:00 timezone.
const oldParse = `    function parseFechaCita(fechaStr?: string): { start: Date; end: Date; isValid: boolean } {
  if (!fechaStr || fechaStr.trim().toLowerCase() === "no" || fechaStr.trim().toLowerCase() === "pendiente") {
    return { start: new Date(), end: new Date(), isValid: false };
  }

  const now = new Date();
  let targetDate = new Date(now);
  const clean = fechaStr.toLowerCase().trim();

  // Handle relative days
  if (clean.includes("mañana") || clean.includes("manana")) {
    targetDate.setDate(now.getDate() + 1);
  } else if (clean.includes("pasado mañana") || clean.includes("pasado manana")) {
    targetDate.setDate(now.getDate() + 2);
  } else if (clean.includes("hoy")) {
    // keep today
  } else {
    // Days of the week in Spanish
    const days = ["domingo", "lunes", "martes", "miércoles", "miercoles", "jueves", "viernes", "sábado", "sabado"];
    for (let i = 0; i < days.length; i++) {
      if (clean.includes(days[i])) {
        const targetDay = i > 4 ? (i === 5 || i === 6 ? 3 : 6) : (i === 3 || i === 4 ? 3 : i);
        const dayIdx = [0, 1, 2, 3, 3, 4, 5, 6, 6][i];
        const currentDay = now.getDay();
        let distance = dayIdx - currentDay;
        if (distance <= 0) distance += 7;
        targetDate.setDate(now.getDate() + distance);
        break;
      }
    }
  }

  // Parse time (e.g. "10:00 AM", "2:30 PM", "14:00", "10am", "3pm")
  let hours = 10; // default 10 AM
  let minutes = 0;

  const timeMatch = clean.match(/(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)?/);
  if (timeMatch) {
    let h = parseInt(timeMatch[1], 10);
    const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = timeMatch[3];

    if (ampm === "pm" && h < 12) h += 12;
    if (ampm === "am" && h === 12) h = 0;
    if (h >= 0 && h < 24) {
      hours = h;
      minutes = m;
    }
  } else {
    // If no explicit time is found but there's "tarde", default to 2:00 PM
    if (clean.includes("tarde") || clean.includes("taree")) {
      hours = 14; 
    }
  }

  // Check if string is direct parseable date like YYYY-MM-DD
  const directParse = new Date(fechaStr);
  if (!isNaN(directParse.getTime()) && directParse.getFullYear() > 2020) {
    targetDate = directParse;
  }

  targetDate.setHours(hours, minutes, 0, 0);

  const endDate = new Date(targetDate);
  endDate.setHours(targetDate.getHours() + 1);

  return { start: targetDate, end: endDate, isValid: true };
}`;

const newParse = `    function parseFechaCita(fechaStr?: string): { startISO: string; endISO: string; isValid: boolean } {
  if (!fechaStr || fechaStr.trim().toLowerCase() === "no" || fechaStr.trim().toLowerCase() === "pendiente") {
    return { startISO: new Date().toISOString(), endISO: new Date().toISOString(), isValid: false };
  }

  // We operate in Puerto Rico time for the logic to avoid UTC offset issues
  // Get current date in PR time
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Puerto_Rico" }));
  let targetDate = new Date(now);
  const clean = fechaStr.toLowerCase().trim();

  // Handle relative days
  if (clean.includes("mañana") || clean.includes("manana")) {
    targetDate.setDate(now.getDate() + 1);
  } else if (clean.includes("pasado mañana") || clean.includes("pasado manana")) {
    targetDate.setDate(now.getDate() + 2);
  } else if (clean.includes("hoy")) {
    // keep today
  } else {
    // Days of the week in Spanish
    const days = ["domingo", "lunes", "martes", "miércoles", "miercoles", "jueves", "viernes", "sábado", "sabado"];
    for (let i = 0; i < days.length; i++) {
      if (clean.includes(days[i])) {
        const dayIdx = [0, 1, 2, 3, 3, 4, 5, 6, 6][i];
        const currentDay = now.getDay();
        let distance = dayIdx - currentDay;
        if (distance <= 0) distance += 7;
        targetDate.setDate(now.getDate() + distance);
        break;
      }
    }
  }

  // Parse time (e.g. "10:00 AM", "2:30 PM", "14:00", "10am", "3pm")
  let hours = 10; // default 10 AM
  let minutes = 0;

  const timeMatch = clean.match(/(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)?/);
  if (timeMatch) {
    let h = parseInt(timeMatch[1], 10);
    const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = timeMatch[3];

    if (ampm === "pm" && h < 12) h += 12;
    if (ampm === "am" && h === 12) h = 0;
    if (h >= 0 && h < 24) {
      hours = h;
      minutes = m;
    }
  } else {
    // If no explicit time is found but there's "tarde", default to 2:00 PM
    if (clean.includes("tarde") || clean.includes("taree")) {
      hours = 14; 
    }
  }

  // Check if string is direct parseable date like YYYY-MM-DD
  const directParse = new Date(fechaStr);
  if (!isNaN(directParse.getTime()) && directParse.getFullYear() > 2020) {
    // Re-instantiate in PR time if possible, or just use the parsed one if valid
    targetDate = new Date(directParse.toLocaleString("en-US", { timeZone: "America/Puerto_Rico" }));
  }

  // Construct ISO string with -04:00 offset
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = targetDate.getFullYear();
  const mm = pad(targetDate.getMonth() + 1);
  const dd = pad(targetDate.getDate());
  const hh = pad(hours);
  const min = pad(minutes);
  
  const startISO = \`\${yyyy}-\${mm}-\${dd}T\${hh}:\${min}:00-04:00\`;
  
  // Calculate end time
  let endHours = hours + 1;
  let endDay = targetDate.getDate();
  if (endHours >= 24) {
     endHours = 0;
     endDay += 1;
  }
  const edd = pad(endDay);
  const ehh = pad(endHours);
  const endISO = \`\${yyyy}-\${mm}-\${edd}T\${ehh}:\${min}:00-04:00\`;

  return { startISO, endISO, isValid: true };
}`;

code = code.replace(oldParse, newParse);

// Update usages of parseFechaCita
code = code.replace(/const { start: startTime, end: endTime } = parseFechaCita\(fechaCita\);/, 'const { startISO, endISO } = parseFechaCita(fechaCita);');
code = code.replace(/fechaCita \|\| startTime\.toLocaleString\("es-PR"\)/, 'fechaCita || startISO');
code = code.replace(/console\.log\(\`Creating Calendar Event for \$\{name\} at \$\{startTime\.toISOString\(\)\}\.\.\.\`\);/, 'console.log(`Creating Calendar Event for ${name} at ${startISO}...`);');
code = code.replace(/start: \{ dateTime: startTime\.toISOString\(\) \}/, 'start: { dateTime: startISO, timeZone: "America/Puerto_Rico" }');
code = code.replace(/end: \{ dateTime: endTime\.toISOString\(\) \}/, 'end: { dateTime: endISO, timeZone: "America/Puerto_Rico" }');

fs.writeFileSync('server.ts', code);
