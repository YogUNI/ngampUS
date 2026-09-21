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
  Database,
  BarChart3,
  Flame,
  AlertTriangle
} from "lucide-react";
import { getAiDailyTelemetry, DAILY_REQUEST_LIMIT } from "@/lib/ai-telemetry";

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
  const [liveModels, telemetry] = await Promise.all([
    getLiveGeminiModels(),
    getAiDailyTelemetry(),
  ]);

  const usedReqs = telemetry.total_requests || 0;
  const remainingReqs = Math.max(0, DAILY_REQUEST_LIMIT - usedReqs);
  const percentUsed = Math.min(100, Math.round((usedReqs / DAILY_REQUEST_LIMIT) * 100));
  const isNearlyDepleted = percentUsed >= 85;

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
              Arsitektur cerdas distribusi token multi-model ngampUS Engine. Memantau kapasitas token, sisa limitasi per menit/hari, dan kabel jalur transmisi fallback engine secara visual dan real-time.
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

      {/* ── LIVE DAILY QUOTA & DEPLETION ALERT BANNER ── */}
      <div
        className={`rounded-3xl border p-5 sm:p-6 transition-all ${
          isNearlyDepleted
            ? "border-amber-500/50 bg-gradient-to-r from-amber-950/40 via-[#0c2419] to-[#071710] shadow-[0_0_30px_rgba(245,158,11,0.15)]"
            : "border-[#1e4631] bg-[#0c2419]/95"
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span
              className={`grid h-11 w-11 place-items-center rounded-2xl border ${
                isNearlyDepleted
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : "bg-[#c8ef70]/15 text-[#c8ef70] border-[#c8ef70]/30"
              }`}
            >
              {isNearlyDepleted ? <AlertTriangle size={22} /> : <BarChart3 size={22} />}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">
                  Live Quota Tracker & Telemetri Harian
                </h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                    isNearlyDepleted
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                      : "bg-[#183929] text-[#c8ef70] border border-[#c8ef70]/30"
                  }`}
                >
                  {isNearlyDepleted ? "KUOTA MENIPIS" : "KUOTA SEHAT"}
                </span>
              </div>
              <p className="text-xs text-[#9dc5aa] mt-0.5">
                Mencatat penggunaan request dan akumulasi token mahasiswa hari ini (reset otomatis jam 07:00 WIB).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-right font-mono">
              <span className="text-xs text-[#789a84]">Sisa Kuota Hari Ini:</span>
              <p className="text-lg font-black text-white">
                {remainingReqs.toLocaleString("id-ID")}{" "}
                <span className="text-xs font-normal text-[#9dc5aa]">
                  / {DAILY_REQUEST_LIMIT} Req
                </span>
              </p>
            </div>
            <a
              href="https://aistudio.google.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-[#edf4ef] hover:bg-white/10 transition"
            >
              <span>Google AI Studio</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Progress Bar & Sub metrics */}
        <div className="mt-5 space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-[#9dc5aa]">
                Penggunaan Request Hari Ini: {usedReqs} ({percentUsed}%)
              </span>
              <span className={isNearlyDepleted ? "text-amber-300" : "text-[#c8ef70]"}>
                {remainingReqs} Request Tersisa
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-[#183929]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isNearlyDepleted
                    ? "bg-gradient-to-r from-amber-500 to-rose-500"
                    : "bg-gradient-to-r from-[#22c55e] to-[#c8ef70]"
                }`}
                style={{ width: `${Math.max(2, percentUsed)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="rounded-2xl border border-white/5 bg-black/20 p-3">
              <span className="text-[10px] font-mono uppercase text-[#789a84]">Total Token Terpakai</span>
              <p className="text-base font-black text-white font-mono mt-0.5">
                {telemetry.total_tokens.toLocaleString("id-ID")}
              </p>
              <span className="text-[10px] text-[#557763]">Prompt + Output</span>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/20 p-3">
              <span className="text-[10px] font-mono uppercase text-[#789a84]">Model Aktif Terakhir</span>
              <p className="text-xs font-bold text-[#c8ef70] font-mono mt-1 truncate">
                {telemetry.last_model_used || "gemini-3.7-flash"}
              </p>
              <span className="text-[10px] text-[#557763]">Primary Tier</span>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/20 p-3">
              <span className="text-[10px] font-mono uppercase text-[#789a84]">Insiden 429 (Quota Limit)</span>
              <p className={`text-base font-black font-mono mt-0.5 ${telemetry.error_429_count > 0 ? "text-amber-400" : "text-white"}`}>
                {telemetry.error_429_count} Kali
              </p>
              <span className="text-[10px] text-[#557763]">Otomatis di-failover</span>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/20 p-3">
              <span className="text-[10px] font-mono uppercase text-[#789a84]">Panggilan Terakhir</span>
              <p className="text-xs font-bold text-white font-mono mt-1">
                {telemetry.last_request_at
                  ? new Date(telemetry.last_request_at).toLocaleTimeString("id-ID")
                  : "Belum ada"}
              </p>
              <span className="text-[10px] text-[#557763]">Waktu WIB</span>
            </div>
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
            <span className="font-mono text-[9px] text-[#789a84] font-black uppercase">DAILY STATUS</span>
          </div>
          <p className="mt-4 text-2xl sm:text-3xl font-black text-white">{100 - percentUsed}% Sisa</p>
          <p className="text-xs text-[#9dc5aa] font-medium mt-0.5">{remainingReqs} dari 1,500 RPD</p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#1b4332]">
            <div
              className={`h-full rounded-full ${isNearlyDepleted ? "bg-amber-400" : "bg-emerald-400"}`}
              style={{ width: `${Math.max(5, 100 - percentUsed)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── VISUAL NGAMPUS SMART AI PIPELINE (DENGAN KABEL ELEKTRONIK MENGALIR NYATA) ── */}
      <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/95 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle Cyber Grid Texture */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "linear-gradient(#c8ef70 1px, transparent 1px), linear-gradient(90deg, #c8ef70 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <Workflow size={18} className="text-[#c8ef70]" />
              <h2 className="font-display text-lg sm:text-xl font-black text-white">
                Topologi Sirkuit Kabel & Aliran Cerdas AI Gateway
              </h2>
            </div>
            <p className="text-xs text-[#9dc5aa] mt-1">
              Jalur aliran data beranimasi real-time dengan mekanisme Smart Failover otomatis saat kuota RPM atau batas token tercapai.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#c8ef70] font-black tracking-widest uppercase bg-[#1b4332] px-3.5 py-1.5 rounded-full border border-[#c8ef70]/40 flex items-center gap-1.5 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-[#c8ef70] animate-ping" />
              <span>LIVE TRANSMISSION FLOWING</span>
            </span>
          </div>
        </div>

        {/* ── Visual Flow: Connected Nodes & Flowing Cables ── */}
        <div className="mt-8 space-y-6 relative z-10">
          {/* Top Entry Ingress: Mahasiswa Request */}
          <div className="flex justify-center">
            <div className="relative flex items-center gap-3 rounded-2xl border-2 border-[#c8ef70]/70 bg-[#071710] px-6 py-3.5 shadow-[0_0_30px_rgba(200,239,112,0.2)]">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#c8ef70] text-[#103626] font-black shadow-xs">
                <Bot size={20} />
              </span>
              <div>
                <span className="font-mono text-[9.5px] font-black uppercase tracking-wider text-[#c8ef70]">
                  INGRESS GATEWAY // CLIENT REQUEST SOURCE
                </span>
                <p className="text-xs sm:text-sm font-bold text-white">
                  Tutor Mahasiswa, Ringkasan Modul & AI Chatbot
                </p>
              </div>
              <div className="flex items-center gap-1.5 pl-3 border-l border-white/10">
                <span className="h-2 w-2 rounded-full bg-[#c8ef70] animate-ping" />
                <span className="font-mono text-[9px] text-[#c8ef70] font-bold">STREAMING</span>
              </div>
            </div>
          </div>

          {/* Vertical Main Feed Cable with Flowing Laser Pulse */}
          <div className="relative flex justify-center h-10">
            <div className="w-1.5 bg-[#184631] relative rounded-full overflow-hidden shadow-[0_0_12px_rgba(200,239,112,0.4)]">
              {/* Flowing Laser Packet */}
              <div className="cable-pulse-vertical shadow-[0_0_10px_#c8ef70]" />
            </div>
          </div>

          {/* Distribution Hub Junction Node */}
          <div className="flex justify-center">
            <div className="rounded-full border border-[#c8ef70]/40 bg-[#0f2d20] px-4 py-1 text-[10px] font-mono text-[#c8ef70] font-black shadow-inner flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c8ef70] animate-ping" />
              <span>SMART LOAD DISTRIBUTION SWITCH</span>
            </div>
          </div>

          {/* Vertical Link to Bus */}
          <div className="relative flex justify-center h-4">
            <div className="w-1.5 bg-[#184631] relative rounded-full overflow-hidden">
              <div className="cable-pulse-vertical shadow-[0_0_10px_#c8ef70]" />
            </div>
          </div>

          {/* Horizontal Bus Distribution Cable with Real-Time Flow Pulses */}
          <div className="relative hidden md:block">
            <div className="mx-auto w-[82%] h-1.5 bg-[#184631] relative rounded-full overflow-hidden shadow-[0_0_15px_rgba(200,239,112,0.25)]">
              {/* Left-to-Right Flowing Energy Beam */}
              <div className="cable-pulse-horizontal shadow-[0_0_14px_#c8ef70]" />
            </div>

            {/* Downward Drop Cables to each Node Box with Flowing Electrons */}
            <div className="mx-auto w-[82%] relative h-6">
              {/* Node 1 Drop Cable */}
              <div className="absolute left-[12%] top-0 w-1.5 h-6 bg-[#184631] rounded-b-md overflow-hidden shadow-[0_0_10px_rgba(200,239,112,0.3)]">
                <div className="cable-pulse-vertical" style={{ animationDelay: '0s' }} />
              </div>
              {/* Node 2 Drop Cable */}
              <div className="absolute left-[38%] top-0 w-1.5 h-6 bg-[#184631] rounded-b-md overflow-hidden">
                <div className="cable-pulse-vertical" style={{ animationDelay: '0.35s' }} />
              </div>
              {/* Node 3 Drop Cable */}
              <div className="absolute left-[62%] top-0 w-1.5 h-6 bg-[#184631] rounded-b-md overflow-hidden">
                <div className="cable-pulse-vertical" style={{ animationDelay: '0.7s' }} />
              </div>
              {/* Node 4 Drop Cable */}
              <div className="absolute left-[88%] top-0 w-1.5 h-6 bg-[#184631] rounded-b-md overflow-hidden">
                <div className="cable-pulse-vertical" style={{ animationDelay: '1.05s' }} />
              </div>
            </div>
          </div>

          {/* The 4 Model Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 pt-2">
            {/* Tier 1 (Primary) */}
            <div className="relative rounded-2xl border-2 border-[#c8ef70] bg-[#071710] p-5 shadow-[0_0_30px_rgba(200,239,112,0.2)] flex flex-col justify-between overflow-hidden">
              {/* Top Laser Accent Strip */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#c8ef70] to-transparent animate-pulse" />

              {/* Glowing Top Pin Cable */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center">
                <span className="rounded-full bg-[#c8ef70] px-2.5 py-0.5 text-[9px] font-black text-[#103626] uppercase shadow-sm flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#103626] animate-ping" />
                  NODE 01 • PRIMARY
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-[9px] text-[#c8ef70] font-bold">LATENCY: ~400ms</span>
                  <span className="h-2 w-2 rounded-full bg-[#c8ef70] animate-ping" />
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
                  <span className="text-emerald-400 font-black flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    FLOWING NOW
                  </span>
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
