import { API_BASE } from "./constants";

async function handle<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (init?.body !== undefined && headers["Content-Type"] === undefined) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${res.status} ${t}`);
  }
  return (await res.json()) as T;
}

export type DealRow = {
  id: string;
  deal_seed: string;
  buyer: string;
  seller: string;
  arbiter: string;
  amount_lamports: number;
  program_id: string;
  created_at: number;
};

export type DealBundle = {
  deal: DealRow;
  last_risk_score: null | {
    tier: string;
    rationale: string;
    signals: Record<string, unknown>;
    created_at: number;
  };
  solana: {
    program_id: string;
    escrow_pubkey: string;
    vault_pubkey: string;
    explorer_escrow: string;
    explorer_vault: string;
    chain?: unknown;
  };
};

export type ActivityItem = {
  id: string;
  kind: "deal_created" | "message" | "risk_analyzed";
  deal_id: string;
  deal_label: string;
  title: string;
  detail: string;
  tone: "good" | "warn" | "bad" | "neutral";
  tier?: string;
  created_at: number;
};

export async function listActivity(limit = 50): Promise<ActivityItem[]> {
  return handle(`/api/activity?limit=${limit}`);
}

export async function listDeals(): Promise<DealRow[]> {
  return handle("/api/deals");
}

export async function createDeal(body: {
  buyer: string;
  seller: string;
  arbiter: string;
  amount_lamports: number;
}) {
  return handle<Record<string, unknown>>("/api/deals", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getDeal(
  id: string,
  includeChain = false,
): Promise<DealBundle> {
  const q = includeChain ? "?include_chain=true" : "";
  return handle(`/api/deals/${encodeURIComponent(id)}${q}`);
}

export async function listMessages(dealId: string) {
  return handle<
    { id: number; sender: string; body: string; created_at: number }[]
  >(`/api/deals/${encodeURIComponent(dealId)}/messages`);
}

export async function postMessage(
  dealId: string,
  sender: string,
  body: string,
) {
  return handle(`/api/deals/${encodeURIComponent(dealId)}/messages`, {
    method: "POST",
    body: JSON.stringify({ sender, body }),
  });
}

export async function analyzeDeal(dealId: string) {
  return handle<{
    tier: string;
    rationale: string;
    signals: unknown;
    analyzed_messages: number;
  }>(`/api/deals/${encodeURIComponent(dealId)}/analyze`, { method: "POST" });
}

export async function voiceContract(dealId: string) {
  return handle<{
    mime: string | null;
    deal_id: string;
    audio_base64: string | null;
    script: string;
    note?: string;
    /** Present when TTS failed but a key was configured (debug production). */
    elevenlabs_http_status?: number;
    elevenlabs_detail?: string | null;
  }>(`/api/deals/${encodeURIComponent(dealId)}/voice-contract`, {
    method: "POST",
  });
}
