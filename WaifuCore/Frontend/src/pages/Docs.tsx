import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/marketing/Footer";
import JsonLd from "@/components/marketing/JsonLd";
import { 
  BookOpen,
  Code,
  Download,
  Settings,
  Play,
  Terminal,
  FileText,
  Folder,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  Copy,
  Sparkles,
  MessageCircle,
  Zap,
  Database,
  Cpu,
  Globe
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const techStack = [
  { component: "Backend", technology: "Python, FastAPI" },
  { component: "Frontend", technology: "React, Vite, TypeScript" },
  { component: "UI Components", technology: "Shadcn-UI, Tailwind CSS" },
  { component: "3D Avatar", technology: "Three.js, @pixiv/three-vrm" },
  { component: "ASR (Speech-to-Text)", technology: "faster-whisper" },
  { component: "TTS (Text-to-Speech)", technology: "Coqui TTS, Kokoro TTS" },
  { component: "LLM (Language Model)", technology: "Groq, Ollama, OpenAI" },
  { component: "Memory", technology: "ChromaDB" },
  { component: "Real-time Comms", technology: "WebSockets" }
];

const prerequisites = [
  { name: "Python", version: "Version 3.11 (strongly recommended)", icon: <Code className="h-5 w-5" /> },
  { name: "Node.js", version: "Version 18.x or newer", icon: <Globe className="h-5 w-5" /> },
  { name: "NVIDIA GPU", version: "Highly recommended for performance", icon: <Cpu className="h-5 w-5" /> },
  { name: "Git", version: "For cloning the repository", icon: <Download className="h-5 w-5" /> }
];

const setupSteps = [
  {
    title: "Clone Repository",
    description: "Get the project code from GitHub",
    code: "git clone <your-repository-url>\ncd hiteshydv001-ai-waifu"
  },
  {
    title: "Python Environment",
    description: "Set up virtual environment for backend",
    code: "cd WaifuCore\npython -m venv venv\n# Windows\n.\\venv\\Scripts\\Activate.ps1\n# Linux/macOS\nsource venv/bin/activate"
  },
  {
    title: "Install Dependencies",
    description: "Install Python packages",
    code: "pip install --upgrade pip\npip install -r requirements.txt"
  },
  {
    title: "Configure API Keys",
    description: "Create .env file with your API keys",
    code: "# WaifuCore/.env\nOPENAI_API_KEY=sk-YOUR_KEY_HERE\nGROQ_API_KEY=gsk_YOUR_KEY_HERE"
  }
];

const projectStructure = [
  {
    path: "WaifuCore/",
    description: "Python backend directory",
    items: [
      "main_api.py - FastAPI entry point",
      "config/ - Project configuration",
      "waifu_core/ - Core application package"
    ]
  },
  {
    path: "Frontend/",
    description: "React frontend directory",
    items: [
      "src/pages/ - Page components",
      "src/components/ - Reusable UI components",
      "public/ - Static assets (VRM, animations)"
    ]
  }
];

const Docs = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="container max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg" style={{ backgroundImage: "var(--gradient-primary)" }} />
            <span className="font-semibold">Girlfriendie</span>
          </Link>
          <div className="hidden sm:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/features">Features</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/demo">Demo</Link>
            </Button>
            <Button variant="ghost" asChild>
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
        <div ref={heroRef} className="hero-grid rounded-2xl border p-8 sm:p-14 surface-card">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4">
              <span className="text-gradient">Developer</span>
              <span> Documentation</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Complete guide to set up, run, and customize Project Ananya. From installation to advanced customization, everything you need to get started.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="hero" className="w-full sm:w-auto" asChild>
                <Link to="#setup">
                  <BookOpen className="mr-1" /> Quick Start
                </Link>
              </Button>
              <Button variant="outline" className="w-full sm:w-auto">
                <ExternalLink className="mr-1" /> GitHub Repo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Project Overview */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Zap className="h-4 w-4" />
            📋 Project Overview
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">Architecture & Components</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Project Ananya is a client-server application with a Python backend and React frontend, designed for seamless AI companion interactions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                WaifuCore (Backend)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                A headless Python API built with FastAPI. Handles all AI processing including speech-to-text, language model inference, text-to-speech synthesis, and long-term memory management.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  FastAPI WebSocket server
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Multi-provider AI services
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Vector memory storage
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                React Frontend (UI)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                A modern web interface built with Vite, React, and TypeScript. Captures user input, communicates via WebSockets, and renders the interactive 3D VRM avatar.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Real-time 3D avatar rendering
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Voice input/output handling
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Responsive UI components
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">Technology Stack</h2>
          <p className="text-lg text-muted-foreground">Built with modern, industry-standard technologies</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {techStack.map((item, index) => (
            <Card key={index} className="surface-card">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-sm">{item.component}</h3>
                    <p className="text-muted-foreground text-xs mt-1">{item.technology}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">{item.component.split(' ')[0]}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Prerequisites */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">Prerequisites</h2>
          <p className="text-lg text-muted-foreground">What you need before getting started</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prerequisites.map((item, index) => (
            <Card key={index} className="surface-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                    <p className="text-muted-foreground text-sm">{item.version}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Setup Guide */}
      <section id="setup" className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">Quick Setup Guide</h2>
          <p className="text-lg text-muted-foreground">Get up and running in minutes</p>
        </div>
        
        <div className="space-y-8">
          {setupSteps.map((step, index) => (
            <Card key={index} className="surface-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted/50 rounded-lg p-4 text-sm overflow-x-auto">
                    <code>{step.code}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(step.code, `step-${index}`)}
                  >
                    {copiedCode === `step-${index}` ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Project Structure */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">Project Structure</h2>
          <p className="text-lg text-muted-foreground">Understanding the codebase organization</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {projectStructure.map((section, index) => (
            <Card key={index} className="surface-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  {section.path}
                </CardTitle>
                <p className="text-muted-foreground text-sm">{section.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Running the Application */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">Running the Application</h2>
          <p className="text-lg text-muted-foreground">Start both backend and frontend servers</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Terminal 1: Backend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">Navigate to WaifuCore and start the API server:</p>
                <div className="relative">
                  <pre className="bg-muted/50 rounded-lg p-4 text-sm">
                    <code>cd WaifuCore{'\n'}python -m main_api</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard('cd WaifuCore\npython -m main_api', 'backend')}
                  >
                    {copiedCode === 'backend' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Server will run on http://localhost:8000</p>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Terminal 2: Frontend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">Navigate to Frontend and start the dev server:</p>
                <div className="relative">
                  <pre className="bg-muted/50 rounded-lg p-4 text-sm">
                    <code>cd Frontend{'\n'}npm run dev</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard('cd Frontend\nnpm run dev', 'frontend')}
                  >
                    {copiedCode === 'frontend' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Usually runs on http://localhost:5173</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Customization Guide */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">Customization Guide</h2>
          <p className="text-lg text-muted-foreground">Make Ananya truly yours</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="text-lg">Change Persona</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3">
                Edit <code className="bg-muted px-1 rounded">character.yaml</code> to modify personality, speech patterns, and behavior.
              </p>
              <Badge variant="secondary" className="text-xs">Easiest</Badge>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="text-lg">Change Voice</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3">
                Replace the reference voice file and update the path in <code className="bg-muted px-1 rounded">services.yaml</code>.
              </p>
              <Badge variant="secondary" className="text-xs">Medium</Badge>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="text-lg">Change Avatar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3">
                Replace the VRM model file in the public directory and update the component reference.
              </p>
              <Badge variant="secondary" className="text-xs">Advanced</Badge>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <Card className="surface-card text-center p-8 sm:p-12">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">
              Ready to build your AI companion?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Follow the setup guide and start customizing Ananya to create your perfect AI companion experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="lg" className="w-full sm:w-auto" asChild>
                <Link to="/">
                  <Sparkles className="mr-2" />
                  Try Live Demo
                  <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <ExternalLink className="mr-2" />
                View on GitHub
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

export default Docs;
