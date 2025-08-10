import { useCallback, useEffect, useRef, useState } from "react";

export const useAudioRecorder = () => {
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const rafRef = useRef<number | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);

  const tick = useCallback((start: number) => {
    setDurationMs(Date.now() - start);
    rafRef.current = requestAnimationFrame(() => tick(start));
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
      };
      mediaRecorderRef.current = rec;
      rec.start();
      setDurationMs(0);
      setIsRecording(true);
      const started = Date.now();
      rafRef.current = requestAnimationFrame(() => tick(started));
    } catch (e) {
      console.error("Mic permission/recording failed", e);
      stop();
    }
  }, [tick]);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setIsRecording(false);
    try {
      mediaRecorderRef.current?.state === "recording" && mediaRecorderRef.current?.stop();
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {}
  }, []);

  useEffect(() => {
    return () => {
      stop();
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
  }, [stop, audioURL]);

  return { isRecording, start, stop, audioBlob, audioURL, durationMs };
};
