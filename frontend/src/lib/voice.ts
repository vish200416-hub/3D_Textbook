export type VoiceCommand = "next" | "previous" | "start-animation" | "pause-animation" | "reset-model" | "open-gesture" | "explain-namenode" | "show-datanodes" | "open-lab" | "open-progress" | "open-hdfs" | "open-foundations" | "open-mongodb" | "open-hive-pig" | "open-spark-web" | "open-hdfs-animation" | "open-mongodb-animation" | "open-hive-pig-animation" | "open-spark-web-animation" | "zoom-in" | "zoom-out" | "select-namenode" | "select-datanode" | "select-client" | "select-block" | "select-mongodb" | "select-document";

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
  const compactValue = value.replaceAll(/[^a-z0-9]/g, "");
  const mentions = (spaced: string, compact: string) => value.includes(spaced) || compactValue.includes(compact);
  const asksForAnimation = value.includes("animation") || value.includes("simulation");
  if ((value.includes("open") || value.includes("show")) && value.includes("mongo")) return asksForAnimation ? "open-mongodb-animation" : "open-mongodb";
  if ((value.includes("open") || value.includes("show")) && value.includes("hdfs")) return asksForAnimation ? "open-hdfs-animation" : "open-hdfs";
  if ((value.includes("open") || value.includes("show")) && (value.includes("hive") || value.includes("pig"))) return asksForAnimation ? "open-hive-pig-animation" : "open-hive-pig";
  if ((value.includes("open") || value.includes("show")) && (value.includes("spark") || value.includes("web graph"))) return asksForAnimation ? "open-spark-web-animation" : "open-spark-web";
  if ((value.includes("open") || value.includes("show")) && (value.includes("foundation") || value.includes("5v"))) return "open-foundations";
  if (value.includes("zoom in")) return "zoom-in";
  if (value.includes("zoom out")) return "zoom-out";
  if ((value.includes("select") || value.includes("explain")) && mentions("name node", "namenode")) return "select-namenode";
  if ((value.includes("select") || value.includes("explain")) && mentions("data node", "datanode")) return "select-datanode";
  if ((value.includes("select") || value.includes("explain")) && value.includes("client")) return "select-client";
  if ((value.includes("select") || value.includes("explain")) && value.includes("block")) return "select-block";
  if ((value.includes("select") || value.includes("explain")) && value.includes("document")) return "select-document";
  if ((value.includes("select") || value.includes("explain")) && value.includes("mongo")) return "select-mongodb";
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