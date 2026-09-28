export type Sex = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type Goal = "lose" | "maintain" | "gain";

export interface ScanInput {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  waistCm?: number;
  neckCm?: number;
  hipCm?: number;
}

export interface ScanResult {
  bmi: number;
  bmiCategory: string;
  bodyFatPercent: number | null;
  bmr: number;
  tdee: number;
  calorieTarget: number;
  macros: { proteinG: number; carbsG: number; fatG: number };
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENT: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

export function calculateBmi(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy range";
  if (bmi < 30) return "Overweight";
  return "Obesity range";
}

/**
 * U.S. Navy circumference method. Requires waist + neck (+ hip for females).
 * Returns null when the inputs needed for this sex aren't provided.
 */
export function calculateBodyFatPercent(input: ScanInput): number | null {
  const { sex, heightCm, waistCm, neckCm, hipCm } = input;
  if (!waistCm || !neckCm) return null;
  if (sex === "female" && !hipCm) return null;

  if (sex === "male") {
    const val =
      495 /
        (1.0324 -
          0.19077 * Math.log10(waistCm - neckCm) +
          0.15456 * Math.log10(heightCm)) -
      450;
    return round1(val);
  }

  const val =
    495 /
      (1.29579 -
        0.35004 * Math.log10(waistCm + (hipCm as number) - neckCm) +
        0.221 * Math.log10(heightCm)) -
    450;
  return round1(val);
}

/** Mifflin-St Jeor equation. */
export function calculateBmr(input: ScanInput): number {
  const { sex, age, heightCm, weightKg } = input;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export function calculateTdee(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

export function calculateCalorieTarget(tdee: number, goal: Goal): number {
  return Math.round(tdee + GOAL_ADJUSTMENT[goal]);
}

export function calculateMacros(calorieTarget: number, weightKg: number) {
  // 1.8g/kg protein (mid-range for active adults), 30% of remaining calories
  // from fat, the rest from carbs.
  const proteinG = Math.round(weightKg * 1.8);
  const proteinKcal = proteinG * 4;
  const fatKcal = calorieTarget * 0.3;
  const fatG = Math.round(fatKcal / 9);
  const carbsKcal = Math.max(calorieTarget - proteinKcal - fatKcal, 0);
  const carbsG = Math.round(carbsKcal / 4);
  return { proteinG, carbsG, fatG };
}

export function runScan(input: ScanInput): ScanResult {
  const bmi = round1(calculateBmi(input.heightCm, input.weightKg));
  const bmr = Math.round(calculateBmr(input));
  const tdee = Math.round(calculateTdee(bmr, input.activityLevel));
  const calorieTarget = calculateCalorieTarget(tdee, input.goal);

  return {
    bmi,
    bmiCategory: bmiCategory(bmi),
    bodyFatPercent: calculateBodyFatPercent(input),
    bmr,
    tdee,
    calorieTarget,
    macros: calculateMacros(calorieTarget, input.weightKg),
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
