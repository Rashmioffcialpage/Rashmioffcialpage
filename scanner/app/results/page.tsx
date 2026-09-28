"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { latestScan, loadHistory, ScanRecord } from "@/lib/storage";

export default function ResultsPage() {
  const [scan, setScan] = useState<ScanRecord | null>(null);
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setScan(latestScan());
    setHistory(loadHistory());
  }, []);

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!scan) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          goal: scan.input.goal,
          bmi: scan.result.bmi,
          bmiCategory: scan.result.bmiCategory,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      setUnlocked(true);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!scan) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16 text-center">
        <p className="text-ink/70">No scan found yet.</p>
        <Link href="/scan" className="mt-4 inline-block text-brand-600 underline">
          Take your free scan
        </Link>
      </main>
    );
  }

  const { result } = scan;

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-bold text-ink">Your metabolic report</h1>

      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-ink/60">BMI</span>
          <span className="text-3xl font-bold text-ink">{result.bmi}</span>
        </div>
        <p className="mt-1 text-sm text-brand-700">{result.bmiCategory}</p>
      </div>

      {!unlocked ? (
        <div className="mt-6 rounded-2xl border border-brand-300 bg-brand-50 p-6">
          <p className="text-sm font-semibold text-ink">
            Unlock your full report
          </p>
          <p className="mt-1 text-sm text-ink/70">
            Calorie target, macro breakdown{result.bodyFatPercent !== null ? ", body composition estimate," : ""} and your personalized plan.
          </p>
          <form onSubmit={handleUnlock} className="mt-4 flex gap-2">
            <input
              type="email"
              required
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={submitting}
              className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? "..." : "Unlock"}
            </button>
          </form>
          {submitError && <p className="mt-2 text-xs text-red-600">{submitError}</p>}
          <p className="mt-3 text-xs text-ink/50">
            We&apos;ll also send your personalized recommendations. Unsubscribe anytime.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Stat label="Daily calorie target" value={`${result.calorieTarget} kcal`} />
            <Stat label="Maintenance (TDEE)" value={`${result.tdee} kcal`} />
            <Stat label="Protein" value={`${result.macros.proteinG} g`} />
            <Stat label="Carbs" value={`${result.macros.carbsG} g`} />
            <Stat label="Fat" value={`${result.macros.fatG} g`} />
            {result.bodyFatPercent !== null && (
              <Stat label="Body fat estimate" value={`${result.bodyFatPercent}%`} />
            )}
          </div>

          {history.length > 1 && (
            <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6">
              <p className="text-sm font-semibold text-ink">Your trend</p>
              <ul className="mt-3 space-y-1 text-sm text-ink/70">
                {history.slice(-5).map((h) => (
                  <li key={h.date} className="flex justify-between">
                    <span>{new Date(h.date).toLocaleDateString()}</span>
                    <span>BMI {h.result.bmi}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <RecommendationCard bmi={result.bmi} goal={scan.input.goal} />
        </>
      )}

      <div className="mt-8 flex gap-4 text-sm">
        <Link href="/scan" className="text-brand-600 underline">
          Log a new scan
        </Link>
      </div>

      <p className="mt-8 text-xs text-ink/40">
        Estimates only, based on standard formulas (Mifflin-St Jeor, U.S. Navy
        method). Not a medical diagnosis — talk to a licensed provider before
        starting any weight-loss or supplement program.
      </p>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-1 text-xl font-bold text-ink">{value}</p>
    </div>
  );
}

function RecommendationCard({ bmi, goal }: { bmi: number; goal: string }) {
  const track =
    bmi >= 27 || goal === "lose"
      ? {
          title: "Weight management track",
          copy: "Based on your results, you may be a candidate for our physician-guided weight management program.",
          cta: "Explore weight management",
        }
      : {
          title: "Longevity track",
          copy: "Your metrics are in a healthy range — explore our longevity and performance programs to optimize from here.",
          cta: "Explore longevity programs",
        };

  return (
    <div className="mt-6 rounded-2xl border border-ink/10 bg-ink p-6 text-paper">
      <p className="text-sm font-semibold">{track.title}</p>
      <p className="mt-1 text-sm text-paper/70">{track.copy}</p>
      <button className="mt-4 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-ink">
        {track.cta}
      </button>
    </div>
  );
}
