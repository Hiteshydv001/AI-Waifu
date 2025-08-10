import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import {
  Mic,
  MicOff,
  Send,
  LoaderCircle,
  Sparkles,
  Settings,
  ChevronDown,
  User,
  Bot,
  Volume2,
  Trash2,
  MoreVertical
} from "lucide-react";

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
  const [llm, setLlm] = useState(() => localStorage.getItem("pref_llm") || "groq");
  const [tts, setTts] = useState(() => localStorage.getItem("pref_tts") || "coqui");
  const [characterState, setCharacterState] = useState<CharacterStatus["state"]>("idle");
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>(() => localStorage.getItem("pref_mic") || "default");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const { isRecording, start, stop, audioBlob, setAudioBlob, audioURL, setAudioURL } = useAudioRecorder();
  const listRef = useRef<HTMLDivElement | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // These are the states that were not being updated correctly.
  const [llmOptions, setLlmOptions] = useState([{ value: "groq", label: "Groq (Default)" }]);
  const [ttsOptions, setTtsOptions] = useState([{ value: "coqui", label: "Coqui (Default)" }]);

  // --- THIS ENTIRE useEffect BLOCK WAS MISSING AND IS NOW RESTORED ---
  useEffect(() => {
    // This function fetches the available models from your backend.
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/settings`);
        if (!response.ok) throw new Error("Failed to fetch settings");
        const data = await response.json();
        setLlmOptions(data.llm_providers.map((p: string) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) })));
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
        userMessageContent = "🎤 (Voice message)";
        const b64 = await blobToBase64(audioBlob);
        ws.current.send(JSON.stringify({ type: "audio", payload: b64 }));
        setAudioBlob(null);
        setAudioURL("");
    }
    setMessages(m => [...m, { role: "user", content: userMessageContent }, { role: "assistant", content: "" }]);
    setCharacterState("thinking");
    onStatusChange?.({ state: "thinking", animation: "thinking" });
  };

  // Message component for better organization
  const MessageBubble = ({ message, index }: { message: ChatMessage; index: number }) => {
    const isUser = message.role === "user";
    const isVoiceMessage = message.content.includes("🎤");

    return (
      <div
        className={`flex gap-3 mb-4 animate-in slide-in-from-bottom-2 duration-300 ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <Avatar className={`w-8 h-8 ${isUser ? "ml-2" : "mr-2"} ring-2 ring-border/20`}>
          <AvatarImage src={isUser ? undefined : "/ananya-avatar.png"} />
          <AvatarFallback className={`text-xs font-medium ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-gradient-to-br from-violet-500 to-pink-500 text-white"
          }`}>
            {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </AvatarFallback>
        </Avatar>

        <div className={`flex flex-col max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
          <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${
            isUser
              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md"
              : "bg-muted/80 text-foreground rounded-bl-md border border-border/50"
          }`}>
            {isVoiceMessage && (
              <div className="flex items-center gap-2 mb-1">
                <Volume2 className="w-3 h-3 opacity-70" />
                <span className="text-xs opacity-70">Voice message</span>
              </div>
            )}
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
            {message.role === 'assistant' && !message.content && (
              <div className="flex items-center gap-2">
                <LoaderCircle className="w-4 h-4 animate-spin" />
                <span className="text-xs opacity-70">Thinking...</span>
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground mt-1 px-1">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full surface-card flex flex-col overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 ring-2 ring-violet-500/20">
              <AvatarImage src="/ananya-avatar.png" />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-pink-500 text-white">
                <Bot className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-semibold text-gradient">
                Ananya
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={characterState === "idle" ? "secondary" : "default"}
                  className="text-xs px-2 py-0.5"
                >
                  {characterState === "idle" && "Online"}
                  {characterState === "thinking" && "Thinking..."}
                  {characterState === "speaking" && "Speaking..."}
                </Badge>
              </div>
            </div>
          </div>

          <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="w-4 h-4" />
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>

        <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <CollapsibleContent className="space-y-3 pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  LLM Provider
                </label>
                <Select value={llm} onValueChange={setLlm}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {llmOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  TTS Provider
                </label>
                <Select value={tts} onValueChange={setTts}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ttsOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Microphone
              </label>
              <Select value={selectedMic} onValueChange={setSelectedMic}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select a microphone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Microphone</SelectItem>
                  {mics.map((mic) => (
                    <SelectItem key={mic.deviceId} value={mic.deviceId}>
                      {mic.label || `Mic ${mics.indexOf(mic) + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-6 pt-0 overflow-hidden">
        <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
          {messages.length === 0 && (<div className="text-sm text-muted-foreground">Say something to Ananya...</div>)}
          {messages.map((m, idx) => (<div key={idx} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>{m.content}{m.role === 'assistant' && !m.content && <LoaderCircle className="size-4 animate-spin inline-block" />}</div>))}
        </div>
        <div className="flex justify-center items-center gap-2 py-2 border-t mt-3 text-xs text-muted-foreground"><Sparkles className="size-4" /> <span>Actions</span></div>
        <div className="flex justify-center gap-2 pb-3">
            <Button variant="outline" size="sm" onClick={() => onPlayAnimation?.('dance')}>Dance</Button>
            <Button variant="outline" size="sm" onClick={() => onPlayAnimation?.('shy')}>Be Shy</Button>
            <Button variant="ghost" size="sm" onClick={() => onPlayAnimation?.(null)}>Stop</Button>
        </div>
        <div className="mt-auto pt-3 border-t space-y-2">
            {audioURL && (<div className="flex items-center gap-2"><audio className="w-full h-10" src={audioURL} controls /><Button variant="ghost" size="sm" onClick={() => { setAudioURL(""); setAudioBlob(null);}}>Clear</Button></div>)}
            <div className="flex items-center gap-2">
                <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={isRecording ? "Recording..." : (characterState !== 'idle' ? `${characterState}...` : "Hi Ananya...")} disabled={isRecording || characterState !== 'idle'} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}/>
                <Button variant={isRecording ? "destructive" : "secondary"} onClick={isRecording ? stop : () => start(selectedMic)} disabled={characterState !== 'idle'} title={isRecording ? "Stop recording" : "Record voice"}>{isRecording ? <MicOff className="size-4" /> : <Mic className="size-4" />}</Button>
                <Button onClick={send} disabled={!canSend}>
                    {characterState !== 'idle' ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
                    <span className="ml-2 hidden sm:inline">Send</span>
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;