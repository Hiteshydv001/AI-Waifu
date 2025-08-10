import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { Mic, MicOff, Send, LoaderCircle, Sparkles } from "lucide-react";

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
  const { isRecording, start, stop, audioBlob, setAudioBlob, audioURL, setAudioURL } = useAudioRecorder();
  const listRef = useRef<HTMLDivElement | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [llmOptions, setLlmOptions] = useState([{ value: "groq", label: "Groq (Default)" }]);
  const [ttsOptions, setTtsOptions] = useState([{ value: "coqui", label: "Coqui (Default)" }]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/settings`);
        if (!response.ok) throw new Error("Failed to fetch settings");
        const data = await response.json();
        setLlmOptions(data.llm_providers.map((p: string) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) })));
        setTtsOptions(data.tts_providers.map((p: string) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) })));
      } catch (error) { console.error("Could not fetch settings from backend:", error); }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const socket = new WebSocket(`${WS_BASE_URL}/ws/chat?llm=${llm}&tts=${tts}`);
    ws.current = socket;
    socket.onopen = () => { onStatusChange?.({ state: "idle", animation: "neutral" }); };
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // --- THE SYNC FIX LOGIC ---
      // Handle non-audio messages (state, text, action) first
      if (data.text !== undefined) {
        setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') { lastMessage.content = data.text; }
            return newMessages;
        });
      }
      if (data.action) {
        onPlayAnimation?.(data.action);
      }
      if (data.state) {
        setCharacterState(data.state);
        // IMPORTANT: Only update parent state if NOT speaking.
        // The 'speaking' state will be triggered by the audio message.
        if (data.state !== 'speaking') {
          onStatusChange?.({ state: data.state, animation: data.animation || 'neutral' });
        }
      }

      // Handle the dedicated audio message to trigger lip-sync
      if (data.audio) {
        const animation = data.animation || 'neutral';
        // NOW we tell the parent to start the 'speaking' animation.
        onStatusChange?.({ state: "speaking", animation: animation });
        setCharacterState("speaking");
        
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
    return () => {
      socket.close();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
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

  return (
    <Card className="h-full bg-card/60">
      <CardHeader>
        <CardTitle className="text-lg">Conversation with Ananya</CardTitle>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div><label className="mb-1 block text-xs text-muted-foreground">LLM Provider</label><Select value={llm} onValueChange={setLlm}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{llmOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}</SelectContent></Select></div>
          <div><label className="mb-1 block text-xs text-muted-foreground">TTS Provider</label><Select value={tts} onValueChange={setTts}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{ttsOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}</SelectContent></Select></div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col h-[560px]">
        <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
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
                <Button variant={isRecording ? "destructive" : "secondary"} onClick={isRecording ? stop : start} disabled={characterState !== 'idle'} title={isRecording ? "Stop recording" : "Record voice"}>{isRecording ? <MicOff className="size-4" /> : <Mic className="size-4" />}</Button>
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