import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import type { Evaluation } from "@/types/interview";

interface FeedbackCardProps {
  evaluation: Evaluation;
  onNext: () => void;
  isLastQuestion: boolean;
}

export const FeedbackCard = ({ evaluation, onNext, isLastQuestion }: FeedbackCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-success";
    if (score >= 4) return "text-warning";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return "Excellent";
    if (score >= 7) return "Good";
    if (score >= 4) return "Fair";
    return "Needs Work";
  };

  return (
    <Card className="border-2 border-accent/30 bg-card shadow-soft animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Evaluation
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className={`text-3xl font-bold ${getScoreColor(evaluation.score)}`}>
              {evaluation.score}
            </span>
            <span className="text-muted-foreground">/ 10</span>
            <Badge className={`ml-2 ${getScoreColor(evaluation.score)} bg-current/10`}>
              {getScoreLabel(evaluation.score)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-foreground">{evaluation.feedback}</p>

        {evaluation.strengths.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-success flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Strengths
            </h4>
            <ul className="space-y-1 ml-6">
              {evaluation.strengths.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground list-disc">{s}</li>
              ))}
            </ul>
          </div>
        )}

        {evaluation.improvements.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-warning flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Areas to Improve
            </h4>
            <ul className="space-y-1 ml-6">
              {evaluation.improvements.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground list-disc">{s}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={onNext}
          className="w-full mt-4 py-3 px-4 min-h-[44px] rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors touch-manipulation"
        >
          {isLastQuestion ? "See Final Results" : "Next Question"}
        </button>
      </CardContent>
    </Card>
  );
};
