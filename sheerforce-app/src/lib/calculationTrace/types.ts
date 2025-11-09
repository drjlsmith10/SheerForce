export interface CalculationStep {
  stepNumber: number;
  title: string;
  description: string;
  equations: string[];
  result?: string;
}

export interface ReactionCalculationTrace {
  steps: CalculationStep[];
  summary: string;
}
