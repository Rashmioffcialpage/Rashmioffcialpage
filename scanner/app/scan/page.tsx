"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActivityLevel, Goal, ScanInput, Sex, runScan } from "@/lib/calculations";
import { saveScan } from "@/lib/storage";

const initialState = {
  sex: "female" as Sex,
  age: "",
  heightCm: "",
  weightKg: "",
  activityLevel: "moderate" as ActivityLevel,
  goal: "lose" as Goal,
  waistCm: "",
  neckCm: "",
  hipCm: "",
};

export default function ScanPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof initialState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const age = Number(form.age);
    const heightCm = Number(form.heightCm);
    const weightKg = Number(form.weightKg);

    if (!age || !heightCm || !weightKg) {
      setError("Please fill in age, height, and weight.");
      return;
    }

    const input: ScanInput = {
      sex: form.sex,
      age,
      heightCm,
      weightKg,
      activityLevel: form.activityLevel,
      goal: form.goal,
      waistCm: form.waistCm ? Number(form.waistCm) : undefined,
      neckCm: form.neckCm ? Number(form.neckCm) : undefined,
      hipCm: form.hipCm ? Number(form.hipCm) : undefined,
    };

    const result = runScan(input);
    saveScan({ date: new Date().toISOString(), input, result });
    router.push("/results");
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-bold text-ink">Your scan</h1>
      <p className="mt-2 text-sm text-ink/60">
        Takes about 90 seconds. Waist/neck/hip are optional but unlock a body
        composition estimate.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <fieldset className="grid grid-cols-2 gap-4">
          <label className="text-sm font-medium text-ink">
            Sex
            <select
              className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2"
              value={form.sex}
              onChange={(e) => update("sex", e.target.value)}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </label>
          <label className="text-sm font-medium text-ink">
            Age
            <input
              type="number"
              min={13}
              max={100}
              className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2"
              value={form.age}
              onChange={(e) => update("age", e.target.value)}
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Height (cm)
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2"
              value={form.heightCm}
              onChange={(e) => update("heightCm", e.target.value)}
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Weight (kg)
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2"
              value={form.weightKg}
              onChange={(e) => update("weightKg", e.target.value)}
            />
          </label>
        </fieldset>

        <label className="block text-sm font-medium text-ink">
          Activity level
          <select
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2"
            value={form.activityLevel}
            onChange={(e) => update("activityLevel", e.target.value)}
          >
            <option value="sedentary">Sedentary (little to no exercise)</option>
            <option value="light">Light (1-3 days/week)</option>
            <option value="moderate">Moderate (3-5 days/week)</option>
            <option value="active">Active (6-7 days/week)</option>
            <option value="very_active">Very active (physical job + training)</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-ink">
          Goal
          <select
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2"
            value={form.goal}
            onChange={(e) => update("goal", e.target.value)}
          >
            <option value="lose">Lose weight</option>
            <option value="maintain">Maintain</option>
            <option value="gain">Build muscle</option>
          </select>
        </label>

        <details className="rounded-lg border border-ink/10 p-4">
          <summary className="cursor-pointer text-sm font-medium text-ink">
            Optional: unlock body composition estimate
          </summary>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <label className="text-sm text-ink">
              Waist (cm)
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2"
                value={form.waistCm}
                onChange={(e) => update("waistCm", e.target.value)}
              />
            </label>
            <label className="text-sm text-ink">
              Neck (cm)
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2"
                value={form.neckCm}
                onChange={(e) => update("neckCm", e.target.value)}
              />
            </label>
            <label className="text-sm text-ink">
              Hip (cm)
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2"
                value={form.hipCm}
                onChange={(e) => update("hipCm", e.target.value)}
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-ink/50">Hip is used for the female formula only.</p>
        </details>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-full bg-brand-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-700"
        >
          See my results
        </button>
      </form>
    </main>
  );
}
