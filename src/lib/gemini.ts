export type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

export type GeminiMessage = {
  role: "user" | "model";
  parts: GeminiPart[];
};

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.5-pro",
];

export async function callGemini(
  promptOrParts: string | GeminiPart[],
  systemInstruction?: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY belum dikonfigurasi di environment variable.");
  }

  const parts: GeminiPart[] =
    typeof promptOrParts === "string" ? [{ text: promptOrParts }] : promptOrParts;

  const body: any = {
    contents: [
      {
        role: "user",
        parts: parts,
      },
    ],
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  // Generation config: sharp, fast, with thinking budget disabled for instant TTFT
  body.generationConfig = {
    temperature: 0.65,
    topP: 0.95,
    thinkingConfig: {
      thinkingBudget: 0,
    },
  };

  let lastError = "";

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        const usage = data?.usageMetadata;
        // Record telemetry asynchronously
        import("./ai-telemetry").then(({ recordAiUsage }) => {
          recordAiUsage(
            model,
            usage?.promptTokenCount || 0,
            usage?.candidatesTokenCount || 0,
            false
          );
        }).catch(() => {});

        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }

      const errorText = await res.text();
      if (res.status === 429) {
        import("./ai-telemetry").then(({ recordAiUsage }) => {
          recordAiUsage(model, 0, 0, true);
        }).catch(() => {});
      }
      lastError = `[${model}] ${res.status}: ${errorText}`;
      console.warn(`Gemini call failed with ${model}:`, res.status, errorText);

      // If 400 Bad Request (e.g. invalid argument / unsupported mime), don't keep cycling identical bad payload
      if (res.status === 400) {
        throw new Error(`Gemini API Error (400): ${errorText}`);
      }
    } catch (err: any) {
      if (err.message?.includes("Gemini API Error (400)")) {
        throw err;
      }
      lastError = err.message || String(err);
    }
  }

  if (lastError.includes("429") || lastError.includes("RESOURCE_EXHAUSTED")) {
    throw new Error("Layanan AI sedang sibuk (kuota permintaan tercapai). Mohon tunggu beberapa detik lalu coba lagi.");
  }

  throw new Error(`Gagal menghubungi layanan AI: ${lastError}`);
}

export async function callGeminiChat(
  history: GeminiMessage[],
  systemInstruction?: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY belum dikonfigurasi.");
  }

  const body: any = {
    contents: history,
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  // Generation config: sharp, fast, with thinking budget disabled for instant TTFT
  body.generationConfig = {
    temperature: 0.65,
    topP: 0.95,
    thinkingConfig: {
      thinkingBudget: 0,
    },
  };

  let lastError = "";

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        const usage = data?.usageMetadata;
        // Record telemetry asynchronously
        import("./ai-telemetry").then(({ recordAiUsage }) => {
          recordAiUsage(
            model,
            usage?.promptTokenCount || 0,
            usage?.candidatesTokenCount || 0,
            false
          );
        }).catch(() => {});

        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }

      const errorText = await res.text();
      if (res.status === 429) {
        import("./ai-telemetry").then(({ recordAiUsage }) => {
          recordAiUsage(model, 0, 0, true);
        }).catch(() => {});
      }
      lastError = `[${model}] ${res.status}: ${errorText}`;
      console.warn(`Gemini chat failed with ${model}:`, res.status, errorText);

      if (res.status === 400) {
        throw new Error(`Gemini Chat Error (400): ${errorText}`);
      }
    } catch (err: any) {
      if (err.message?.includes("Gemini Chat Error (400)")) {
        throw err;
      }
      lastError = err.message || String(err);
    }
  }

  if (lastError.includes("429") || lastError.includes("RESOURCE_EXHAUSTED")) {
    throw new Error("Layanan AI sedang sibuk (kuota permintaan tercapai). Mohon tunggu beberapa detik lalu coba lagi.");
  }

  throw new Error(`Gagal menghubungi chatbot AI: ${lastError}`);
}

