import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/marketing/Footer";
import JsonLd from "@/components/marketing/JsonLd";
import { 
  Play,
  Sparkles,
  MessageCircle,
  ArrowRight,
  ExternalLink,
  Zap,
  Mic,
  Eye,
  Heart,
  Volume2,
  BrainCircuit,
  Users,
  Star,
  Clock,
  CheckCircle
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const demoFeatures = [
  {
    icon: <Mic className="h-5 w-5" />,
    title: "Voice Interaction",
    description: "Natural speech recognition and crystal-clear voice responses"
  },
  {
    icon: <Eye className="h-5 w-5" />,
    title: "3D Avatar",
    description: "Expressive VRM model with real-time lip-sync and emotions"
  },
  {
    icon: <BrainCircuit className="h-5 w-5" />,
    title: "AI Intelligence",
    description: "Advanced language models with contextual understanding"
  },
  {
    icon: <Heart className="h-5 w-5" />,
    title: "Personality",
    description: "Unique character traits and emotional responses"
  }
];

const projectStats = [
  { label: "Response Time", value: "<1s", icon: <Clock className="h-4 w-4" /> },
  { label: "Voice Quality", value: "48kHz", icon: <Volume2 className="h-4 w-4" /> },
  { label: "3D Rendering", value: "60fps", icon: <Zap className="h-4 w-4" /> },
  { label: "Memory Storage", value: "Vector DB", icon: <BrainCircuit className="h-4 w-4" /> }
];

const testimonials = [
  {
    name: "Alex Chen",
    role: "AI Researcher",
    content: "The most impressive AI companion I've ever interacted with. The 3D avatar and voice synthesis are incredibly lifelike.",
    rating: 5
  },
  {
    name: "Sarah Johnson",
    role: "Developer",
    content: "Amazing framework! The documentation is comprehensive and the customization options are endless.",
    rating: 5
  },
  {
    name: "Mike Rodriguez",
    role: "Tech Enthusiast",
    content: "Project Ananya sets a new standard for AI companions. The real-time interactions feel genuinely natural.",
    rating: 5
  }
];

const Demo = () => {
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
              <span className="text-gradient">Live Demo</span>
              <span> & Showcase</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Experience Project Ananya in action. Watch the demo video and see how advanced AI companionship comes to life with cutting-edge technology.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="hero" className="w-full sm:w-auto" asChild>
                <Link to="/">
                  <Sparkles className="mr-1" /> Try Live Demo
                </Link>
              </Button>
              <Button variant="outline" className="w-full sm:w-auto">
                <ExternalLink className="mr-1" /> View Source
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Play className="h-4 w-4" />
            🎥 Video Demonstration
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">See Ananya in Action</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Watch this comprehensive demo showcasing all the key features, from voice interaction to 3D avatar expressions and real-time AI responses.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="surface-card overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-video bg-muted/20 rounded-lg overflow-hidden">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=example"
                  title="Project Ananya - AI Companion Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
                {/* Fallback for when iframe doesn't load */}
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
                  <div className="text-center">
                    <Play className="h-16 w-16 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-2">Demo Video</h3>
                    <p className="text-muted-foreground">Project Ananya - AI Companion Showcase</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              This demo showcases real-time voice interaction, 3D avatar expressions, and AI-powered conversations.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary">Voice Recognition</Badge>
              <Badge variant="secondary">3D Animation</Badge>
              <Badge variant="secondary">Real-time AI</Badge>
              <Badge variant="secondary">Emotion System</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Features */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">What You'll See</h2>
          <p className="text-lg text-muted-foreground">Key features demonstrated in the video</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {demoFeatures.map((feature, index) => (
            <Card key={index} className="surface-card text-center hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="p-3 bg-primary/10 rounded-lg text-primary w-fit mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Project Stats */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">Performance Metrics</h2>
          <p className="text-lg text-muted-foreground">Technical specifications that power the experience</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {projectStats.map((stat, index) => (
            <Card key={index} className="surface-card text-center">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="text-primary">
                    {stat.icon}
                  </div>
                  <span className="text-2xl font-bold text-gradient">{stat.value}</span>
                </div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Project Information */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              🚀 Project Information
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-6">
              The Future of AI Companionship
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Project Ananya represents a breakthrough in AI companion technology, combining advanced language models with expressive 3D avatars and natural voice interaction.
              </p>
              <p>
                Built as a comprehensive framework, it offers developers and enthusiasts the tools to create their own AI companions with customizable personalities, voices, and appearances.
              </p>
              <p>
                The project showcases the potential of modern AI technology when combined with thoughtful user experience design and cutting-edge 3D rendering capabilities.
              </p>
            </div>
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Open source and fully customizable</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Multiple AI provider support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Real-time 3D avatar rendering</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Advanced memory and context system</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <Card className="surface-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5" />
                  Technical Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Backend</span>
                  <Badge variant="secondary">Python + FastAPI</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Frontend</span>
                  <Badge variant="secondary">React + TypeScript</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">3D Engine</span>
                  <Badge variant="secondary">Three.js + VRM</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">AI Models</span>
                  <Badge variant="secondary">Multi-provider</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="surface-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community & Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  Join our growing community of developers and AI enthusiasts building the future of digital companionship.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    GitHub
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Discord
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">What People Are Saying</h2>
          <p className="text-lg text-muted-foreground">Feedback from our community</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="surface-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-muted-foreground text-xs">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <Card className="surface-card text-center p-8 sm:p-12">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">
              Ready to Experience Ananya?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Try the live demo now or explore the documentation to build your own AI companion.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="lg" className="w-full sm:w-auto" asChild>
                <Link to="/">
                  <Sparkles className="mr-2" />
                  Try Live Demo
                  <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                <Link to="/docs">
                  <MessageCircle className="mr-2" />
                  View Documentation
                </Link>
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

export default Demo;
