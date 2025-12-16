import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, ChevronDown, ChevronUp, Volume2, Mic } from "lucide-react";
import { useTTSFree } from "@/hooks/useTTSFree";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

export const DiagnosticsPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { availableVoices, selectedVoice, speak } = useTTSFree();
    const { isSupported, isListening, transcript, startListening, stopListening, resetTranscript } = useSpeechRecognition();

    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent);
    const isIOS = /ipad|iphone|ipod/.test(navigator.userAgent.toLowerCase());

    const testTTS = () => {
        speak("Hello! This is a test of the text to speech system.");
    };

    const testSpeechRecognition = () => {
        if (isListening) {
            stopListening();
        } else {
            resetTranscript();
            startListening();
        }
    };

    if (!isOpen) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-50 touch-manipulation shadow-lg"
            >
                <Settings className="w-4 h-4 mr-2" />
                Diagnostics
                <ChevronUp className="w-4 h-4 ml-2" />
            </Button>
        );
    }

    return (
        <Card className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] shadow-xl">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Voice Diagnostics
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                    >
                        <ChevronDown className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                {/* Device Info */}
                <div>
                    <h4 className="font-medium mb-2">Device</h4>
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Mobile:</span>
                            <Badge variant={isMobile ? "default" : "secondary"}>
                                {isMobile ? "Yes" : "No"}
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">iOS:</span>
                            <Badge variant={isIOS ? "default" : "secondary"}>
                                {isIOS ? "Yes" : "No"}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* TTS Section */}
                <div>
                    <h4 className="font-medium mb-2">Text-to-Speech</h4>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Available Voices:</span>
                            <Badge>{availableVoices.length}</Badge>
                        </div>
                        {selectedVoice && (
                            <div className="bg-muted/50 p-2 rounded space-y-1">
                                <div className="font-medium">{selectedVoice.name}</div>
                                <div className="text-muted-foreground">
                                    Lang: {selectedVoice.lang} |
                                    {selectedVoice.localService ? " Local" : " Remote"} |
                                    {selectedVoice.default ? " Default" : ""}
                                </div>
                            </div>
                        )}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={testTTS}
                            className="w-full touch-manipulation"
                        >
                            <Volume2 className="w-3 h-3 mr-2" />
                            Test TTS
                        </Button>
                    </div>
                </div>

                {/* Speech Recognition Section */}
                <div>
                    <h4 className="font-medium mb-2">Speech Recognition</h4>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Supported:</span>
                            <Badge variant={isSupported ? "default" : "destructive"}>
                                {isSupported ? "Yes" : "No"}
                            </Badge>
                        </div>
                        {isSupported && (
                            <>
                                <Button
                                    size="sm"
                                    variant={isListening ? "destructive" : "outline"}
                                    onClick={testSpeechRecognition}
                                    className="w-full touch-manipulation"
                                >
                                    <Mic className="w-3 h-3 mr-2" />
                                    {isListening ? "Stop Test" : "Test Speech Input"}
                                </Button>
                                {transcript && (
                                    <div className="bg-muted/50 p-2 rounded">
                                        <div className="font-medium mb-1">Transcript:</div>
                                        <div className="text-muted-foreground">{transcript}</div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-primary/5 p-2 rounded text-xs text-muted-foreground">
                    <strong>Tip:</strong> Check browser console (F12) for detailed logs with emoji indicators:
                    🎙️ (TTS), 🎤 (Speech), 📱 (Device), ✅ (Success), ❌ (Error)
                </div>
            </CardContent>
        </Card>
    );
};
