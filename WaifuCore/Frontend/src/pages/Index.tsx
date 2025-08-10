import Hero from "@/components/marketing/Hero";
import Footer from "@/components/marketing/Footer";
import JsonLd from "@/components/marketing/JsonLd";
import VRMViewer from "@/components/ananya/VRMViewer";
import ChatInterface from "@/components/chat/ChatInterface";
import { useState } from "react";

const Index = () => {
  const [speaking, setSpeaking] = useState(false);
  return (
    <main className="min-h-screen bg-background">
      <section className="container max-w-6xl mx-auto px-4">
        <Hero />
      </section>

      <section className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VRMViewer speaking={speaking} />
          </div>
          <div className="lg:col-span-1">
            <ChatInterface onSpeakingChange={setSpeaking} />
          </div>
        </div>
      </section>

      <Footer />
      <JsonLd />
    </main>
  );
};

export default Index;
