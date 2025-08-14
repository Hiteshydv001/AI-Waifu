import Hero from "@/components/marketing/Hero";
import Footer from "@/components/marketing/Footer";
import JsonLd from "@/components/marketing/JsonLd";
import VRMViewer from "@/components/ananya/VRMViewer";
import ChatInterface, { CharacterStatus } from "@/components/chat/ChatInterface";
import ActionsPanel from "@/components/ananya/ActionsPanel";
import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  MessageCircle, 
  Mic, 
  Heart, 
  Zap, 
  Brain,
  Users,
  Clock,
  Star,
  ArrowDown,
  Play,
  Pause
} from "lucide-react";

const Index = () => {
  const [characterStatus, setCharacterStatus] = useState<CharacterStatus>({ 
    state: 'idle', 
    animation: 'neutral' 
  });
  
  const [actionAnimation, setActionAnimation] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(true); // Track spinning state separately
  const [isInteracting, setIsInteracting] = useState(false);
  const [userCount, setUserCount] = useState(1247);
  const demoSectionRef = useRef<HTMLDivElement>(null);

  // Simulate live user count updates
  useEffect(() => {
    const interval = setInterval(() => {
      setUserCount(prev => prev + Math.floor(Math.random() * 3));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = useCallback((status: CharacterStatus) => {
    setCharacterStatus(status);
    setIsInteracting(status.state !== 'idle');
  }, []);
  
  const handlePlayAnimation = useCallback((actionName: string | null) => {
    console.log("Index.tsx - handleAction called with:", actionName);
    if (actionName === 'stop-spin') {
      // Stop spinning but keep current emotion
      setActionAnimation('stop-spin');
      setIsSpinning(false);
    } else if (actionName) {
      // Update character status with new emotion (for all non-stop-spin actions)
      setCharacterStatus(prev => ({
        ...prev,
        animation: actionName
      }));
      // Clear the actionAnimation so it doesn't interfere with emotion display
      setActionAnimation(null);
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed top-20 left-10 opacity-20 animate-float">
        <Heart className="h-32 w-32 text-pink-500" />
      </div>
      <div className="fixed bottom-40 right-20 opacity-20 animate-bounce">
        <Sparkles className="h-24 w-24 text-purple-500" />
      </div>
      <div className="fixed top-1/2 left-1/4 opacity-10 animate-spin">
        <Brain className="h-40 w-40 text-blue-500" style={{ animationDuration: '20s' }} />
      </div>

      {/* Hero Section */}
      <section className="container max-w-6xl mx-auto px-4 relative z-10">
        <Hero />
      </section>

      {/* Scroll indicator */}
      <div className="flex justify-center mt-8 animate-bounce">
        <ArrowDown className="h-6 w-6 text-gray-600" />
      </div>

      {/* Stats Section */}
      <section className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <Card className="backdrop-blur-lg bg-white/80 border border-gray-200 shadow-xl rounded-2xl card-hover-lift shimmer-effect">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-pink-100 rounded-full animate-glow-pulse backdrop-blur-sm border border-pink-200">
                  <Users className="h-6 w-6 text-pink-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{userCount.toLocaleString()}+</div>
              <div className="text-sm text-pink-600">Active Users</div>
              <div className="flex justify-center mt-2">
                <div className="h-2 w-2 bg-green-500 rounded-full status-pulse"></div>
                <span className="text-xs text-green-600 ml-1">Live</span>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg bg-white/80 border border-gray-200 shadow-xl rounded-2xl card-hover-lift shimmer-effect">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-purple-100 rounded-full animate-heartbeat backdrop-blur-sm border border-purple-200">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-purple-600">Always Available</div>
              <Badge variant="secondary" className="mt-2 bg-purple-100 text-purple-700 border border-purple-200">
                No Downtime
              </Badge>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg bg-white/80 border border-gray-200 shadow-xl rounded-2xl card-hover-lift shimmer-effect">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-blue-100 rounded-full animate-glow-pulse backdrop-blur-sm border border-blue-200">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">&lt; 1s</div>
              <div className="text-sm text-blue-600">Response Time</div>
              <div className="flex justify-center items-center mt-2">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span className="text-xs text-blue-600 ml-1">Ultra Fast</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Video Showcase Section */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-6 py-3 rounded-full text-sm font-medium mb-6 border border-purple-200 backdrop-blur-sm">
            <Play className="h-4 w-4" />
            🎬 Watch Ananya in Action
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight mb-4 text-gray-900">
            Experience the <span className="text-gradient bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Future</span> of AI Companions
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            See how Ananya brings conversations to life with expressive 3D animations, natural voice interactions, and intelligent responses that feel genuinely human.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Video Container with Creative Design */}
          <div className="relative">
            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-float"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-20 animate-bounce"></div>
            
            {/* Main Video Card */}
            <Card className="backdrop-blur-lg bg-white/90 border border-gray-200 shadow-2xl rounded-3xl overflow-hidden relative">
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-3xl p-[2px]">
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl h-full w-full"></div>
              </div>
              
              {/* Video Content */}
              <div className="relative z-10 p-2">
                <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden">
                  <iframe
                    title="vimeo-player" 
                    src="https://player.vimeo.com/video/1109119648?h=7bea22b82d&title=0&byline=0&portrait=0&controls=1&color=8b5cf6" 
                    className="w-full h-full"
                    frameBorder="0" 
                    referrerPolicy="strict-origin-when-cross-origin" 
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"   
                    allowFullScreen
                  />
                  
                  {/* Play Button Overlay (for aesthetics) */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-20 transition-opacity duration-300">
                    <div className="bg-white/80 rounded-full p-6 backdrop-blur-sm">
                      <Play className="h-12 w-12 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Video Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="backdrop-blur-lg bg-white/80 border border-gray-200 shadow-lg rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-purple-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-sm text-gray-900 mb-1">Natural Conversations</h3>
                <p className="text-xs text-gray-600">See how Ananya responds naturally to complex questions and maintains context throughout conversations.</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-lg bg-white/80 border border-gray-200 shadow-lg rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-pink-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="font-semibold text-sm text-gray-900 mb-1">Expressive Emotions</h3>
                <p className="text-xs text-gray-600">Watch her 3D avatar express emotions through facial expressions, gestures, and body language.</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-lg bg-white/80 border border-gray-200 shadow-lg rounded-2xl">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-blue-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-sm text-gray-900 mb-1">Real-time Interaction</h3>
                <p className="text-xs text-gray-600">Experience lightning-fast responses with synchronized lip-sync and realistic voice synthesis.</p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-8">
            <Button 
              variant="hero" 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              onClick={() => demoSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Sparkles className="mr-2" />
              Try Interactive Demo Below
              <ArrowDown className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Main Demo Section */}
      <section 
        ref={demoSectionRef}
        className="container max-w-7xl mx-auto px-4 py-12" 
        data-demo-section
      >
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 backdrop-blur-lg bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-gray-200">
            <Sparkles className="h-4 w-4" />
            🎮 Interactive Demo
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="text-gradient-animated text-gray-900">
              Experience the Magic
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start a conversation with Ananya below. Watch her come alive with realistic expressions and natural responses.
          </p>
        </div>

        {/* Interactive Status Indicator */}
        <div className="flex justify-center mb-8">
          <div className={`flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-lg bg-white/80 border border-gray-200 shadow-lg transition-all duration-300 ${
            isInteracting 
              ? 'text-green-700' 
              : 'text-gray-700'
          }`}>
            <div className={`h-3 w-3 rounded-full transition-all duration-300 ${
              isInteracting ? 'bg-green-500 status-pulse' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm font-medium">
              {isInteracting ? 'Ananya is responding...' : 'Ready to chat with Ananya'}
            </span>
            {isInteracting ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </div>
        </div>

        {/* Main Demo Layout */}
        <div className="space-y-6">
          {/* Top Row: Avatar and Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 3D Avatar Section */}
            <div className="lg:col-span-3">
              <Card className="backdrop-blur-lg bg-white/90 border border-gray-200 shadow-2xl rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 p-0.5">
                        <div className="h-full w-full rounded-full overflow-hidden">
                          <img 
                            src="/ananya-character.png" 
                            alt="Ananya" 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              console.error("Failed to load image:", e);
                              // Fallback to emoji if image fails
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="h-full w-full rounded-full bg-white flex items-center justify-center"><div class="text-sm">👧</div></div>';
                              }
                            }}
                            onLoad={() => console.log("Ananya image loaded successfully")}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-900">Ananya</div>
                        <div className="text-xs text-gray-600">3D Avatar</div>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        isInteracting 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {characterStatus.state === 'speaking' ? 'Speaking' : 
                       characterStatus.state === 'thinking' ? 'Thinking' : 'Idle'}
                    </Badge>
                  </div>
                </div>
                <div className="p-2">
                  <VRMViewer 
                    characterState={characterStatus.state} 
                    emotion={characterStatus.animation} 
                    actionAnimation={actionAnimation}
                    className="h-[400px] md:h-[500px] lg:h-[600px] rounded-lg"
                  />
                </div>
              </Card>
            </div>

            {/* Actions Panel Section */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <ActionsPanel 
                  onPlayAnimation={handlePlayAnimation}
                  isPlaying={false} // Buttons should never be disabled for emotions
                />
                
                {/* Status Card */}
                <Card className="backdrop-blur-lg bg-white/80 border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-900">Live Status</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Character State</span>
                      <Badge variant="secondary" className="text-xs">
                        {characterStatus.state}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Emotion</span>
                      <Badge variant="outline" className="text-xs">
                        {characterStatus.animation}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Animation</span>
                      <Badge variant={actionAnimation ? "default" : "secondary"} className="text-xs">
                        {actionAnimation || 'None'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Bottom Row: Chat Interface */}
          <div className="w-full">
            <Card className="backdrop-blur-lg bg-white/90 border border-gray-200 shadow-2xl rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg backdrop-blur-sm border border-blue-200">
                      <MessageCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">Chat Interface</div>
                      <div className="text-xs text-gray-600">Voice & Text Support</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600">Online</span>
                  </div>
                </div>
              </div>
              <div className="h-[500px] md:h-[600px] lg:h-[700px]">
                <ChatInterface 
                  onStatusChange={handleStatusChange} 
                  onPlayAnimation={handlePlayAnimation}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <div className="text-center backdrop-blur-lg bg-white/80 border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
            <div className="p-4 bg-pink-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center animate-float backdrop-blur-sm border border-pink-200">
              <Heart className="h-8 w-8 text-pink-600" />
            </div>
            <h3 className="font-semibold mb-2 text-gray-900">Emotional Intelligence</h3>
            <p className="text-sm text-gray-600">Ananya understands and responds to emotions naturally</p>
          </div>
          
          <div className="text-center backdrop-blur-lg bg-white/80 border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
            <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center animate-heartbeat backdrop-blur-sm border border-purple-200">
              <Mic className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2 text-gray-900">Voice Recognition</h3>
            <p className="text-sm text-gray-600">Speak naturally - she hears and understands you perfectly</p>
          </div>
          
          <div className="text-center backdrop-blur-lg bg-white/80 border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
            <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center animate-glow-pulse backdrop-blur-sm border border-blue-200">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2 text-gray-900">Memory Retention</h3>
            <p className="text-sm text-gray-600">Remembers your conversations and learns your preferences</p>
          </div>
          
          <div className="text-center backdrop-blur-lg bg-white/80 border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
            <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center animate-float backdrop-blur-sm border border-green-200">
              <Clock className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2 text-gray-900">Real-time Responses</h3>
            <p className="text-sm text-gray-600">Lightning-fast AI processing for seamless conversations</p>
          </div>
        </div>
      </section>

      <Footer />
      <JsonLd />
    </main>
  );
};

export default Index;