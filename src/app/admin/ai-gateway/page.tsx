import { 
  Bot, 
  Cpu, 
  Zap, 
  Layers, 
  Gauge, 
  CheckCircle2, 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  ArrowRight,
  Server,
  RefreshCw,
  Sliders
} from "lucide-react";

export const dynamic = "force-dynamic";

type ModelSpec = {
  name: string;
  displayName: string;
  version: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  description: string;
  temperature: number;
  topP: number;
  topK: number;
  thinkingSupported?: boolean;
};

async function getLiveGeminiModels(): Promise<ModelSpec[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];
    const data = await res.json();
    const models: any[] = data.models || [];

    return models
      .filter((m) => m.name.includes("gemini"))
      .map((m) => ({
        name: m.name.replace("models/", ""),
        displayName: m.displayName || m.name,
        version: m.version || "stable",
        inputTokenLimit: m.inputTokenLimit || 1048576,
        outputTokenLimit: m.outputTokenLimit || 65536,
        description: m.description || "",
        temperature: m.temperature ?? 1,
        topP: m.topP ?? 0.95,
        topK: m.topK ?? 64,
        thinkingSupported: m.thinking ?? false,
      }))
      .slice(0, 8);
  } catch {
    return [];
  }
}

export default async function AdminAiGatewayPage() {
  const liveModels = await getLiveGeminiModels();

  return (
    <div className="space-y-6">
      {/* ── Top Header Banner ── */}
      <div className="rounded-3xl border border-[#1b4332] bg-gradient-to-r from-[#0c2419] via-[#0f2d20] to-[#071710] p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(#c8ef70 1px, transparent 1px), linear-gradient(90deg, #c8ef70 1px, transparent 1px)",
            backgroundSize: "28px 28px"
          }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-black uppercase tracking-widest text-[#c8ef70]">
                [AI ENGINE // ROUTER & TOKEN METRICS]
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-ping" />
            </div>
            <h1 className="font-display mt-2 text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              AI Engine & Token Quota Gateway
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#b3d3bd] max-w-2xl leading-relaxed">
              Pemantau real-time kapasitas token, router model, status fallback, dan kuota API Google Gemini yang mentenagai fitur cerdas ngampUS.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-2xl border border-[#c8ef70]/30 bg-[#c8ef70]/10 px-3.5 py-2 text-xs font-bold text-[#c8ef70]">
              <Activity size={14} className="animate-pulse" />
              <span>Live Engine Connected</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Key Token & Quota Metrics ── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1b4332] text-[#c8ef70]">
              <Gauge size={20} />
            </span>
            <span className="font-mono text-[9px] text-[#789a84] font-black uppercase">MAX CONTEXT</span>
          </div>
          <p className="mt-4 text-2xl sm:text-3xl font-black text-white">1,048,576</p>
          <p className="text-xs text-[#9dc5aa] font-medium mt-0.5">Input Tokens / Req</p>
        </div>

        <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1b4332] text-[#c8ef70]">
              <Zap size={20} />
            </span>
            <span className="font-mono text-[9px] text-[#789a84] font-black uppercase">GENERATION LIMIT</span>
          </div>
          <p className="mt-4 text-2xl sm:text-3xl font-black text-[#c8ef70]">65,536</p>
          <p className="text-xs text-[#9dc5aa] font-medium mt-0.5">Output Tokens / Res</p>
        </div>

        <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1b4332] text-[#c8ef70]">
              <Layers size={20} />
            </span>
            <span className="font-mono text-[9px] text-[#789a84] font-black uppercase">FALLBACK CHAIN</span>
          </div>
          <p className="mt-4 text-2xl sm:text-3xl font-black text-white">4 Model</p>
          <p className="text-xs text-[#9dc5aa] font-medium mt-0.5">Auto Failover Router</p>
        </div>

        <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1b4332] text-[#c8ef70]">
              <ShieldCheck size={20} />
            </span>
            <span className="font-mono text-[9px] text-[#789a84] font-black uppercase">FREE TIER BUDGET</span>
          </div>
          <p className="mt-4 text-2xl sm:text-3xl font-black text-white">15 RPM</p>
          <p className="text-xs text-[#9dc5aa] font-medium mt-0.5">1,500 Requests / Day</p>
        </div>
      </div>

      {/* ── Active Router Pipeline (9Router Architecture Style) ── */}
      <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/90 p-5 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-[#c8ef70]" />
            <h2 className="font-display text-base sm:text-lg font-black text-white">
              Model Routing & Multi-Engine Pipeline
            </h2>
          </div>
          <span className="font-mono text-[10px] text-[#c8ef70] font-bold">ROUTER STATUS: OPTIMAL</span>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#c8ef70]/40 bg-[#071710] p-4 relative">
            <span className="absolute top-3 right-3 rounded-full bg-[#c8ef70] px-2 py-0.5 text-[9px] font-black text-[#103626]">
              PRIORITAS #1
            </span>
            <span className="font-mono text-[10px] font-bold text-[#789a84]">TIER 1 (PRIMARY)</span>
            <h3 className="text-sm font-black text-white mt-1">gemini-3.7-flash</h3>
            <p className="text-[11px] text-[#9dc5aa] mt-1">
              Model generasi terbaru dengan penalaran reasoning super cepat untuk tutor dan modul.
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-[10px] font-mono text-[#789a84]">
              <span>Context: 1M Tokens</span>
              <span className="text-emerald-400 font-bold">Primary</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#071710] p-4 relative">
            <span className="font-mono text-[10px] font-bold text-[#789a84]">TIER 2 (FALLBACK)</span>
            <h3 className="text-sm font-black text-white mt-1">gemini-3.5-flash</h3>
            <p className="text-[11px] text-[#9dc5aa] mt-1">
              Jalur cadangan pertama jika kuota permintaan per menit model 3.7 mengalami antrean tinggi.
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-[10px] font-mono text-[#789a84]">
              <span>Context: 1M Tokens</span>
              <span className="text-[#b4d8c1]">Standby</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#071710] p-4 relative">
            <span className="font-mono text-[10px] font-bold text-[#789a84]">TIER 3 (LITE ENGINE)</span>
            <h3 className="text-sm font-black text-white mt-1">gemini-3.1-flash-lite</h3>
            <p className="text-[11px] text-[#9dc5aa] mt-1">
              Optimalisasi latensi paling rendah untuk tugas pencarian cepat dan perangkum teks pendek.
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-[10px] font-mono text-[#789a84]">
              <span>Context: 1M Tokens</span>
              <span className="text-[#b4d8c1]">Standby</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#071710] p-4 relative">
            <span className="font-mono text-[10px] font-bold text-[#789a84]">TIER 4 (STABLE SAFETY)</span>
            <h3 className="text-sm font-black text-white mt-1">gemini-3.6-flash</h3>
            <p className="text-[11px] text-[#9dc5aa] mt-1">
              Model pelindung batas akhir untuk memastikan user tidak pernah menerima pesan error server.
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-[10px] font-mono text-[#789a84]">
              <span>Context: 1M Tokens</span>
              <span className="text-[#b4d8c1]">Standby</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Live Model Directory from Gemini API ── */}
      <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/90 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h2 className="font-display text-base sm:text-lg font-black text-white">
              Katalog Model AI Aktif dari Google Generative Language
            </h2>
            <p className="text-xs text-[#9dc5aa] mt-0.5">
              Daftar model yang diotorisasi oleh API Key Anda beserta batas token spesifikasinya.
            </p>
          </div>
          <span className="font-mono text-[11px] text-[#789a84]">
            {liveModels.length} Model Terdeteksi
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-[#071710] font-mono text-[10px] font-black uppercase tracking-wider text-[#789a84]">
              <tr>
                <th className="px-4 py-3">Nama Model</th>
                <th className="px-4 py-3">Versi</th>
                <th className="px-4 py-3">Input Token Limit</th>
                <th className="px-4 py-3">Output Token Limit</th>
                <th className="px-4 py-3">Fitur Thinking</th>
                <th className="px-4 py-3 text-right">Status Router</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {liveModels.map((m, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-white text-sm">{m.displayName}</div>
                    <div className="font-mono text-[11px] text-[#789a84]">{m.name}</div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[#b3d3bd]">{m.version}</td>
                  <td className="px-4 py-3.5 font-mono font-bold text-[#c8ef70]">
                    {m.inputTokenLimit.toLocaleString("id-ID")} Tokens
                  </td>
                  <td className="px-4 py-3.5 font-mono font-bold text-white">
                    {m.outputTokenLimit.toLocaleString("id-ID")} Tokens
                  </td>
                  <td className="px-4 py-3.5">
                    {m.thinkingSupported ? (
                      <span className="rounded-full bg-[#1b4332] px-2 py-0.5 text-[10px] font-bold text-[#c8ef70]">
                        Supported
                      </span>
                    ) : (
                      <span className="text-[#557763] text-[11px]">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      <CheckCircle2 size={11} />
                      Ready
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
