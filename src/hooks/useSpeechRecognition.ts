import { useState, useEffect, useCallback, useRef } from "react";

// Post-process transcript to fix common speech recognition errors
const postProcessTranscript = (text: string): string => {
  let processed = text;

  // Common homophones and corrections for technical terms
  const corrections: Record<string, string> = {
    // Common tech terms
    "Jay script": "JavaScript",
    "javascript": "JavaScript",
    "react": "React",
    "node": "Node",
    "G I T": "Git",
    "get": "Git", // when talking about version control
    "github": "GitHub",
    "CS S": "CSS",
    "H T M L": "HTML",
    // Common words
    "their": "there", // context-dependent, but "there" is more common in technical explanations
    "too": "to",
    "its": "it's",
  };

  // Apply corrections (case-insensitive)
  Object.entries(corrections).forEach(([wrong, right]) => {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
    processed = processed.replace(regex, right);
  });

  // Ensure first letter is capitalized
  if (processed.length > 0) {
    processed = processed.charAt(0).toUpperCase() + processed.slice(1);
  }

  // Fix spacing around punctuation
  processed = processed.replace(/\s+([.,!?])/g, '$1');
  processed = processed.replace(/([.,!?])(\w)/g, '$1 $2');

  return processed;
};

interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldRestartRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile
    const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent);
    setIsMobile(mobile);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    console.log("🎤 Speech Recognition Check:", {
      available: !!SpeechRecognition,
      mobile,
      userAgent: navigator.userAgent
    });

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();

      // Optimized settings for maximum accuracy
      recognition.continuous = !mobile;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      // Request 5 alternatives for best accuracy
      try {
        recognition.maxAlternatives = 5;
        console.log("✅ maxAlternatives set to 5");
      } catch (e) {
        console.log("⚠️ maxAlternatives not supported, using default (1)");
      }

      recognition.onstart = () => {
        console.log("🎤 Speech recognition started");
        setError(null);
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        console.log("🎤 Got speech result, event index:", event.resultIndex, "results length:", event.results.length);
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];

          // Log alternatives for debugging
          if (result.length > 1) {
            console.log("🔍 Alternatives:", Array.from({ length: result.length }, (_, j) => ({
              text: result[j].transcript,
              confidence: ((result[j].confidence || 0) * 100).toFixed(1) + "%"
            })));
          }

          // Select best alternative by confidence
          let bestTranscript = result[0].transcript;
          let bestConfidence = result[0].confidence || 0;

          for (let j = 1; j < result.length; j++) {
            const alt = result[j];
            const conf = alt.confidence || 0;
            if (conf > bestConfidence) {
              bestTranscript = alt.transcript;
              bestConfidence = conf;
              console.log(`🎯 Switched to alternative ${j}: "${bestTranscript}" (${(conf * 100).toFixed(1)}%)`);
            }
          }

          // Apply post-processing
          const cleaned = postProcessTranscript(bestTranscript);

          if (result.isFinal) {
            console.log("✅ Final:", cleaned, `(confidence: ${(bestConfidence * 100).toFixed(1)}%)`);
            const needsSpace = finalTranscriptRef.current.length > 0 &&
              !finalTranscriptRef.current.endsWith(" ");
            finalTranscriptRef.current += (needsSpace ? " " : "") + cleaned;
          } else {
            interimTranscript += cleaned;
          }
        }

        const combinedTranscript = finalTranscriptRef.current +
          (interimTranscript && finalTranscriptRef.current ? " " : "") +
          interimTranscript;

        setTranscript(combinedTranscript);
      };

      recognition.onerror = (event) => {
        console.error("🎤 Speech recognition error:", event.error);

        // Provide user-friendly error messages
        let errorMessage = "";
        switch (event.error) {
          case "not-allowed":
          case "permission-denied":
            errorMessage = "Microphone permission denied. Please allow microphone access in your browser settings.";
            shouldRestartRef.current = false;
            setIsListening(false);
            break;
          case "no-speech":
            errorMessage = "No speech detected. Please try speaking.";
            // On mobile, don't show error for no-speech, just continue
            if (mobile) {
              return;
            }
            break;
          case "audio-capture":
            errorMessage = "No microphone found. Please connect a microphone and try again.";
            shouldRestartRef.current = false;
            setIsListening(false);
            break;
          case "network":
            errorMessage = "Network error. Speech recognition requires an internet connection.";
            break;
          case "aborted":
            // User stopped, not an error
            console.log("🎤 Recognition aborted by user");
            return;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }

        if (errorMessage) {
          setError(errorMessage);
        }

        // Auto-restart on recoverable errors (but not permission issues)
        if (shouldRestartRef.current &&
          event.error !== "not-allowed" &&
          event.error !== "permission-denied" &&
          event.error !== "audio-capture") {
          setTimeout(() => {
            if (shouldRestartRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
                console.log("🎤 Auto-restarting speech recognition after error");
              } catch (e) {
                console.error("Failed to restart:", e);
                setIsListening(false);
              }
            }
          }, 500);
        } else if (event.error === "not-allowed" || event.error === "permission-denied" || event.error === "audio-capture") {
          setIsListening(false);
          shouldRestartRef.current = false;
        }
      };

      recognition.onend = () => {
        console.log("🎤 Speech recognition ended, shouldRestart:", shouldRestartRef.current);

        // Auto-restart if still supposed to be listening (for mobile Safari and continuous mode)
        if (shouldRestartRef.current) {
          setTimeout(() => {
            if (shouldRestartRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
                console.log("🎤 Auto-restarting speech recognition (continuous mode)");
              } catch (e: any) {
                console.error("Failed to restart:", e);
                // If we can't restart, stop trying
                if (e.name === "InvalidStateError") {
                  console.log("🎤 Recognition still active, not restarting");
                } else {
                  setIsListening(false);
                  shouldRestartRef.current = false;
                  setError("Speech recognition stopped unexpectedly. Please try again.");
                }
              }
            }
          }, 100);
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    } else {
      console.error("❌ Speech Recognition not supported in this browser");
      setError("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
    }

    return () => {
      shouldRestartRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    console.log("🎤 startListening called, isListening:", isListening, "isSupported:", isSupported);

    if (!isSupported) {
      setError("Speech recognition is not supported in your browser.");
      return;
    }

    if (recognitionRef.current && !isListening) {
      try {
        finalTranscriptRef.current = "";
        setTranscript("");
        setError(null);
        shouldRestartRef.current = true;
        recognitionRef.current.start();
        console.log("🎤 Recognition started successfully");
      } catch (e: any) {
        console.error("Failed to start speech recognition:", e);
        if (e.name === "InvalidStateError") {
          // Already started, just update state
          setIsListening(true);
        } else {
          setError("Failed to start speech recognition. Please try again.");
        }
      }
    }
  }, [isListening, isSupported]);

  const stopListening = useCallback(() => {
    console.log("🎤 stopListening called");

    if (recognitionRef.current && isListening) {
      shouldRestartRef.current = false;
      try {
        recognitionRef.current.stop();
        console.log("🎤 Recognition stopped successfully");
      } catch (e) {
        console.error("Failed to stop speech recognition:", e);
      }
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    console.log("🎤 resetTranscript called");
    finalTranscriptRef.current = "";
    setTranscript("");
    setError(null);
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
};
