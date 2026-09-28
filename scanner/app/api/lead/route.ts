import { NextRequest, NextResponse } from "next/server";

export interface LeadPayload {
  email: string;
  phone?: string;
  goal: string;
  bmi: number;
  bmiCategory: string;
}

/**
 * MVP lead capture: logs the lead server-side so it shows up in deployment
 * logs. Swap this for a real ESP/CRM call (Klaviyo, HubSpot, etc.) before
 * launch — do not ship this stub to production as-is.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<LeadPayload>;

  if (!body.email || typeof body.email !== "string") {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  console.log("[lead-capture]", {
    email: body.email,
    phone: body.phone ?? null,
    goal: body.goal ?? null,
    bmi: body.bmi ?? null,
    bmiCategory: body.bmiCategory ?? null,
    capturedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
