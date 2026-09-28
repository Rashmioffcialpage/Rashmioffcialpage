# BinexaHealth Scanner (v1)

Free metabolic scan funnel: BMI, calorie/macro targets, and an optional
body-fat estimate — built as the top-of-funnel lead magnet for
BinexaHealth's GLP-1, longevity, and sexual health product lines.

## What this is (and isn't)

v1 is formula-based, not camera/CV-based. It uses standard, citable
equations (Mifflin-St Jeor for BMR, the U.S. Navy circumference method for
body-fat %) rather than an ML model predicting health metrics from photos.
This is intentional: photo-based body-fat estimation is unreliable and
marketing it as "AI-diagnosed" health data is legally risky for a company
selling prescription-adjacent products. See the compliance notes below
before adding a camera-based v2.

## Flow

1. `/` — landing page, CTA into the scan
2. `/scan` — form (sex, age, height, weight, activity, goal; optional
   waist/neck/hip to unlock body-fat %)
3. `/results` — shows BMI immediately, gates the full report (calories,
   macros, body-fat %, trend, recommendation) behind an email capture
4. `POST /api/lead` — logs the captured lead server-side (**stub** — wire
   this to a real ESP/CRM, e.g. Klaviyo or HubSpot, before launch)

Scan history is stored in `localStorage` per browser (`lib/storage.ts`) so
returning users see a trend line. This is a demo-grade store — swap for a
real database + auth before shipping to production so history survives
across devices.

## Run locally

```bash
npm install
npm run dev
```

## Before production launch

- Replace the `/api/lead` stub with a real ESP/CRM integration and persist
  scans in a database tied to an authenticated user, not `localStorage`.
- Legal review of all on-page copy — avoid "diagnose," "detect," or
  "medical-grade" language; this is a wellness/educational tool.
- If advertising GLP-1s specifically, add required risk disclosures per
  FDA prescription drug advertising rules.
- Sexual health / weight-loss ad targeting is restricted on Meta/Google —
  confirm ad account certification before running paid traffic here.
- Add a privacy policy covering health-data handling (many states, e.g.
  Washington's My Health My Data Act, treat this as sensitive data even
  outside HIPAA) and get explicit consent before storing any scan data.
