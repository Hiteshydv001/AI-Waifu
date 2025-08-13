import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Play, Pause, RotateCcw, Music, Heart, Zap } from "lucide-react";

interface ActionsPanelProps {
  onPlayAnimation?: (animationName: string | null) => void;
  isPlaying?: boolean;
}

const ActionsPanel: React.FC<ActionsPanelProps> = ({ onPlayAnimation, isPlaying = false }) => {
  const actions = [
    {
      id: 'dance-fbx',
      label: 'Dance',
      icon: '💃',
      description: 'Full dance routine',
      color: 'pink',
      bgColor: 'bg-pink-500/10 hover:bg-pink-500/20',
      textColor: 'text-pink-700',
      borderColor: 'border-pink-200'
    },
    {
      id: 'shy',
      label: 'Act Shy',
      icon: '😊',
      description: 'Cute shy gesture',
      color: 'purple',
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200'
    },
    {
      id: 'dance',
      label: 'Spin',
      icon: '🔄',
      description: 'Quick spin motion',
      color: 'blue',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    },
    {
      id: 'wave',
      label: 'Wave',
      icon: '👋',
      description: 'Friendly wave',
      color: 'green',
      bgColor: 'bg-green-500/10 hover:bg-green-500/20',
      textColor: 'text-green-700',
      borderColor: 'border-green-200'
    }
  ];

  const handleActionClick = (actionId: string) => {
    console.log(`${actionId} action triggered`);
    onPlayAnimation?.(actionId);
  };

  const handleStopAction = () => {
    console.log("Stop action triggered");
    onPlayAnimation?.(null);
  };

  return (
    <Card className="backdrop-blur-lg bg-white/80 border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-200">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
          <Sparkles className="h-5 w-5 text-pink-500" />
          Creative Actions
        </CardTitle>
        <p className="text-sm text-gray-600">Trigger special animations and expressions</p>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              onClick={() => handleActionClick(action.id)}
              className={`h-16 flex flex-col items-center justify-center gap-1 text-xs ${action.bgColor} ${action.textColor} border ${action.borderColor} hover:scale-105 transition-all duration-200`}
              disabled={isPlaying}
            >
              <span className="text-lg">{action.icon}</span>
              <span className="font-medium">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Control Section */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-xs text-gray-600">
              {isPlaying ? 'Animation playing...' : 'Ready for action'}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStopAction}
            className="h-8 px-3 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-700 border border-red-200"
            disabled={!isPlaying}
          >
            <Pause className="h-3 w-3 mr-1" />
            Stop
          </Button>
        </div>

        {/* Quick Tips */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Zap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-blue-900 mb-1">Pro Tip</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Actions can be triggered during conversation for more dynamic interactions! Some animations play automatically based on chat context.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionsPanel;
