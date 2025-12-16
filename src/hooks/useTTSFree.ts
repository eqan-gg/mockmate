import { useCallback, useEffect, useRef, useState } from "react";

interface UseTTSFreeReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isLoading: boolean;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
}

export const useTTSFree = (): UseTTSFreeReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect iOS and mobile devices
    const userAgent = navigator.userAgent.toLowerCase();
    const iOS = /ipad|iphone|ipod/.test(userAgent);
    const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    setIsIOS(iOS);
    setIsMobile(mobile);

    console.log("📱 Device Detection:", { iOS, mobile, userAgent: navigator.userAgent });
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    stop();
    setIsLoading(true);

    // Wait for voices to load with timeout
    const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
      return new Promise((resolve) => {
        let voices = window.speechSynthesis.getVoices();

        if (voices.length > 0) {
          console.log(`🎙️ Voices loaded immediately: ${voices.length} voices`);
          resolve(voices);
        } else {
          // Set a timeout in case voices never load
          const timeout = setTimeout(() => {
            voices = window.speechSynthesis.getVoices();
            console.log(`🎙️ Voices loaded after timeout: ${voices.length} voices`);
            resolve(voices);
          }, 1000);

          window.speechSynthesis.onvoiceschanged = () => {
            clearTimeout(timeout);
            voices = window.speechSynthesis.getVoices();
            console.log(`🎙️ Voices loaded via onvoiceschanged: ${voices.length} voices`);
            resolve(voices);
          };
        }
      });
    };

    try {
      const voices = await getVoices();
      setAvailableVoices(voices);

      // Log all available voices for debugging
      console.log("📢 Available voices:", voices.map(v => ({
        name: v.name,
        lang: v.lang,
        default: v.default,
        localService: v.localService
      })));

      // Enhanced voice selection with mobile-specific priorities
      let preferredVoice: SpeechSynthesisVoice | undefined;

      if (isMobile) {
        // Mobile-specific voice selection
        console.log("📱 Using mobile voice selection strategy");
        preferredVoice =
          // iOS often has good Samantha/Karen voices
          voices.find((voice) =>
            voice.lang.startsWith("en") &&
            (voice.name.includes("Samantha") || voice.name.includes("Karen"))
          ) ||
          // Google voices on Android
          voices.find((voice) =>
            voice.lang.startsWith("en") &&
            voice.name.includes("Google") &&
            (voice.name.includes("US") || voice.name.includes("UK"))
          ) ||
          // Any default en-US voice
          voices.find((voice) => voice.lang === "en-US" && voice.default) ||
          // Any en-US voice
          voices.find((voice) => voice.lang.startsWith("en-US")) ||
          // Any English voice
          voices.find((voice) => voice.lang.startsWith("en"));
      } else {
        // Desktop voice selection
        console.log("💻 Using desktop voice selection strategy");
        preferredVoice =
          // Google voices (usually highest quality)
          voices.find((voice) =>
            voice.lang.startsWith("en") &&
            voice.name.includes("Google") &&
            (voice.name.includes("US") || voice.name.includes("UK"))
          ) ||
          // Natural/Premium/Enhanced voices
          voices.find((voice) =>
            voice.lang.startsWith("en") &&
            (voice.name.includes("Natural") || voice.name.includes("Premium") || voice.name.includes("Enhanced"))
          ) ||
          // Microsoft voices
          voices.find((voice) =>
            voice.lang.startsWith("en") &&
            voice.name.includes("Microsoft") && voice.name.includes("Natural")
          ) ||
          // Default en-US voice
          voices.find((voice) => voice.lang === "en-US" && voice.default) ||
          // Any en-US voice
          voices.find((voice) => voice.lang.startsWith("en-US")) ||
          // Any English voice
          voices.find((voice) => voice.lang.startsWith("en"));
      }

      // Store selected voice
      setSelectedVoice(preferredVoice || null);

      // Log selected voice with all details
      console.log("🎙️ TTS Voice Selected:", {
        name: preferredVoice?.name || "Default (browser will choose)",
        lang: preferredVoice?.lang || "default",
        localService: preferredVoice?.localService,
        default: preferredVoice?.default,
        isMobile,
        isIOS
      });

      // For iOS, we need to chunk long text to avoid speech stopping mid-sentence
      const chunks = isIOS && text.length > 200
        ? text.match(/.{1,200}(?:\s|$)/g) || [text]
        : [text];

      console.log(`📝 Text chunks: ${chunks.length}`);

      const speakChunk = (chunkIndex: number) => {
        if (chunkIndex >= chunks.length) {
          setIsSpeaking(false);
          utteranceRef.current = null;
          return;
        }

        const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        // Optimized settings for natural speech
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
          if (chunkIndex === 0) {
            setIsLoading(false);
            setIsSpeaking(true);
            console.log("🗣️ Started speaking");
          }
        };

        utterance.onend = () => {
          console.log(`✅ Finished chunk ${chunkIndex + 1}/${chunks.length}`);
          // Speak next chunk
          if (chunkIndex < chunks.length - 1) {
            // Small delay between chunks for better iOS compatibility
            setTimeout(() => speakChunk(chunkIndex + 1), isIOS ? 100 : 0);
          } else {
            setIsSpeaking(false);
            utteranceRef.current = null;
            console.log("✅ Finished speaking all chunks");
          }
        };

        utterance.onerror = (event) => {
          console.error("❌ TTS error:", {
            error: event.error,
            chunkIndex,
            voice: preferredVoice?.name
          });
          setIsSpeaking(false);
          setIsLoading(false);
          utteranceRef.current = null;
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      };

      // Start speaking the first chunk
      speakChunk(0);
    } catch (error) {
      console.error("❌ TTS error:", error);
      setIsLoading(false);
    }
  }, [stop, isIOS, isMobile]);

  return { speak, stop, isSpeaking, isLoading, availableVoices, selectedVoice };
};
