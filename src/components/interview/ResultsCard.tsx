import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Lightbulb, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import type { FinalResult } from "@/types/interview";

interface ResultsCardProps {
  result: FinalResult;
  scores: number[];
  onRestart: () => void;
}

export const ResultsCard = ({ result, scores, onRestart }: ResultsCardProps) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "Strong": return "bg-success text-success-foreground";
      case "Intermediate": return "bg-warning text-warning-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-success";
    if (score >= 4) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Result Card */}
      <Card className="border-2 border-primary/30 shadow-medium overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-primary" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Interview Complete!</h2>
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl font-bold text-gradient">{result.overall_score}</span>
            <span className="text-2xl text-muted-foreground">/ 10</span>
          </div>
          <Badge className={`mt-3 text-base px-4 py-1 ${getLevelColor(result.level)}`}>
            {result.level} Level
          </Badge>
        </div>
        <CardContent className="p-6">
          <p className="text-foreground text-center">{result.summary}</p>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <Card className="border shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Score Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {["CSS Styling", "Semantic HTML", "JavaScript Variables", "React State/Props", "CSS Box Model"].map((topic, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Q{i + 1}: {topic}</span>
                <span className={`font-semibold ${getScoreColor(scores[i])}`}>
                  {scores[i]}/10
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-4">
        {result.strong_areas.length > 0 && (
          <Card className="border shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-success">
                <CheckCircle2 className="w-4 h-4" />
                Strong Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {result.strong_areas.map((area, i) => (
                  <li key={i} className="text-sm text-muted-foreground">• {area}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {result.weak_areas.length > 0 && (
          <Card className="border shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-warning">
                <XCircle className="w-4 h-4" />
                Needs Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {result.weak_areas.map((area, i) => (
                  <li key={i} className="text-sm text-muted-foreground">• {area}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recommendations */}
      <Card className="border shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-warning" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-1">→</span>
                {rec}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Restart Button */}
      <button
        onClick={onRestart}
        className="w-full py-4 px-4 min-h-[44px] rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2 touch-manipulation"
      >
        <RotateCcw className="w-4 h-4" />
        Start New Interview
      </button>
    </div>
  );
};
