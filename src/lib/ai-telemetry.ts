import { createClient } from "@/lib/supabase/server";

export interface AiDailyTelemetry {
  date: string;
  total_requests: number;
  total_prompt_tokens: number;
  total_candidates_tokens: number;
  total_tokens: number;
  last_model_used: string;
  last_request_at: string;
  error_429_count: number;
}

// 1.500 requests per day on Gemini Free Tier
export const DAILY_REQUEST_LIMIT = 1500;
// 1.000.000 tokens per minute
export const PER_MINUTE_TOKEN_LIMIT = 1000000;

export async function recordAiUsage(
  model: string,
  promptTokens: number = 0,
  candidatesTokens: number = 0,
  is429: boolean = false
) {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const total = (promptTokens || 0) + (candidatesTokens || 0);

    const { data: existing } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", `ai_telemetry_${today}`)
      .maybeSingle();

    let current: AiDailyTelemetry = existing?.value || {
      date: today,
      total_requests: 0,
      total_prompt_tokens: 0,
      total_candidates_tokens: 0,
      total_tokens: 0,
      last_model_used: model,
      last_request_at: new Date().toISOString(),
      error_429_count: 0,
    };

    current.total_requests += 1;
    current.total_prompt_tokens += promptTokens;
    current.total_candidates_tokens += candidatesTokens;
    current.total_tokens += total;
    current.last_model_used = model;
    current.last_request_at = new Date().toISOString();
    if (is429) {
      current.error_429_count += 1;
    }

    await supabase.from("system_settings").upsert(
      {
        key: `ai_telemetry_${today}`,
        value: current,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );
  } catch (err) {
    console.warn("Failed to record AI telemetry:", err);
  }
}

export async function getAiDailyTelemetry(): Promise<AiDailyTelemetry> {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", `ai_telemetry_${today}`)
      .maybeSingle();

    if (data?.value) {
      return data.value as AiDailyTelemetry;
    }
  } catch {
    // fallback
  }

  return {
    date: today,
    total_requests: 0,
    total_prompt_tokens: 0,
    total_candidates_tokens: 0,
    total_tokens: 0,
    last_model_used: "gemini-3.7-flash",
    last_request_at: new Date().toISOString(),
    error_429_count: 0,
  };
}
