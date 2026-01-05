import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Code2, Volume2, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTTSFree } from "@/hooks/useTTSFree";

interface QuestionCardProps {
  questionNumber: number;
  question: string;
  topic: string;
  difficulty: string;
  autoSpeak?: boolean;
}

export const QuestionCard = ({ questionNumber, question, topic, difficulty, autoSpeak = true }: QuestionCardProps) => {
  const { speak, stop, isSpeaking, isLoading } = useTTSFree();

  // Auto-speak question when component mounts or question changes (only if autoSpeak is true)
  useEffect(() => {
    if (!autoSpeak) return;

    // Small delay to let the UI render first
    const timer = setTimeout(() => {
      speak(question);
    }, 500);
    return () => {
      clearTimeout(timer);
      stop();
    };
  }, [questionNumber, question, autoSpeak]);

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "easy": return "bg-success/10 text-success border-success/20";
      case "medium": return "bg-warning/10 text-warning border-warning/20";
      case "challenging": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleToggleSpeak = () => {
    if (isSpeaking || isLoading) {
      stop();
    } else {
      speak(question);
    }
  };

  return (
    <Card className="border-2 border-primary/20 shadow-soft animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground">Question {questionNumber}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 touch-manipulation"
              onClick={handleToggleSpeak}
              disabled={isLoading}
              title={isSpeaking ? "Stop reading" : isLoading ? "Loading..." : "Read question aloud"}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : isSpeaking ? (
                <VolumeX className="w-4 h-4 text-primary animate-pulse" />
              ) : (
                <Volume2 className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="font-normal">
              {topic}
            </Badge>
            <Badge variant="outline" className={getDifficultyColor(difficulty)}>
              {difficulty}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-lg leading-relaxed text-foreground">{question}</p>
        {(isSpeaking || isLoading) && (
          <div className="flex items-center gap-2 mt-3 text-sm text-primary">
            <div className="flex gap-1">
              <span className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
              <span className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
              <span className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
            </div>
            <span>{isLoading ? "Preparing voice..." : "Speaking..."}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
