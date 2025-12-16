import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, MicOff, AlertCircle } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface AnswerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const AnswerInput = ({ value, onChange, onSubmit, isLoading }: AnswerInputProps) => {
  const { transcript, isListening, isSupported, error, startListening, stopListening, resetTranscript } = useSpeechRecognition();
  const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent);

  useEffect(() => {
    if (transcript) {
      onChange(transcript);
    }
  }, [transcript, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      onSubmit();
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      onChange("");
      startListening();
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Textarea
          placeholder={isListening ? "Listening... Speak your answer clearly." : "Type your answer or click the microphone to speak..."}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[150px] resize-none text-base bg-card border-2 focus:border-primary/50 pr-14 touch-manipulation"
          disabled={isLoading || isListening}
        />
        {isSupported && (
          <Button
            type="button"
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            className="absolute top-3 right-3 touch-manipulation"
            onClick={handleVoiceToggle}
            disabled={isLoading}
            title={isListening ? "Stop recording" : "Start voice input"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {isListening && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-destructive rounded-full animate-pulse" />
            <div className="w-1 h-4 bg-destructive rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="w-1 h-4 bg-destructive rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
          <span className="font-medium">Recording... Tap microphone to stop</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!isSupported && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Voice input not supported in this browser. Please type your answer.</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="text-sm text-muted-foreground">
          {isSupported ? "Use voice or type • Ctrl + Enter to submit" : "Press Ctrl + Enter to submit"}
          {isSupported && mobile && (
            <span className="block text-xs mt-1 text-primary">
              💡 Pro tip: Speak in complete sentences, pause naturally, and check the transcript before submitting
            </span>
          )}
        </span>
        <Button
          onClick={onSubmit}
          disabled={!value.trim() || isLoading || isListening}
          className="gap-2 touch-manipulation min-h-[44px]"
        >
          {isLoading ? (
            <span className="animate-pulse-soft">Evaluating...</span>
          ) : (
            <>
              Submit Answer
              <Send className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
