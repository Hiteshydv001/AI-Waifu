import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import Footer from "../components/marketing/Footer";
import JsonLd from "../components/marketing/JsonLd";
import { 
  BrainCircuit, 
  BotMessageSquare, 
  Zap, 
  Mic, 
  Ear, 
  MemoryStick,
  Sparkles,
  MessageCircle,
  Eye,
  Heart,
  Cpu,
  Globe,
  Shield,
  Palette,
  Volume2,
  Camera,
  Settings,
  Users,
  Clock,
  Database,
  ArrowRight,
  CheckCircle,
  Play,
  Smile,
  MousePointer,
  Activity,
  Code,
  Layers,
  Headphones,
  FileText,
  Sliders,
  Wand2,
  Monitor
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const avatarFeatures = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Dynamic VRM Model",
    description: "Fully rigged 3D avatar using the popular VRM standard, allowing for complex animations and expressions with industry-standard compatibility."
  },
  {
    icon: <Volume2 className="h-6 w-6" />,
    title: "Real-time Lip-Sync",
    description: "Avatar's mouth is precisely synchronized with TTS audio output. When Ananya speaks, her mouth moves naturally and believably."
  },
  {
    icon: <Smile className="h-6 w-6" />,
    title: "Expressive Emotions",
    description: "Facial expressions change dynamically based on conversation context. LLM generates emotion tags mapped to compound facial morphs."
  },
  {
    icon: <MousePointer className="h-6 w-6" />,
    title: "Dynamic Eye Tracking",
    description: "Eyes subtly follow your mouse cursor around the viewer, creating a genuine sense of presence and awareness."
  },
  {
    icon: <Activity className="h-6 w-6" />,
    title: "Facial Expression Control",
    description: "Rich facial expressions triggered manually or automatically by AI based on conversation context - happy, sad, shy, angry, thinking."
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Enhanced Lip Sync",
    description: "Multiple mouth shapes and realistic speaking movements that create natural-looking speech with varied mouth positions."
  }
];

const aiCoreFeatures = [
  {
    icon: <BrainCircuit className="h-6 w-6" />,
    title: "Swappable LLM Brains",
    description: "Switch between different AI models in real-time",
    details: [
      "Groq: Blazing-fast response speeds",
      "OpenAI: State-of-the-art models like GPT-4",
      "Ollama: Completely private, locally-run experience"
    ]
  },
  {
    icon: <BotMessageSquare className="h-6 w-6" />,
    title: "Dual TTS Voice Engines",
    description: "High-quality Text-to-Speech with multiple options",
    details: [
      "Coqui TTS (XTTS v2): Zero-shot voice cloning from single audio sample",
      "Kokoro TTS: Extremely fast, lightweight, fully local generation"
    ]
  },
  {
    icon: <Mic className="h-6 w-6" />,
    title: "High-Speed Speech Recognition",
    description: "User voice input transcribed using faster-whisper",
    details: [
      "Highly optimized implementation of OpenAI's Whisper",
      "Fast and accurate results with GPU (CUDA) and CPU support",
      "Configurable quality settings for optimal performance"
    ]
  },
  {
    icon: <MemoryStick className="h-6 w-6" />,
    title: "Persistent Long-Term Memory",
    description: "Ananya remembers key facts from conversations",
    details: [
      "Automatic extraction by LLM of important conversation elements",
      "Vector embeddings stored in ChromaDB database",
      "Context retrieval for future conversations and user preferences"
    ]
  }
];

const uiFeatures = [
  {
    icon: <Layers className="h-6 w-6" />,
    title: "Multi-Page Application",
    description: "Structured with distinct pages for chat, demo, features, and documentation in consistent layout."
  },
  {
    icon: <Settings className="h-6 w-6" />,
    title: "Live AI Configuration",
    description: "Select preferred LLM and TTS providers on the fly from dropdown menus without page reload."
  },
  {
    icon: <Headphones className="h-6 w-6" />,
    title: "Advanced Voice Input",
    description: "Microphone selection with automatic device detection and reliable recording system."
  },
  {
    icon: <Play className="h-6 w-6" />,
    title: "Seamless Audio Playback",
    description: "AI-generated speech streamed from backend and played automatically, synchronized with avatar."
  }
];

const customizationFeatures = [
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Centralized YAML Configuration",
    description: "Complete personality and service configuration through simple files",
    details: [
      "character.yaml: Defines AI's personality, directives, and behavioral examples",
      "services.yaml: Manages external service configurations and API keys"
    ]
  },
  {
    icon: <Code className="h-6 w-6" />,
    title: "Advanced Prompt Engineering",
    description: "Sophisticated system prompts with specific rules and detailed examples for uncensored, in-character responses."
  },
  {
    icon: <Wand2 className="h-6 w-6" />,
    title: "Emotion & Action Tag System",
    description: "LLM output parsed for emotion tags ([happy][action:dance]) triggering synchronized expressions and animations."
  }
];

const Features = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = heroRef.current;
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900">
      {/* Navigation */}
      <nav className="container max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between py-4 px-6 mx-4 my-4 backdrop-blur-md bg-white/80 border border-gray-200 rounded-2xl shadow-lg">
          <Link to="/" className="flex items-center gap-2">
            <img src="/ananya-character.png" alt="Ananya" className="h-8 w-8 rounded-lg object-cover" />
            <span className="font-semibold text-gray-900">Girlfriendie</span>
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
              <Link to="/">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container max-w-6xl mx-auto px-4 pb-8">
        <div ref={heroRef} className="hero-grid rounded-3xl backdrop-blur-lg bg-white/90 border border-gray-200 p-8 sm:p-14 shadow-2xl">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4">
              <span className="text-gradient text-gray-900">Project Ananya</span>
              <span className="text-gray-900"> Core Features</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              An advanced framework for creating lifelike, interactive AI companions. Combining cutting-edge AI services with a highly expressive 3D avatar to deliver a dynamic and engaging user experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="hero" className="w-full sm:w-auto" asChild>
                <Link to="/">
                  <Sparkles className="mr-1" /> Try Ananya Now
                </Link>
              </Button>
              <Button variant="outline" className="w-full sm:w-auto">
                <Play className="mr-1" /> Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 3D Avatar Section */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 backdrop-blur-lg bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-gray-200">
            <Zap className="h-4 w-4" />
            🤖 The Interactive 3D Avatar
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900">Visual Heart of the Project</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Ananya is more than just a static model. She is a dynamic, expressive character who reacts in real-time to the conversation, creating an immersive and believable interaction experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {avatarFeatures.map((feature, index) => (
            <Card key={index} className="backdrop-blur-lg bg-white/80 border border-gray-200 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-pink-100 rounded-lg text-pink-600 group-hover:bg-pink-200 transition-colors backdrop-blur-sm border border-pink-200">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg text-gray-900">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* AI Core Engine Section */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 backdrop-blur-lg bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-gray-200">
            <BrainCircuit className="h-4 w-4" />
            🧠 The AI Core Engine
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900">Powerful Backend Architecture</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            A headless API built with Python and FastAPI, orchestrating multiple AI services via real-time WebSocket connection for seamless, intelligent interactions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {aiCoreFeatures.map((feature, index) => (
            <Card key={index} className="backdrop-blur-lg bg-white/80 border border-gray-200 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-200 transition-colors backdrop-blur-sm border border-blue-200">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* User Interface & Experience Section */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Monitor className="h-4 w-4" />
            💻 User Interface & Experience
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">Modern, Responsive Design</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Built with React and Vite, featuring a clean and intuitive UI using Shadcn-UI components for the best user experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {uiFeatures.map((feature, index) => (
            <Card key={index} className="backdrop-blur-lg bg-white/80 border border-gray-200 hover:shadow-lg transition-all duration-300 group border-l-4 border-l-blue-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-200 transition-colors flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Deep Customization & Persona Engine Section */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Palette className="h-4 w-4" />
            🎨 Deep Customization & Persona Engine
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">Framework-First Design</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            The entire project is designed as a framework. Ananya's personality is not hardcoded; it is defined entirely through simple configuration files, making customization effortless.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {customizationFeatures.map((feature, index) => (
            <Card key={index} className="backdrop-blur-lg bg-white/80 border border-gray-200 hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-green-100 rounded-lg text-green-600 group-hover:bg-green-200 transition-colors">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg text-gray-900">{feature.title}</CardTitle>
                </div>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardHeader>
              {feature.details && (
                <CardContent>
                  <ul className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start gap-2 text-xs">
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <Card className="backdrop-blur-lg bg-white/90 border border-gray-200 text-center p-8 sm:p-12">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900">
              Ready to meet Ananya?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Experience the future of AI companionship with advanced 3D interaction, natural conversation, and persistent memory.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="lg" className="w-full sm:w-auto" asChild>
                <Link to="/">
                  <Sparkles className="mr-2" />
                  Start Chatting
                  <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <MessageCircle className="mr-2" />
                View Documentation
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <Footer />
      <JsonLd />
    </main>
  );
};

export default Features;
