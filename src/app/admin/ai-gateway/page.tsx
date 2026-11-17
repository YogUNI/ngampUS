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
  Workflow,
  AlertTriangle,
  BarChart3
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
    <div className="space-y-6">
      {/* ── Executive Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              AI Engine & Token Gateway
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online (Google API)
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Arsitektur cerdas distribusi token multi-model, pemantauan kuota harian, dan topologi fallback engine ngampUS.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://aistudio.google.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-xs"
          >
            <span>Google AI Studio</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* ── Live Daily Quota & Telemetry Card ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-800 border border-slate-700 text-emerald-400">
              <BarChart3 size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">
                  Live Quota Tracker & Telemetri Harian
                </h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-medium ${
                    isNearlyDepleted
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {isNearlyDepleted ? "Kuota Menipis" : "Kuota Normal"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Penggunaan request dan token mahasiswa hari ini (reset otomatis setiap pukul 07:00 WIB).
              </p>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-xs text-slate-400">Sisa Kuota:</span>
            <p className="text-base font-bold text-white">
              {remainingReqs.toLocaleString("id-ID")}{" "}
              <span className="text-xs font-normal text-slate-400 font-sans">
                / {DAILY_REQUEST_LIMIT} Req
              </span>
            </p>
          </div>
        </div>

        {/* Progress Bar & Sub metrics */}
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-slate-400">
                Penggunaan Request: <strong className="text-white font-mono">{usedReqs}</strong> ({percentUsed}%)
              </span>
              <span className={isNearlyDepleted ? "text-amber-400 font-mono" : "text-emerald-400 font-mono"}>
                {remainingReqs} Tersisa
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isNearlyDepleted ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${Math.max(2, percentUsed)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
              <span className="text-[11px] font-medium text-slate-400 block">Total Token Terpakai</span>
              <p className="text-base font-bold text-white font-mono mt-1">
                {telemetry.total_tokens.toLocaleString("id-ID")}
              </p>
              <span className="text-[10px] text-slate-500 block mt-0.5">Prompt + Output</span>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
              <span className="text-[11px] font-medium text-slate-400 block">Model Aktif Terakhir</span>
              <p className="text-xs font-bold text-emerald-400 font-mono mt-1.5 truncate">
                {telemetry.last_model_used || "gemini-2.5-flash"}
              </p>
              <span className="text-[10px] text-slate-500 block mt-0.5">Primary Tier</span>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
              <span className="text-[11px] font-medium text-slate-400 block">Insiden 429 (Rate Limit)</span>
              <p className={`text-base font-bold font-mono mt-1 ${telemetry.error_429_count > 0 ? "text-amber-400" : "text-white"}`}>
                {telemetry.error_429_count} <span className="text-xs font-normal text-slate-400">Insiden</span>
              </p>
              <span className="text-[10px] text-slate-500 block mt-0.5">Auto-failover triggered</span>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
              <span className="text-[11px] font-medium text-slate-400 block">Panggilan Terakhir</span>
              <p className="text-xs font-bold text-slate-200 font-mono mt-1.5">
                {telemetry.last_request_at
                  ? new Date(telemetry.last_request_at).toLocaleTimeString("id-ID")
                  : "Belum ada"}
              </p>
              <span className="text-[10px] text-slate-500 block mt-0.5">Waktu WIB</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Key Token & Quota Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Konteks Input Maksimal</span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Gauge size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tracking-tight text-white">1,048,576</span>
            <span className="text-xs text-slate-400 font-medium">Tokens</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Kapasitas ~750.000 kata per request
          </p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Kapasitas Output Maksimal</span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/10 text-blue-400">
              <Zap size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tracking-tight text-emerald-400">65,536</span>
            <span className="text-xs text-slate-400 font-medium">Tokens</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Batas respons penjelasan & rangkuman
          </p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pipeline Redundansi</span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-purple-500/10 text-purple-400">
              <Layers size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tracking-tight text-white">4 Model</span>
            <span className="text-xs text-slate-400 font-medium">Chain</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Jalur failover bertingkat otomatis
          </p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Batas Kuota Free-Tier</span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/10 text-amber-400">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tracking-tight text-white">15 RPM</span>
            <span className="text-xs text-slate-400 font-medium">/ 1.5K RPD</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Rate limit standar Google AI Studio
          </p>
        </div>
      </div>

      {/* ── Enterprise AI Architecture Topology ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <Workflow size={18} className="text-emerald-400" />
            <div>
              <h2 className="text-base font-semibold text-white">
                Topologi Routing & Fallback Chain
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Struktur distribusi beban cerdas dengan auto-failover ke model alternatif saat kuota atau batas latensi tercapai.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-mono text-emerald-400 self-start sm:self-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Active Router
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Tier 1 */}
          <div className="rounded-xl border border-emerald-500/30 bg-slate-950/80 p-4 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-mono font-semibold text-emerald-400 uppercase">
                  Primary Node
                </span>
                <span className="text-[10px] font-mono text-slate-400">~350ms</span>
              </div>
              <h3 className="text-sm font-bold text-white mt-3">gemini-2.5-flash</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Model default berlatensi rendah untuk seluruh tutor akademik dan ringkasan modul.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Context:</span>
                <span className="text-emerald-400 font-semibold">1,048,576</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-emerald-400 font-semibold">Active Serving</span>
              </div>
            </div>
          </div>

          {/* Tier 2 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[9px] font-mono font-medium text-slate-300 uppercase">
                  Failover 1
                </span>
                <span className="text-[10px] font-mono text-slate-500">Standby</span>
              </div>
              <h3 className="text-sm font-bold text-white mt-3">gemini-2.0-flash</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Rute redundansi generasi 2.0 jika model utama mengalami antrean rate limit.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Context:</span>
                <span className="text-slate-300">1,048,576</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-slate-400">Hot Standby</span>
              </div>
            </div>
          </div>

          {/* Tier 3 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[9px] font-mono font-medium text-slate-300 uppercase">
                  Failover 2
                </span>
                <span className="text-[10px] font-mono text-slate-500">Standby</span>
              </div>
              <h3 className="text-sm font-bold text-white mt-3">gemini-1.5-flash</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Rute cadangan stabil dengan throughput tinggi untuk menjaga layanan tetap online.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Context:</span>
                <span className="text-slate-300">1,048,576</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-slate-400">Hot Standby</span>
              </div>
            </div>
          </div>

          {/* Tier 4 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[9px] font-mono font-medium text-slate-300 uppercase">
                  Safety Net
                </span>
                <span className="text-[10px] font-mono text-slate-500">Ultra-Light</span>
              </div>
              <h3 className="text-sm font-bold text-white mt-3">gemini-2.0-flash-lite</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Node pemulihan beban ringan untuk memastikan setiap interaksi pengguna selesai 100%.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Context:</span>
                <span className="text-slate-300">1,048,576</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-slate-400">Emergency Net</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Live Model Directory from Google Generative AI ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-base font-semibold text-white">
              Katalog Model Google Gemini Terdeteksi
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Daftar model yang terhubung langsung via GEMINI_API_KEY lingkungan production.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {liveModels.length} Model Aktif
          </span>
        </div>

        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/60 font-medium text-[11px] text-slate-400">
              <tr>
                <th className="px-4 py-3">Nama Model</th>
                <th className="px-4 py-3">Versi</th>
                <th className="px-4 py-3">Input Token Limit</th>
                <th className="px-4 py-3">Output Token Limit</th>
                <th className="px-4 py-3">Thinking Support</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {liveModels.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-800/20 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-100 text-sm">{m.displayName}</div>
                    <div className="font-mono text-[11px] text-slate-400">{m.name}</div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-300">{m.version}</td>
                  <td className="px-4 py-3.5 font-mono text-emerald-400 font-medium">
                    {m.inputTokenLimit.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-200">
                    {m.outputTokenLimit.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3.5">
                    {m.thinkingSupported ? (
                      <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                        Supported
                      </span>
                    ) : (
                      <span className="text-slate-500 font-mono text-[11px]">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
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
