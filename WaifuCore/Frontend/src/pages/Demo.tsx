import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import Footer from "../components/marketing/Footer";
import JsonLd from "../components/marketing/JsonLd";
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
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
        <div ref={heroRef} className="hero-grid rounded-3xl backdrop-blur-lg bg-white/90 border border-gray-200 p-8 sm:p-14 shadow-2xl">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4">
              <span className="text-gradient text-gray-900">Live Demo</span>
              <span className="text-gray-900"> & Showcase</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Experience Project Ananya in action. Watch the demo video and see how advanced AI companionship comes to life with cutting-edge technology.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="hero" className="w-full sm:w-auto" asChild>
                <Link to="/">
                  <Sparkles className="mr-1" /> Try Live Demo
                </Link>
              </Button>
              <Button variant="outline" className="w-full sm:w-auto" asChild>
                <a href="https://github.com/Hiteshydv001/AI-Waifu" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1" /> View Source
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-purple-200">
            <Play className="h-4 w-4" />
            🎥 Video Demonstration
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900">See Ananya in Action</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Watch this comprehensive demo showcasing all the key features, from voice interaction to 3D avatar expressions and real-time AI responses.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="backdrop-blur-lg bg-white/80 border border-gray-200 overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-video bg-muted/20 rounded-lg overflow-hidden">
                <iframe 
                  title="vimeo-player" 
                  src="https://player.vimeo.com/video/1109113682?h=d71fcb76a4&title=0&byline=0&portrait=0&controls=1&color=8b5cf6" 
                  className="w-full h-full"
                  frameBorder="0" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"   
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
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
          <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900">What You'll See</h2>
          <p className="text-lg text-gray-600">Key features demonstrated in the video</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {demoFeatures.map((feature, index) => (
            <Card key={index} className="backdrop-blur-lg bg-white/80 border border-gray-200 text-center hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600 w-fit mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Project Stats */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900">Performance Metrics</h2>
          <p className="text-lg text-gray-600">Technical specifications that power the experience</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {projectStats.map((stat, index) => (
            <Card key={index} className="backdrop-blur-lg bg-white/80 border border-gray-200 text-center">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="text-primary">
                    {stat.icon}
                  </div>
                  <span className="text-2xl font-bold text-gradient">{stat.value}</span>
                </div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Project Information */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 border border-blue-200 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              🚀 Project Information
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-6 text-gray-900">
              The Future of AI Companionship
            </h2>
            <div className="space-y-4 text-gray-600">
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
            <Card className="backdrop-blur-lg bg-white/80 border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5" />
                  Technical Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Backend</span>
                  <Badge variant="secondary">Python + FastAPI</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Frontend</span>
                  <Badge variant="secondary">React + TypeScript</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">3D Engine</span>
                  <Badge variant="secondary">Three.js + VRM</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">AI Models</span>
                  <Badge variant="secondary">Multi-provider</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-lg bg-white/80 border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community & Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Join our growing community of developers and AI enthusiasts building the future of digital companionship.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <a href="https://github.com/Hiteshydv001/AI-Waifu" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      GitHub
                    </a>
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
          <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900">What People Are Saying</h2>
          <p className="text-lg text-gray-600">Feedback from our community</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="backdrop-blur-lg bg-white/80 border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-gray-600 text-xs">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <Card className="backdrop-blur-lg bg-white/80 border border-gray-200 text-center p-8 sm:p-12">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900">
              Ready to Experience Ananya?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
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
