import { Button } from "@/components/ui/button";
import { Sparkles, Mic, MessageCircle, Heart, Zap, Brain } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <header className="relative">
      <nav className="flex items-center justify-between py-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 p-0.5">
              <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
                <div className="text-lg">👧</div>
              </div>
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
          <Button variant="hero">Get Started</Button>
        </div>
      </nav>

      <div ref={ref} className="hero-grid rounded-2xl border p-8 sm:p-14 surface-card relative overflow-hidden">
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
                <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
                  <div className="text-4xl">👧</div>
                </div>
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
            <span className="text-2xl sm:text-3xl text-muted-foreground font-medium">Your Perfect AI Companion</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience the future of AI companionship with <span className="text-pink-500 font-semibold">lifelike conversations</span>, 
            <span className="text-purple-500 font-semibold"> crystal-clear voice</span>, and 
            <span className="text-blue-500 font-semibold"> stunning 3D presence</span>
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button variant="hero" size="lg" className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <Sparkles className="mr-2 h-5 w-5" /> 
              Start Chatting Now
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto border-pink-300 text-pink-600 hover:bg-pink-50 shadow-md hover:shadow-lg transition-all duration-300">
              <Mic className="mr-2 h-5 w-5" /> 
              Try Voice Demo
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Online & Ready</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Instant Response</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-pink-500" />
              <span>Always Caring</span>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="surface-card rounded-xl p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-pink-400">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <MessageCircle className="h-5 w-5 text-pink-600" />
              </div>
              <span className="font-semibold text-lg">Natural Conversations</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Engage in meaningful dialogues that adapt to your personality, mood, and interests with advanced AI understanding.
            </p>
          </div>
          
          <div className="surface-card rounded-xl p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-400">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Mic className="h-5 w-5 text-purple-600" />
              </div>
              <span className="font-semibold text-lg">Crystal Voice</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Experience ultra-realistic voice synthesis with emotional nuances and perfect lip-sync technology.
            </p>
          </div>
          
          <div className="surface-card rounded-xl p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-400">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-semibold text-lg">3D Presence</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Immerse yourself with a beautiful 3D avatar that expresses emotions and reacts to your every word.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
