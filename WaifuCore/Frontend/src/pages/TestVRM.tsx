import React, { useState } from "react";
import VRMViewer from "../components/ananya/VRMViewer";
import ActionsPanel from "../components/ananya/ActionsPanel";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

const TestVRM = () => {
  const [emotion, setEmotion] = useState("neutral");
  const [characterState, setCharacterState] = useState<"idle" | "speaking" | "thinking">("idle");
  const [activeEmotion, setActiveEmotion] = useState<string | null>(null);

  const handleEmotionChange = (actionName: string) => {
    if (actionName === 'stop-spin') {
      // Stop spinning but keep current emotion
      setActiveEmotion('stop-spin');
    } else {
      // Update emotion for all other actions
      setEmotion(actionName);
      // Clear active emotion so it doesn't interfere
      setActiveEmotion(null);
    }
  };

  const toggleSpeaking = () => {
    setCharacterState(prev => prev === "speaking" ? "idle" : "speaking");
  };

  const toggleThinking = () => {
    setCharacterState(prev => prev === "thinking" ? "idle" : "thinking");
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">VRM Expression & Spin Test</h1>
        <p className="text-lg text-gray-600">
          Test Ananya's facial expressions, mouth movements, and spinning animation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 3D Avatar Section */}
        <div className="lg:col-span-3">
          <Card className="backdrop-blur-lg bg-white/90 border border-gray-200 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Ananya - Expressions & Spinning</span>
                <div className="flex gap-2">
                  <Badge variant={emotion === "neutral" ? "default" : "secondary"}>
                    {emotion}
                  </Badge>
                  <Badge variant={characterState === "idle" ? "secondary" : "default"}>
                    {characterState}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <VRMViewer 
                characterState={characterState} 
                emotion={emotion} 
                actionAnimation={activeEmotion}
                className="h-[400px] md:h-[500px] lg:h-[600px] rounded-lg"
              />
            </CardContent>
          </Card>
        </div>

        {/* Controls Section */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Expression Panel */}
            <ActionsPanel 
              onPlayAnimation={handleEmotionChange}
              isPlaying={false} // Buttons should always be available
            />
            
            {/* State Controls */}
            <Card className="backdrop-blur-lg bg-white/80 border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
                <CardTitle className="text-lg">Character State</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Button
                    variant={characterState === "speaking" ? "default" : "outline"}
                    onClick={toggleSpeaking}
                    className="w-full"
                  >
                    {characterState === "speaking" ? <VolumeX className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />}
                    {characterState === "speaking" ? "Stop Speaking" : "Start Speaking"}
                  </Button>
                  
                  <Button
                    variant={characterState === "thinking" ? "default" : "outline"}
                    onClick={toggleThinking}
                    className="w-full"
                  >
                    🤔 {characterState === "thinking" ? "Stop Thinking" : "Start Thinking"}
                  </Button>
                  
                  <Button
                    variant={characterState === "idle" ? "default" : "outline"}
                    onClick={() => setCharacterState("idle")}
                    className="w-full"
                  >
                    😐 Idle State
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="backdrop-blur-lg bg-white/80 border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
                <CardTitle className="text-lg">Test Features</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div>✅ Facial expressions</div>
                  <div>✅ Enhanced lip sync</div>
                  <div>✅ Natural blinking</div>
                  <div>✅ Eye tracking</div>
                  <div>✅ Continuous spinning</div>
                  <div>❌ Other body movements</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestVRM;
