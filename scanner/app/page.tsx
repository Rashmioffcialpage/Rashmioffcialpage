import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-600">
        BinexaHealth
      </p>
      <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
        Your free metabolic scan, in under 2 minutes.
      </h1>
      <p className="mt-4 text-lg text-ink/70">
        BMI, body composition estimate, and a calorie &amp; macro plan built
        for your goal — weight loss, longevity, or performance.
      </p>

      <Link
        href="/scan"
        className="mt-8 inline-flex w-fit items-center justify-center rounded-full bg-brand-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-brand-700"
      >
        Start my free scan
      </Link>

      <p className="mt-4 text-xs text-ink/50">
        Educational estimates only — not a medical diagnosis. See a licensed
        provider for clinical guidance.
      </p>

      <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-ink/10 pt-8">
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink/50">Step 1</dt>
          <dd className="mt-1 text-sm text-ink/80">Enter your stats</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink/50">Step 2</dt>
          <dd className="mt-1 text-sm text-ink/80">Get your report</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink/50">Step 3</dt>
          <dd className="mt-1 text-sm text-ink/80">See your personalized plan</dd>
        </div>
      </dl>
    </main>
  );
}
