
import { QuizAnswers } from '../types';

export const calculatePainScore = (answers: QuizAnswers): number => {
  const avg = (answers['avg-pain'] as number) || answers.avg_pain_level || 0;
  const flare = answers.flare_ups || 0;
  const sleep = (answers['sleep-impact'] || answers.sleep_disruption) ? 1 : 0;
  
  // Calculate mobility impact based on triggers count (max 3 usually)
  const triggersCount = (answers.triggers?.length || 0);
  const mobilityScore = Math.min(triggersCount * 3.3, 10); // Normalize to ~10

  let score = Math.round(
    (avg * 10) * 0.4 +
    (flare * 10) * 0.3 +
    (sleep * 15) +
    (mobilityScore * 1.5)
  );

  return Math.max(0, Math.min(100, score));
};

export const calculateCandidacyScore = (answers: QuizAnswers): number => {
  let score = 100;

  // Prior surgery
  const surgeryType = answers['surgery-type'] as string | undefined;
  const surgeryCheck = answers['surgery-check'] as boolean | undefined;

  if (surgeryType === 'Fusion') score -= 50;
  else if (surgeryCheck) score -= 20;

  // Treatments failed (shows need for advanced therapy, but also difficulty)
  // Actually, for decompression, failed conservative care usually makes them a BETTER candidate
  // because they are "medically necessary" for this step. 
  // However, "No relief" might imply stubborn case. Let's adjust logic to be optimistic for sales.
  if (answers.relief_level === 'No relief') score -= 5; 

  // Positive factors
  if (answers.time_commitment === 'Yes') score += 5;
  
  const avgPain = (answers['avg-pain'] as number) || answers.avg_pain_level;
  if (avgPain && avgPain > 6) score += 5; // Higher pain = higher need

  return Math.max(0, Math.min(100, score));
};

// SVG Coordinates for the Body Map
export const bodyRegions: Record<string, { x: number; y: number; size: number }> = {
  'Neck': { x: 50, y: 20, size: 25 },
  'Mid-back': { x: 50, y: 45, size: 30 },
  'Low-back': { x: 50, y: 65, size: 35 },
  'Buttocks': { x: 50, y: 80, size: 30 },
  'Leg(s)': { x: 65, y: 120, size: 40 }, // Right leg
  'Leg(s)_L': { x: 35, y: 120, size: 40 }, // Left leg visual for same key
};
