import { useCallback, useRef, useState } from "react";

export const useAudioRecorder = () => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string>("");

  const start = useCallback(async (deviceId: string) => {
    // Clear previous recording before starting
    setAudioBlob(null);
    setAudioURL("");

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Your browser does not support audio recording.");
        return;
      }

      // Create audio constraints to use the selected microphone
      const audioConstraints: MediaTrackConstraints = {
        deviceId: deviceId === 'default' ? undefined : { exact: deviceId }
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
      
      // Use a higher quality MIME type if available
      const mimeType = MediaRecorder.isTypeSupported("audio/webm; codecs=opus")
        ? "audio/webm; codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioURL(url);
        // Clean up the stream tracks to turn off the microphone light
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting audio recording:", error);
      alert("Could not start recording. Please ensure microphone permissions are granted and the correct device is selected.");
      setIsRecording(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  return { isRecording, start, stop, audioBlob, setAudioBlob, audioURL, setAudioURL };
};