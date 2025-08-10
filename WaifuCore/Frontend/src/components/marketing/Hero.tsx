import { Button } from "@/components/ui/button";
import { Sparkles, Mic, MessageCircle } from "lucide-react";
import { useEffect, useRef } from "react";

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
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg" style={{ backgroundImage: "var(--gradient-primary)" }} />
          <span className="font-semibold">Girlfriendie</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Button variant="ghost">Features</Button>
          <Button variant="ghost">Demo</Button>
          <Button variant="outline">Docs</Button>
          <Button variant="hero">Get Started</Button>
        </div>
      </nav>

      <div ref={ref} className="hero-grid rounded-2xl border p-8 sm:p-14 surface-card">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4">
            <span className="text-gradient">Meet Girlfriendie</span>
            <span> — your AI companion</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Chat, voice, and a 3D presence — powered by WaifuCore. Natural conversations that feel alive and always there for you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="hero" className="w-full sm:w-auto">
              <Sparkles className="mr-1" /> Try it now
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              <Mic className="mr-1" /> Voice demo
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">No sign-up required for the preview.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="surface-card rounded-xl p-5">
            <div className="flex items-center gap-2 font-medium"><MessageCircle /> Real conversation</div>
            <p className="text-sm text-muted-foreground mt-2">Context-aware replies that adapt to your mood and tone.</p>
          </div>
          <div className="surface-card rounded-xl p-5">
            <div className="flex items-center gap-2 font-medium"><Mic /> Crystal voice</div>
            <p className="text-sm text-muted-foreground mt-2">Ultra-natural TTS with subtle emotions and pacing.</p>
          </div>
          <div className="surface-card rounded-xl p-5">
            <div className="flex items-center gap-2 font-medium"><Sparkles /> 3D presence</div>
            <p className="text-sm text-muted-foreground mt-2">Immersive 3D avatar presence for a deeper connection.</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
