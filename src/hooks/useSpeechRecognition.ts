import { useState, useEffect, useCallback, useRef } from "react";

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

      // Mobile-optimized settings
      recognition.continuous = !mobile; // iOS Safari works better with continuous=false
      recognition.interimResults = true;
      recognition.lang = "en-US";

      // Only set maxAlternatives if supported
      try {
        recognition.maxAlternatives = 1;
      } catch (e) {
        console.log("⚠️ maxAlternatives not supported");
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
          const transcriptPiece = result[0].transcript;

          if (result.isFinal) {
            console.log("✅ Final transcript piece:", transcriptPiece);
            // Add space before new sentence if needed
            const needsSpace = finalTranscriptRef.current.length > 0 &&
              !finalTranscriptRef.current.endsWith(" ");
            finalTranscriptRef.current += (needsSpace ? " " : "") + transcriptPiece;
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        // Combine final and interim transcripts with proper spacing
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
