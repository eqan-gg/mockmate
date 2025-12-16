import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code2, Timer, Target, Sparkles, Mic, GitBranch } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  const topics = [
    "HTML Fundamentals",
    "CSS Fundamentals",
    "JavaScript Basics",
    "Git & GitHub"
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Code2 className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-foreground">
          Frontend Interview
          <span className="text-gradient"> Practice</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Test your frontend knowledge with a realistic mock interview experience designed for students.
        </p>
      </div>

      <Card className="border-2 border-border shadow-soft">
        <CardContent className="p-6 space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <Timer className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="font-medium text-foreground">10 Questions</p>
              <p className="text-sm text-muted-foreground">~15-20 minutes</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <Target className="w-6 h-6 mx-auto mb-2 text-accent" />
              <p className="font-medium text-foreground">Beginner-Friendly</p>
              <p className="text-sm text-muted-foreground">Easy to Medium</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-warning" />
              <p className="font-medium text-foreground">Voice-Enabled</p>
              <p className="text-sm text-muted-foreground">Speak or type</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-3">Topics Covered</h3>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <Badge key={topic} variant="outline" className="font-normal">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
              <Mic className="w-4 h-4 text-primary" />
              Voice-Enabled Interview
            </h4>
            <ol className="text-sm text-muted-foreground space-y-1">
              <li>1. You&apos;ll receive one question at a time</li>
              <li>2. <strong>Speak</strong> or type your answer</li>
              <li>3. Get instant evaluation and feedback</li>
              <li>4. See your final score and recommendations</li>
            </ol>
          </div>

          <button
            onClick={onStart}
            className="w-full py-4 px-6 min-h-[56px] rounded-lg bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all hover:shadow-medium touch-manipulation"
          >
            Start Interview
          </button>
        </CardContent>
      </Card>
    </div>
  );
};
