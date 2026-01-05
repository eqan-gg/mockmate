import { useCallback, useRef, useState } from "react";

interface UseTTSFreeReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isLoading: boolean;
}

export const useTTSFree = (): UseTTSFreeReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    stop();
    setIsLoading(true);

    // iOS/Safari fix: Create and play a silent audio object immediately to "unlock" audio
    // during the user gesture, before the async fetch happens.
    const unlockAudio = new Audio();
    unlockAudio.play().catch(() => { });

    try {
      // We skip fetching the voice list because some API keys lack the 'voices_read' permission.
      // We'll use the voice ID you set in server.js/api/tts.js.
      const voiceId = "pNInz6obpgDQGcFmaJgB";
      console.log(`🎙️ Using voice via Vercel proxy: (${voiceId})`);

      const response = await fetch(`/api/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, voiceId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(`Backend TTS error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      console.log("✅ Audio received from proxy, creating playback URL...");
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio();
      audio.src = audioUrl;
      audioRef.current = audio;

      audio.onplay = () => {
        setIsLoading(false);
        setIsSpeaking(true);
        console.log("🗣️ Audio playback started");
      };

      audio.onended = () => {
        setIsSpeaking(false);
        console.log("✅ Audio playback ended");
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = (e) => {
        console.error("❌ Audio playback error event:", e);
        setIsSpeaking(false);
        setIsLoading(false);
        URL.revokeObjectURL(audioUrl);
      };

      // For iOS/Safari: Mobile browsers often require a play() call to be very close to the user interaction.
      // Since we had a fetch() in between, we'll try to play it now.
      await audio.play();
    } catch (error) {
      console.error("❌ Detailed TTS error:", error);
      setIsLoading(false);
      setIsSpeaking(false);
    }
  }, [stop]);

  return { speak, stop, isSpeaking, isLoading };
};
