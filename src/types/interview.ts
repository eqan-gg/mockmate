export interface Evaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface QuestionResponse {
  question: string;
  evaluation: Evaluation;
  next_action: string;
}

export interface FinalResult {
  overall_score: number;
  level: "Beginner" | "Intermediate" | "Strong";
  summary: string;
  strong_areas: string[];
  weak_areas: string[];
  recommendations: string[];
}

export interface InterviewState {
  currentQuestion: number;
  questions: QuestionResponse[];
  answers: string[];
  isComplete: boolean;
  finalResult: FinalResult | null;
}
