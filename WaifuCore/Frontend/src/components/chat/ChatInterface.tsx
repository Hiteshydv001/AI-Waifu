import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { Mic, MicOff, Send } from "lucide-react";

export type ChatMessage = { role: "user" | "assistant"; content: string };

const LLM_OPTIONS = [
  { value: "groq", label: "Groq" },
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
];
const TTS_OPTIONS = [
  { value: "coqui", label: "Coqui" },
  { value: "kokoro", label: "Kokoro" },
];

interface ChatInterfaceProps {
  onSpeakingChange?: (speaking: boolean) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSpeakingChange }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [llm, setLlm] = useState(() => localStorage.getItem("pref_llm") || LLM_OPTIONS[0].value);
  const [tts, setTts] = useState(() => localStorage.getItem("pref_tts") || TTS_OPTIONS[0].value);

  const { isRecording, start, stop, audioBlob, audioURL, durationMs } = useAudioRecorder();
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem("pref_llm", llm);
  }, [llm]);
  useEffect(() => {
    localStorage.setItem("pref_tts", tts);
  }, [tts]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const canSend = useMemo(() => text.trim().length > 0 || !!audioBlob, [text, audioBlob]);

  const demoRespond = async () => {
    onSpeakingChange?.(true);
    await new Promise((r) => setTimeout(r, 900));
    setMessages((m) => [...m, { role: "assistant", content: "Hi! I'm Ananya. This is a demo reply. Connect your backend to power real LLM + TTS." }]);
    onSpeakingChange?.(false);
  };

  const send = async () => {
    if (!canSend) return;
    const userMsg = text.trim().length ? text.trim() : "🎤 (Voice message)";
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setText("");
    await demoRespond();
  };

  return (
    <Card className="h-full bg-card/60">
      <CardHeader>
        <CardTitle className="text-lg">Conversation with Ananya</CardTitle>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">LLM Provider</label>
            <Select value={llm} onValueChange={setLlm}>
              <SelectTrigger>
                <SelectValue placeholder="Select LLM" />
              </SelectTrigger>
              <SelectContent>
                {LLM_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">TTS Provider</label>
            <Select value={tts} onValueChange={setTts}>
              <SelectTrigger>
                <SelectValue placeholder="Select TTS" />
              </SelectTrigger>
              <SelectContent>
                {TTS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col h-[560px]">
        <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.length === 0 && (
            <div className="text-sm text-muted-foreground">Say something to Ananya, or type below. Model preferences are saved automatically.</div>
          )}
          {messages.map((m, idx) => (
            <div key={idx} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
              {m.content}
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-2">
          {audioURL && (
            <audio className="w-full" src={audioURL} controls />
          )}
          <div className="flex items-center gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Hi Ananya..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <Button
              variant={isRecording ? "destructive" : "secondary"}
              onClick={() => (isRecording ? stop() : start())}
              title={isRecording ? "Stop recording" : "Record voice"}
            >
              {isRecording ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              <span className="sr-only">Toggle recording</span>
            </Button>
            <Button onClick={send} disabled={!canSend}>
              <Send className="size-4" />
              Send
            </Button>
          </div>
          {isRecording && (
            <div className="text-xs text-muted-foreground">Recording... {(durationMs / 1000).toFixed(1)}s</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
