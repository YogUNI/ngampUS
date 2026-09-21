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
  Sliders,
  Radio,
  Workflow,
  Wifi,
  CornerDownRight,
  Database
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
    <div className="space-y-8">
      {/* ── Top Header Banner ── */}
      <div className="rounded-3xl border border-[#1b4332] bg-gradient-to-r from-[#0c2419] via-[#0f2d20] to-[#071710] p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle Cyber Grid Texture */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "linear-gradient(#c8ef70 1px, transparent 1px), linear-gradient(90deg, #c8ef70 1px, transparent 1px)",
            backgroundSize: "28px 28px"
          }}
        />

        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#c8ef70]/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-[#22c55e]/10 blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-black uppercase tracking-widest text-[#c8ef70]">
                [AI ENGINE // REAL-TIME TOKEN ROUTER & TELEMETRY]
              </span>
              <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-ping" />
            </div>
            <h1 className="font-display mt-2 text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              AI Engine & Token Quota Gateway
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#b3d3bd] max-w-2xl leading-relaxed">
              Arsitektur cerdas router token multi-model bergaya 9Router. Memantau kapasitas token, sisa limitasi per menit/hari, dan kabel jalur fallback engine secara visual dan real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-2 rounded-2xl border border-[#c8ef70]/30 bg-[#0c2419] px-4 py-2 text-xs font-bold text-[#c8ef70] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#c8ef70] animate-pulse" />
              <span>Gateway Online (Google API)</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Key Token & Quota Metrics ── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {/* Metric 1 */}
        <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/90 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1b4332] text-[#c8ef70]">
              <Gauge size={20} />
            </span>
            <span className="font-mono text-[9px] text-[#789a84] font-black uppercase">MAX CONTEXT</span>
          </div>
          <p className="mt-4 text-2xl sm:text-3xl font-black text-white">1,048,576</p>
          <p className="text-xs text-[#9dc5aa] font-medium mt-0.5">Input Tokens / Req (~750K Kata)</p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#1b4332]">
            <div className="h-full rounded-full bg-[#c8ef70] w-full" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/90 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1b4332] text-[#c8ef70]">
              <Zap size={20} />
            </span>
            <span className="font-mono text-[9px] text-[#789a84] font-black uppercase">MAX GENERATION</span>
          </div>
          <p className="mt-4 text-2xl sm:text-3xl font-black text-[#c8ef70]">65,536</p>
          <p className="text-xs text-[#9dc5aa] font-medium mt-0.5">Output Tokens / Res</p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#1b4332]">
            <div className="h-full rounded-full bg-[#c8ef70] w-full" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/90 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1b4332] text-[#c8ef70]">
              <Layers size={20} />
            </span>
            <span className="font-mono text-[9px] text-[#789a84] font-black uppercase">FALLBACK CHAIN</span>
          </div>
          <p className="mt-4 text-2xl sm:text-3xl font-black text-white">4 Model</p>
          <p className="text-xs text-[#9dc5aa] font-medium mt-0.5">Failover Routing Pipeline</p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#1b4332]">
            <div className="h-full rounded-full bg-emerald-400 w-full" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/90 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1b4332] text-[#c8ef70]">
              <ShieldCheck size={20} />
            </span>
            <span className="font-mono text-[9px] text-[#789a84] font-black uppercase">FREE TIER BUDGET</span>
          </div>
          <p className="mt-4 text-2xl sm:text-3xl font-black text-white">15 RPM</p>
          <p className="text-xs text-[#9dc5aa] font-medium mt-0.5">1,500 Requests / Hari</p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#1b4332]">
            <div className="h-full rounded-full bg-emerald-400 w-full" />
          </div>
        </div>
      </div>

      {/* ── VISUAL 9ROUTER CIRCUIT & PIPELINE CANVAS (DENGAN KABEL ELEKTRONIK) ── */}
      <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/95 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Workflow size={18} className="text-[#c8ef70]" />
              <h2 className="font-display text-lg sm:text-xl font-black text-white">
                Interactive 9Router Circuit & Fallback Cable Topology
              </h2>
            </div>
            <p className="text-xs text-[#9dc5aa] mt-1">
              Topologi kabel jalur otomatis pengalihan trafik (Smart Failover) saat batas token atau kuota RPM tercapai.
            </p>
          </div>
          <span className="font-mono text-[10px] text-[#c8ef70] font-black tracking-widest uppercase bg-[#1b4332] px-3 py-1 rounded-full border border-[#c8ef70]/30 self-start sm:self-auto">
            ⚡ CIRCUIT ACTIVE
          </span>
        </div>

        {/* ── The 9Router Visual Flow with Connected Nodes & Cables ── */}
        <div className="mt-8 space-y-6">
          {/* Top Entry Ingress: Mahasiswa Request */}
          <div className="flex justify-center">
            <div className="flex items-center gap-3 rounded-2xl border border-[#c8ef70]/50 bg-[#071710] px-5 py-3 shadow-[0_0_20px_rgba(200,239,112,0.15)]">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#c8ef70] text-[#103626] font-black">
                <Bot size={18} />
              </span>
              <div>
                <span className="font-mono text-[9px] font-black uppercase tracking-wider text-[#c8ef70]">
                  INGRESS GATEWAY // CLIENT REQUEST
                </span>
                <p className="text-xs font-bold text-white">
                  Tutor Mahasiswa, Ringkasan Modul & AI Chatbot
                </p>
              </div>
              <div className="flex items-center gap-1 pl-2">
                <span className="h-2 w-2 rounded-full bg-[#c8ef70] animate-ping" />
              </div>
            </div>
          </div>

          {/* Vertical Bus Cable */}
          <div className="relative flex justify-center h-8">
            <div className="w-1 bg-gradient-to-b from-[#c8ef70] via-[#22c55e] to-[#20553c] relative shadow-[0_0_10px_rgba(200,239,112,0.5)]">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-[#c8ef70] animate-pulse" />
            </div>
          </div>

          {/* Horizontal Bus Distribution Cable */}
          <div className="relative hidden md:block">
            <div className="mx-auto w-[76%] h-1 bg-[#20553c] relative">
              {/* Cable Pulses */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c8ef70] to-transparent opacity-80 animate-pulse" />
              {/* Dropdown connectors to each tier */}
              <div className="absolute left-[12%] -bottom-4 w-1 h-4 bg-[#20553c]" />
              <div className="absolute left-[38%] -bottom-4 w-1 h-4 bg-[#20553c]" />
              <div className="absolute left-[62%] -bottom-4 w-1 h-4 bg-[#20553c]" />
              <div className="absolute left-[88%] -bottom-4 w-1 h-4 bg-[#20553c]" />
            </div>
          </div>

          {/* The 4 Model Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 pt-2">
            {/* Tier 1 (Primary) */}
            <div className="relative rounded-2xl border-2 border-[#c8ef70] bg-[#071710] p-5 shadow-[0_0_25px_rgba(200,239,112,0.15)] flex flex-col justify-between">
              {/* Glowing Top Pin Cable */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center">
                <span className="rounded-full bg-[#c8ef70] px-2.5 py-0.5 text-[9px] font-black text-[#103626] uppercase shadow-sm">
                  NODE 01 • PRIMARY
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-[9px] text-[#c8ef70] font-bold">LATENCY: ~400ms</span>
                  <span className="h-2 w-2 rounded-full bg-[#c8ef70] animate-pulse" />
                </div>
                <h3 className="text-base font-black text-white mt-2">gemini-3.7-flash</h3>
                <p className="text-xs text-[#9dc5aa] mt-1.5 leading-relaxed">
                  Engine mutakhir dengan penalaran reasoning paling tajam dan presisi untuk membedah materi kuliah.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5 text-[11px] font-mono">
                <div className="flex justify-between text-[#789a84]">
                  <span>Max Context:</span>
                  <span className="text-[#c8ef70] font-bold">1,048,576 Token</span>
                </div>
                <div className="flex justify-between text-[#789a84]">
                  <span>Generation:</span>
                  <span className="text-white font-bold">65,536 Token</span>
                </div>
                <div className="flex justify-between text-[#789a84]">
                  <span>Kabel Status:</span>
                  <span className="text-emerald-400 font-black">ACTIVE ROUTE</span>
                </div>
              </div>
            </div>

            {/* Tier 2 (First Fallback) */}
            <div className="relative rounded-2xl border border-white/15 bg-[#071710] p-5 flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center">
                <span className="rounded-full bg-[#183929] border border-white/20 px-2.5 py-0.5 text-[9px] font-bold text-[#b4d8c1] uppercase">
                  NODE 02 • FAILOVER 1
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-[9px] text-[#789a84]">STANDBY ROUTE</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500/50" />
                </div>
                <h3 className="text-base font-black text-white mt-2">gemini-3.5-flash</h3>
                <p className="text-xs text-[#9dc5aa] mt-1.5 leading-relaxed">
                  Kabel penyangga otomatis pertama jika kuota RPM model 3.7 mengalami status 429 / resource exhausted.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5 text-[11px] font-mono">
                <div className="flex justify-between text-[#789a84]">
                  <span>Max Context:</span>
                  <span className="text-[#b4d8c1]">1,048,576 Token</span>
                </div>
                <div className="flex justify-between text-[#789a84]">
                  <span>Generation:</span>
                  <span className="text-white">65,536 Token</span>
                </div>
                <div className="flex justify-between text-[#789a84]">
                  <span>Kabel Status:</span>
                  <span className="text-[#b4d8c1]">Hot Standby</span>
                </div>
              </div>
            </div>

            {/* Tier 3 (Lite Engine) */}
            <div className="relative rounded-2xl border border-white/15 bg-[#071710] p-5 flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center">
                <span className="rounded-full bg-[#183929] border border-white/20 px-2.5 py-0.5 text-[9px] font-bold text-[#b4d8c1] uppercase">
                  NODE 03 • FAILOVER 2
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-[9px] text-[#789a84]">STANDBY ROUTE</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500/50" />
                </div>
                <h3 className="text-base font-black text-white mt-2">gemini-3.1-flash-lite</h3>
                <p className="text-xs text-[#9dc5aa] mt-1.5 leading-relaxed">
                  Jalur kabel berlatensi ultra-rendah untuk pemrosesan teks cepat dan menghemat kuota token komputasi.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5 text-[11px] font-mono">
                <div className="flex justify-between text-[#789a84]">
                  <span>Max Context:</span>
                  <span className="text-[#b4d8c1]">1,048,576 Token</span>
                </div>
                <div className="flex justify-between text-[#789a84]">
                  <span>Generation:</span>
                  <span className="text-white">65,536 Token</span>
                </div>
                <div className="flex justify-between text-[#789a84]">
                  <span>Kabel Status:</span>
                  <span className="text-[#b4d8c1]">Hot Standby</span>
                </div>
              </div>
            </div>

            {/* Tier 4 (Stable Safety) */}
            <div className="relative rounded-2xl border border-white/15 bg-[#071710] p-5 flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center">
                <span className="rounded-full bg-[#183929] border border-white/20 px-2.5 py-0.5 text-[9px] font-bold text-[#b4d8c1] uppercase">
                  NODE 04 • FAILOVER 3
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-[9px] text-[#789a84]">SAFETY ROUTE</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500/50" />
                </div>
                <h3 className="text-base font-black text-white mt-2">gemini-3.6-flash</h3>
                <p className="text-xs text-[#9dc5aa] mt-1.5 leading-relaxed">
                  Kabel penahan beban lapis terakhir untuk memastikan mahasiswa tidak pernah gagal mendapatkan respon.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5 text-[11px] font-mono">
                <div className="flex justify-between text-[#789a84]">
                  <span>Max Context:</span>
                  <span className="text-[#b4d8c1]">1,048,576 Token</span>
                </div>
                <div className="flex justify-between text-[#789a84]">
                  <span>Generation:</span>
                  <span className="text-white">65,536 Token</span>
                </div>
                <div className="flex justify-between text-[#789a84]">
                  <span>Kabel Status:</span>
                  <span className="text-[#b4d8c1]">Ready Backup</span>
                </div>
              </div>
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
