export type VoiceCommand = "next" | "previous" | "start-animation" | "pause-animation" | "reset-model" | "open-gesture" | "explain-namenode" | "show-datanodes" | "open-lab" | "open-progress";

interface SpeechRecognitionEventLike {
  results: ArrayLike<{ 0: { transcript: string } }>;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function parseVoiceCommand(transcript: string): VoiceCommand | null {
  const value = transcript.toLowerCase().trim();
  if (value.includes("start animation") || value.includes("play animation")) return "start-animation";
  if (value.includes("pause animation") || value.includes("stop animation")) return "pause-animation";
  if (value.includes("reset model") || value.includes("reset camera")) return "reset-model";
  if (value.includes("open gesture")) return "open-gesture";
  if (value.includes("explain") && value.includes("name")) return "explain-namenode";
  if (value.includes("show") && value.includes("data node")) return "show-datanodes";
  if (value.includes("open") && value.includes("lab")) return "open-lab";
  if (value.includes("open") && value.includes("progress")) return "open-progress";
  if (value.includes("previous")) return "previous";
  if (value.includes("next")) return "next";
  return null;
}

export function createSpeechRecognition(onTranscript: (transcript: string, command: VoiceCommand | null) => void, onError: () => void, onEnd: () => void) {
  const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  if (!Recognition) return null;
  const recognition = new Recognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.onresult = (event) => {
    const transcript = event.results[0]?.[0]?.transcript ?? "";
    onTranscript(transcript, parseVoiceCommand(transcript));
  };
  recognition.onerror = onError;
  recognition.onend = onEnd;
  return recognition;
}