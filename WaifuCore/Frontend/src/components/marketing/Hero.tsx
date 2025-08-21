import { Button } from "../ui/button";
import { Sparkles, Mic, MessageCircle, Heart, Zap, Brain, Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVoiceDemoPlaying, setIsVoiceDemoPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--mx", `${x}%`);
      el.style.setProperty("--my", `${y}%`);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  const handleVoiceDemo = () => {
    if (isVoiceDemoPlaying) {
      // Stop the audio if it's currently playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsVoiceDemoPlaying(false);
      return;
    }

    setIsVoiceDemoPlaying(true);
    
    // Create and play the audio
    const audio = new Audio('/assets/demo_voice.mp3');
    audioRef.current = audio;
    
    audio.onended = () => {
      setIsVoiceDemoPlaying(false);
    };
    
    audio.onerror = () => {
      console.error('Failed to load demo voice audio');
      setIsVoiceDemoPlaying(false);
    };
    
    audio.play().catch((error) => {
      console.error('Failed to play demo voice:', error);
      setIsVoiceDemoPlaying(false);
    });
  };

  const scrollToDemo = () => {
    const demoSection = document.querySelector('[data-demo-section]');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="relative">
      <nav className="flex items-center justify-between py-4 px-6 mx-4 my-4 backdrop-blur-md bg-white/90 border border-gray-200 rounded-2xl shadow-lg">
        <Link to="/" className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 p-0.5">
              <img 
                src="/ananya-character.png" 
                alt="Ananya" 
                className="h-full w-full rounded-full object-cover"
                onError={(e) => {
                  // Fallback to emoji if image fails
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="h-full w-full rounded-full bg-white flex items-center justify-center"><div class="text-lg">👧</div></div>';
                  }
                }}
              />
            </div>
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-pink-500 rounded-full flex items-center justify-center">
              <Heart className="h-2 w-2 text-white" />
            </div>
          </div>
          <div>
            <span className="font-bold text-lg bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Ananya</span>
            <div className="text-xs text-muted-foreground -mt-1">AI Companion</div>
          </div>
        </Link>
        <div className="hidden sm:flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/features">Features</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/demo">Demo</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/docs">Docs</Link>
          </Button>
          <Button variant="hero" asChild>
            <a href="https://github.com/Hiteshydv001/AI-Waifu" target="_blank" rel="noopener noreferrer">Get Started</a>
          </Button>
        </div>
      </nav>

      <div ref={ref} className="hero-grid rounded-3xl backdrop-blur-lg bg-white/5 border border-white/20 p-8 sm:p-14 shadow-2xl relative overflow-hidden">
        {/* Floating elements for visual appeal */}
        <div className="absolute top-10 left-10 opacity-20">
          <Heart className="h-8 w-8 text-pink-400 animate-pulse" />
        </div>
        <div className="absolute top-20 right-16 opacity-20">
          <Sparkles className="h-6 w-6 text-purple-400 animate-bounce" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-20">
          <Brain className="h-7 w-7 text-blue-400 animate-pulse" />
        </div>
        
        <div className="mx-auto max-w-4xl text-center relative z-10">
          {/* Character Avatar */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 p-1 animate-pulse">
                <img 
                  src="/ananya-character.png" 
                  alt="Ananya" 
                  className="h-full w-full rounded-full object-cover"
                  onError={(e) => {
                    // Fallback to emoji if image fails
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="h-full w-full rounded-full bg-white flex items-center justify-center"><div class="text-4xl">👧</div></div>';
                    }
                  }}
                />
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-pink-500 rounded-full flex items-center justify-center animate-bounce">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <div className="absolute -top-2 -left-2 h-6 w-6 bg-purple-500 rounded-full flex items-center justify-center">
                <Zap className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">Meet Ananya</span>
            <br />
            <span className="text-2xl sm:text-3xl text-muted-foreground font-medium">Your AI Companion</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Chat naturally with Ananya through <span className="text-pink-500 font-semibold">voice or text</span>, 
            watch her <span className="text-purple-500 font-semibold">expressive 3D avatar</span> respond in real-time, and 
            experience <span className="text-blue-500 font-semibold">genuine AI conversations</span>
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button 
              variant="hero" 
              size="lg" 
              className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={scrollToDemo}
            >
              <Sparkles className="mr-2 h-5 w-5" /> 
              Start Chatting Now
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto border-pink-300 text-pink-600 hover:bg-pink-50 shadow-md hover:shadow-lg transition-all duration-300"
              onClick={handleVoiceDemo}
            >
              {isVoiceDemoPlaying ? (
                <>
                  <Volume2 className="mr-2 h-5 w-5 animate-pulse text-pink-600" />
                  Stop Demo
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Try Voice Demo
                </>
              )}
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Ready to Chat</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Instant Response</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-pink-500" />
              <span>Friendly & Caring</span>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 border-l-4 border-l-pink-400">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <MessageCircle className="h-5 w-5 text-pink-600" />
              </div>
              <span className="font-semibold text-lg">Smart Conversations</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Chat about anything - from daily life to deep topics. Ananya remembers your conversations and adapts to your personality.
            </p>
          </div>
          
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 border-l-4 border-l-purple-400">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Mic className="h-5 w-5 text-purple-600" />
              </div>
              <span className="font-semibold text-lg">Voice Interaction</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Speak naturally and hear Ananya respond with realistic voice synthesis and perfect timing.
            </p>
          </div>
          
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 border-l-4 border-l-blue-400">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-semibold text-lg">3D Character</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Watch Ananya express emotions through facial expressions, gestures, and animations that match her responses.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
