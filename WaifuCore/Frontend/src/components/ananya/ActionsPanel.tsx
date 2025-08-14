import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap } from "lucide-react";

interface ActionsPanelProps {
  onPlayAnimation?: (actionName: string) => void;
  isPlaying?: boolean;
}

const ActionsPanel: React.FC<ActionsPanelProps> = ({ onPlayAnimation, isPlaying = false }) => {
  const actions = [
    {
      id: 'happy',
      label: 'Happy',
      icon: '�',
      description: 'Joyful expression',
      color: 'pink',
      bgColor: 'bg-pink-500/10 hover:bg-pink-500/20',
      textColor: 'text-pink-700',
      borderColor: 'border-pink-200'
    },
    {
      id: 'shy',
      label: 'Shy',
      icon: '�',
      description: 'Bashful expression',
      color: 'purple',
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200'
    },
    {
      id: 'thinking',
      label: 'Thinking',
      icon: '🤔',
      description: 'Contemplative look',
      color: 'blue',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    },
    {
      id: 'sad',
      label: 'Sad',
      icon: '😢',
      description: 'Melancholic expression',
      color: 'gray',
      bgColor: 'bg-gray-500/10 hover:bg-gray-500/20',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200'
    },
    {
      id: 'angry',
      label: 'Angry',
      icon: '�',
      description: 'Upset expression',
      color: 'red',
      bgColor: 'bg-red-500/10 hover:bg-red-500/20',
      textColor: 'text-red-700',
      borderColor: 'border-red-200'
    },
    {
      id: 'stop-spin',
      label: 'Stop Spin',
      icon: '�',
      description: 'Stop spinning motion',
      color: 'red',
      bgColor: 'bg-red-500/10 hover:bg-red-500/20',
      textColor: 'text-red-700',
      borderColor: 'border-red-200'
    },
    {
      id: 'neutral',
      label: 'Neutral',
      icon: '😐',
      description: 'Default expression',
      color: 'green',
      bgColor: 'bg-green-500/10 hover:bg-green-500/20',
      textColor: 'text-green-700',
      borderColor: 'border-green-200'
    }
  ];

  const handleActionClick = (emotionId: string) => {
    console.log(`${emotionId} action triggered`);
    onPlayAnimation?.(emotionId);
  };

  return (
    <Card className="backdrop-blur-lg bg-white/80 border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-200">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
          <Sparkles className="h-5 w-5 text-pink-500" />
          Expressions & Actions
        </CardTitle>
        <p className="text-sm text-gray-600">Control Ananya's emotions and movements</p>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* Expression Buttons Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              onClick={() => handleActionClick(action.id)}
              className={`h-16 flex flex-col items-center justify-center gap-1 text-xs ${action.bgColor} ${action.textColor} border ${action.borderColor} hover:scale-105 transition-all duration-200`}
            >
              <span className="text-lg">{action.icon}</span>
              <span className="font-medium">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Status Section */}
        <div className="flex items-center justify-center pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-gray-600">Auto-spinning active...</span>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Zap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-blue-900 mb-1">Auto-Spin Mode</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Character spins automatically on page load! Use "Stop Spin" button to stop rotation. Expressions work independently while spinning.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionsPanel;
