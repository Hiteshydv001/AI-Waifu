import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { Mic, MicOff, Send, LoaderCircle, Sparkles, Heart, Settings, Volume2, Users, MoreVertical, Copy, Download, RefreshCw, Trash2 } from "lucide-react";

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type CharacterStatus = { state: "idle" | "thinking" | "speaking"; animation: string; };

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = (reader.result as string)?.split(",")[1];
      resolve(base64data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');

interface ChatInterfaceProps {
  onStatusChange?: (status: CharacterStatus) => void;
  onPlayAnimation?: (animationName: string | null) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onStatusChange, onPlayAnimation }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [llm, setLlm] = useState(() => localStorage.getItem("pref_llm") || "gemini");
  const [tts, setTts] = useState(() => localStorage.getItem("pref_tts") || "coqui");
  const [characterState, setCharacterState] = useState<CharacterStatus["state"]>("idle");
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>(() => localStorage.getItem("pref_mic") || "default");
  const [showSettings, setShowSettings] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  
  const { isRecording, start, stop, audioBlob, setAudioBlob, audioURL, setAudioURL } = useAudioRecorder();
  const listRef = useRef<HTMLDivElement | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // These are the hardcoded default options that show even when backend is not running
  const [llmOptions, setLlmOptions] = useState([
    { value: "gemini", label: "Gemini 1.5 Flash" },
    { value: "groq-llama3-8b-8192", label: "Llama 3 8B (Groq)" },
    { value: "groq-llama3-70b-8192", label: "Llama 3 70B (Groq)" },
    { value: "groq-mixtral-8x7b-32768", label: "Mixtral 8x7B (Groq)" },
    { value: "groq-gemma-7b-it", label: "Gemma 7B (Groq)" },
    { value: "groq-llama-3.1-8b-instant", label: "Llama 3.1 8B Instant (Groq)" },
    { value: "groq-llama-3.1-70b-versatile", label: "Llama 3.1 70B Versatile (Groq)" },
    { value: "ollama", label: "Ollama (Local)" }
  ]);
  const [ttsOptions, setTtsOptions] = useState([
    { value: "coqui", label: "Coqui TTS" },
    { value: "kokoro", label: "Kokoro TTS" },
    { value: "elevenlabs", label: "ElevenLabs TTS" }
  ]);

  // --- THIS ENTIRE useEffect BLOCK WAS MISSING AND IS NOW RESTORED ---
  useEffect(() => {
    // This function fetches the available models from your backend.
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/settings`);
        if (!response.ok) throw new Error("Failed to fetch settings");
        const data = await response.json();
        
        // Handle LLM providers - they now come as objects with value and label
        if (Array.isArray(data.llm_providers)) {
          if (data.llm_providers.length > 0 && typeof data.llm_providers[0] === 'object') {
            // New format: array of objects with value and label
            setLlmOptions(data.llm_providers);
          } else {
            // Old format: array of strings
            setLlmOptions(data.llm_providers.map((p: string) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) })));
          }
        }
        
        // Handle TTS providers - they come as strings
        setTtsOptions(data.tts_providers.map((p: string) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) })));
      } catch (error) {
        console.error("Could not fetch settings from backend:", error);
      }
    };
    
    // Get microphone list
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        navigator.mediaDevices.enumerateDevices().then(devices => {
          setMics(devices.filter(device => device.kind === 'audioinput'));
        });
        stream.getTracks().forEach(track => track.stop());
      }).catch(err => console.error("Mic permissions error:", err));
      
    fetchSettings();
  }, []);
  
  useEffect(() => { localStorage.setItem("pref_mic", selectedMic); }, [selectedMic]);

  useEffect(() => {
    const socket = new WebSocket(`${WS_BASE_URL}/ws/chat?llm=${llm}&tts=${tts}`);
    ws.current = socket;
    socket.onopen = () => { onStatusChange?.({ state: "idle", animation: "neutral" }); };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.state && data.animation) onStatusChange?.({ state: data.state, animation: data.animation });
      if (data.state) setCharacterState(data.state);
      if (data.action) onPlayAnimation?.(data.action);
      if (data.text !== undefined && data.text !== null) {
        setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') { lastMessage.content = data.text; }
            return newMessages;
        });
      }
      if (data.audio) {
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
        const newAudio = new Audio(`data:audio/wav;base64,${data.audio}`);
        audioRef.current = newAudio;
        newAudio.play();
        newAudio.onended = () => {
          onStatusChange?.({ state: "idle", animation: "neutral" });
          setCharacterState("idle");
          if (audioRef.current === newAudio) { audioRef.current = null; }
        };
      }
    };
    socket.onclose = () => onStatusChange?.({ state: "idle", animation: "neutral" });
    return () => { socket.close(); if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } };
  }, [llm, tts, onStatusChange, onPlayAnimation]);

  useEffect(() => { localStorage.setItem("pref_llm", llm); localStorage.setItem("pref_tts", tts); }, [llm, tts]);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);
  useEffect(() => { 
    if (characterState === 'idle') {
      setIsTyping(false);
    }
  }, [characterState]);

  const canSend = useMemo(() => (text.trim().length > 0 || !!audioBlob) && characterState === 'idle', [text, audioBlob, characterState]);

  const send = async () => {
    if (!canSend || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    onPlayAnimation?.(null);
    let userMessageContent = "";
    
    if (text.trim().length > 0) {
        userMessageContent = text.trim();
        ws.current.send(JSON.stringify({ type: "text", payload: text.trim() }));
        setText("");
    } else if (audioBlob) {
        userMessageContent = "🎤 Voice message";
        const b64 = await blobToBase64(audioBlob);
        ws.current.send(JSON.stringify({ type: "audio", payload: b64 }));
        setAudioBlob(null);
        setAudioURL("");
    }
    
    setMessages(m => [...m, { role: "user", content: userMessageContent }, { role: "assistant", content: "" }]);
    setCharacterState("thinking");
    onStatusChange?.({ state: "thinking", animation: "thinking" });
    setIsTyping(true);
  };

  const clearConversation = () => {
    setMessages([]);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="h-full bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-sm border-border/50 shadow-xl flex flex-col overflow-hidden">
      <CardHeader className="border-b border-border/20 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-blue-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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
              <CardTitle className="text-lg bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Ananya
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${characterState === 'idle' ? 'bg-green-500 animate-pulse' : characterState === 'thinking' ? 'bg-yellow-500 animate-ping' : 'bg-blue-500 animate-pulse'}`}></div>
                  <span className="text-xs text-muted-foreground capitalize">
                    {characterState === 'thinking' ? 'Thinking...' : characterState === 'speaking' ? 'Speaking...' : 'Online'}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">AI Companion</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSettings(!showSettings)}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearConversation}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {showSettings && (
          <div className="mt-4 space-y-4 p-5 bg-muted/30 rounded-lg border border-border/20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">LLM Provider</label>
                <Select value={llm} onValueChange={setLlm}>
                  <SelectTrigger className="h-10">
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent>
                    {llmOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">TTS Provider</label>
                <Select value={tts} onValueChange={setTts}>
                  <SelectTrigger className="h-10">
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent>
                    {ttsOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">Microphone Device</label>
                <Select value={selectedMic} onValueChange={setSelectedMic}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select a microphone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Microphone</SelectItem>
                    {mics.map((mic) => (
                      <SelectItem key={mic.deviceId} value={mic.deviceId}>
                        {mic.label || `Microphone ${mics.indexOf(mic) + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col p-0 overflow-hidden">
        {/* Message Area */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="mb-6">
                <Sparkles className="h-16 w-16 text-pink-400 mx-auto mb-3 animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Start a conversation with Ananya
              </h3>
              <p className="text-base text-muted-foreground max-w-lg mb-6">
                Ask me anything! I'm here to chat, help, or just keep you company. 💖
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-2xl">
                <Button variant="ghost" size="sm" onClick={() => setText("Hi Ananya! How are you?")} className="bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 px-4 py-3 h-auto">
                  <div className="text-center">
                    <div className="text-lg mb-1">👋</div>
                    <div className="text-xs">Say Hello</div>
                  </div>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setText("Tell me about yourself")} className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-4 py-3 h-auto">
                  <div className="text-center">
                    <div className="text-lg mb-1">💫</div>
                    <div className="text-xs">About You</div>
                  </div>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setText("What can you help me with?")} className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-4 py-3 h-auto">
                  <div className="text-center">
                    <div className="text-lg mb-1">✨</div>
                    <div className="text-xs">Your Abilities</div>
                  </div>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setText("How was your day?")} className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-4 py-3 h-auto">
                  <div className="text-center">
                    <div className="text-lg mb-1">☀️</div>
                    <div className="text-xs">Daily Chat</div>
                  </div>
                </Button>
              </div>
            </div>
          )}
          
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`flex-shrink-0 ${m.role === "user" ? "order-2" : ""}`}>
                {m.role === "assistant" ? (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 p-0.5">
                    <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
                      <div className="text-base">👧</div>
                    </div>
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              
              <div className={`flex-1 ${m.role === "user" ? "order-1" : ""}`}>
                <div className={`max-w-[95%] ${m.role === "user" ? "ml-auto" : ""}`}>
                  <div className={`rounded-2xl px-6 py-4 text-base relative group ${
                    m.role === "user" 
                      ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white ml-auto" 
                      : "bg-muted/60 backdrop-blur-sm border border-border/20"
                  }`}>
                    {m.content ? (
                      <>
                        <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyMessage(m.content)}
                          className={`absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                            m.role === "user" ? "text-white/70 hover:text-white" : "text-muted-foreground"
                          }`}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-3">
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                        <span className="text-muted-foreground">Ananya is thinking...</span>
                      </div>
                    )}
                  </div>
                  <div className={`text-xs text-muted-foreground mt-2 ${m.role === "user" ? "text-right" : ""}`}>
                    {formatTime()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Audio Preview */}
        {audioURL && (
          <div className="px-4 py-2 border-t border-border/20 bg-muted/20">
            <div className="flex items-center gap-3">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <audio className="flex-1 h-8" src={audioURL} controls />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setAudioURL(""); setAudioBlob(null); }}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-6 border-t border-border/20 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <div className="relative">
                <Input 
                  value={text} 
                  onChange={(e) => setText(e.target.value)}
                  placeholder={
                    isRecording 
                      ? "🎤 Recording..." 
                      : characterState !== 'idle' 
                        ? `Ananya is ${characterState}...` 
                        : "Type your message to Ananya..."
                  }
                  disabled={isRecording || characterState !== 'idle'}
                  onKeyDown={(e) => { 
                    if (e.key === "Enter" && !e.shiftKey) { 
                      e.preventDefault(); 
                      send(); 
                    }
                  }}
                  className="h-14 pr-12 text-base bg-background/80 backdrop-blur-sm border-border/30 focus:border-pink-300 focus:ring-pink-200 rounded-xl"
                />
                {text && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setText("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            
            <Button 
              variant={isRecording ? "destructive" : "outline"} 
              onClick={isRecording ? stop : () => start(selectedMic)} 
              disabled={characterState !== 'idle'}
              className={`h-14 w-14 p-0 rounded-xl ${
                isRecording 
                  ? "animate-pulse" 
                  : "bg-gradient-to-br from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 border-pink-200"
              }`}
              title={isRecording ? "Stop recording" : "Record voice"}
            >
              {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
            
            <Button 
              onClick={send} 
              disabled={!canSend}
              className="h-14 px-8 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
            >
              {characterState !== 'idle' ? (
                <LoaderCircle className="h-6 w-6 animate-spin" />
              ) : (
                <Send className="h-6 w-6" />
              )}
              <span className="ml-3 hidden sm:inline text-base font-medium">Send</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;