const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const retryFn = `
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
      
      // If it's a rate limit or service unavailable, and we haven't exhausted retries
      if (attempt < maxRetries && (status === 503 || status === 429 || errorCode === 503 || errorCode === 429)) {
        const delayMs = attempt * 2000; // 2s, 4s, 6s...
        console.warn(\`[AI API] Temporal Error (\${status || errorCode}). Intento \${attempt} fallido. Reintentando en \${delayMs}ms...\`);
        await sleep(delayMs);
      } else {
        throw error;
      }
    }
  }
}
`;

serverCode = serverCode.replace('const PORT = process.env.PORT || 3000;', retryFn + '\nconst PORT = process.env.PORT || 3000;');

serverCode = serverCode.replace(
  'const response = await ai.models.generateContent({',
  'const response = await generateContentWithRetry(ai, "gemini-2.5-flash", contents, {\n        systemInstruction: systemInstruction,\n        tools: tools\n      });\n      //'
);
serverCode = serverCode.replace('      model: "gemini-2.5-flash",', '');
serverCode = serverCode.replace('      contents: contents,', '');
serverCode = serverCode.replace('      config: {', '');
serverCode = serverCode.replace('        systemInstruction: systemInstruction,', '');
serverCode = serverCode.replace('        tools: tools', '');
serverCode = serverCode.replace('      }', '');

// Since the previous replacements might mess up formatting, I'll use a more precise regex replacement for both calls.
