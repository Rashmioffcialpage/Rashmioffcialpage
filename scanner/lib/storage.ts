import type { ScanInput, ScanResult } from "./calculations";

const HISTORY_KEY = "binexa_scan_history";

export interface ScanRecord {
  date: string; // ISO
  input: ScanInput;
  result: ScanResult;
}

export function saveScan(record: ScanRecord): void {
  if (typeof window === "undefined") return;
  const history = loadHistory();
  history.push(record);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function loadHistory(): ScanRecord[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ScanRecord[];
  } catch {
    return [];
  }
}

export function latestScan(): ScanRecord | null {
  const history = loadHistory();
  return history.length ? history[history.length - 1] : null;
}
