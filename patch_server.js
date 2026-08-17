const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `contents.push({ role: "model", parts: [{ functionCall: call }] });`,
  `if (response.candidates?.[0]?.content) {
          contents.push(response.candidates[0].content);
        } else {
          contents.push({ role: "model", parts: [{ functionCall: call }] });
        }`
);

fs.writeFileSync('server.ts', code);
