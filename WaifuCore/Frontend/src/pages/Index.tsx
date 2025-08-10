import Hero from "@/components/marketing/Hero";
import Footer from "@/components/marketing/Footer";
import JsonLd from "@/components/marketing/JsonLd";
import VRMViewer from "@/components/ananya/VRMViewer";
import ChatInterface, { CharacterStatus } from "@/components/chat/ChatInterface";
import { useState, useCallback } from "react";

const Index = () => {
  const [characterStatus, setCharacterStatus] = useState<CharacterStatus>({ 
    state: 'idle', 
    animation: 'neutral' 
  });
  
  const [actionAnimation, setActionAnimation] = useState<string | null>(null);

  const handleStatusChange = useCallback((status: CharacterStatus) => {
    setCharacterStatus(status);
  }, []);
  
  const handlePlayAnimation = useCallback((animationName: string | null) => {
    setActionAnimation(animationName);
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <section className="container max-w-6xl mx-auto px-4">
        <Hero />
      </section>

      <section className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VRMViewer 
              characterState={characterStatus.state} 
              emotion={characterStatus.animation} 
              actionAnimation={actionAnimation}
            />
          </div>
          <div className="lg:col-span-1">
            <ChatInterface 
              onStatusChange={handleStatusChange} 
              onPlayAnimation={handlePlayAnimation}
            />
          </div>
        </div>
      </section>

      <Footer />
      <JsonLd />
    </main>
  );
};

export default Index;