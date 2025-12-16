import { useState } from "react";
import { WelcomeScreen } from "@/components/interview/WelcomeScreen";
import { ProgressBar } from "@/components/interview/ProgressBar";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { AnswerInput } from "@/components/interview/AnswerInput";
import { FeedbackCard } from "@/components/interview/FeedbackCard";
import { ResultsCard } from "@/components/interview/ResultsCard";
import { DiagnosticsPanel } from "@/components/DiagnosticsPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { interviewQuestions, evaluateAnswer, calculateFinalResult } from "@/data/interviewQuestions";
import type { Evaluation, FinalResult } from "@/types/interview";

type InterviewPhase = "welcome" | "question" | "feedback" | "results";

const Index = () => {
  const [phase, setPhase] = useState<InterviewPhase>("welcome");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<Evaluation | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [finalResult, setFinalResult] = useState<FinalResult | null>(null);

  const handleStart = () => {
    setPhase("question");
    setCurrentQuestion(0);
    setScores([]);
    setAnswer("");
  };

  const handleSubmit = () => {
    if (!answer.trim()) return;

    setIsLoading(true);

    // Simulate evaluation delay for better UX
    setTimeout(() => {
      const evaluation = evaluateAnswer(currentQuestion, answer);
      setCurrentEvaluation(evaluation);
      setScores(prev => [...prev, evaluation.score]);
      setIsLoading(false);
      setPhase("feedback");
    }, 1000);
  };

  const handleNext = () => {
    if (currentQuestion >= interviewQuestions.length - 1) {
      // Calculate final results
      const allScores = [...scores];
      const result = calculateFinalResult(allScores);
      setFinalResult(result);
      setPhase("results");
    } else {
      setCurrentQuestion(prev => prev + 1);
      setAnswer("");
      setCurrentEvaluation(null);
      setPhase("question");
    }
  };

  const handleRestart = () => {
    setPhase("welcome");
    setCurrentQuestion(0);
    setAnswer("");
    setScores([]);
    setCurrentEvaluation(null);
    setFinalResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl py-8 px-4">
        {/* Header */}
        <header className="mb-8">
          {phase !== "welcome" && phase !== "results" && (
            <ProgressBar current={currentQuestion + 1} total={interviewQuestions.length} />
          )}
        </header>

        {/* Main Content */}
        <main>
          {phase === "welcome" && (
            <WelcomeScreen onStart={handleStart} />
          )}

          {phase === "question" && (
            <div className="space-y-6">
              <QuestionCard
                questionNumber={currentQuestion + 1}
                question={interviewQuestions[currentQuestion].question}
                topic={interviewQuestions[currentQuestion].topic}
                difficulty={interviewQuestions[currentQuestion].difficulty}
              />
              <AnswerInput
                value={answer}
                onChange={setAnswer}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          )}

          {phase === "feedback" && currentEvaluation && (
            <div className="space-y-6">
              <QuestionCard
                questionNumber={currentQuestion + 1}
                question={interviewQuestions[currentQuestion].question}
                topic={interviewQuestions[currentQuestion].topic}
                difficulty={interviewQuestions[currentQuestion].difficulty}
                autoSpeak={false}
              />
              <FeedbackCard
                evaluation={currentEvaluation}
                onNext={handleNext}
                isLastQuestion={currentQuestion >= interviewQuestions.length - 1}
              />
            </div>
          )}

          {phase === "results" && finalResult && (
            <ResultsCard
              result={finalResult}
              scores={scores}
              onRestart={handleRestart}
            />
          )}
        </main>
      </div>

      {/* Diagnostics Panel for debugging mobile issues */}
      <DiagnosticsPanel />
    </div>
  );
};

export default Index;
