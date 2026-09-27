import { useSyncExternalStore } from "react";

export interface QuizResult {
  score: number;
  total: number;
  completedAt: string;
  revisionTopics: string[];
}

export interface LearningProgress {
  exploredModes: string[];
  exploredObjects: string[];
  studiedTopics: string[];
  completedModules: string[];
  quizResults: Record<string, QuizResult>;
  gestureActions: number;
  voiceCommands: number;
}

const STORAGE_KEY = "learn-beyond-progress-v1";
const EVENT_NAME = "learn-beyond-progress-change";

const EMPTY_PROGRESS: LearningProgress = {
  exploredModes: [],
  exploredObjects: [],
  studiedTopics: [],
  completedModules: [],
  quizResults: {},
  gestureActions: 0,
  voiceCommands: 0,
};

let serverSnapshot = EMPTY_PROGRESS;
let cachedRaw: string | null = null;
let cachedProgress = EMPTY_PROGRESS;

function unique(values: string[]) {
  return Array.from(new Set(values));
}

export function getLearningProgress(): LearningProgress {
  if (typeof window === "undefined") return serverSnapshot;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedProgress;
  cachedRaw = raw;
  if (!raw) {
    cachedProgress = EMPTY_PROGRESS;
    return cachedProgress;
  }
  try {
    cachedProgress = { ...EMPTY_PROGRESS, ...JSON.parse(raw) } as LearningProgress;
  } catch {
    cachedProgress = EMPTY_PROGRESS;
  }
  return cachedProgress;
}

export function updateLearningProgress(updater: (current: LearningProgress) => LearningProgress) {
  const next = updater(getLearningProgress());
  cachedProgress = {
    ...next,
    exploredModes: unique(next.exploredModes),
    exploredObjects: unique(next.exploredObjects),
    studiedTopics: unique(next.studiedTopics),
    completedModules: unique(next.completedModules),
  };
  cachedRaw = JSON.stringify(cachedProgress);
  window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function trackProgress(kind: "mode" | "object" | "topic" | "gesture" | "voice", value?: string) {
  updateLearningProgress((current) => {
    if (kind === "mode" && value) return { ...current, exploredModes: [...current.exploredModes, value] };
    if (kind === "object" && value) return { ...current, exploredObjects: [...current.exploredObjects, value] };
    if (kind === "topic" && value) return { ...current, studiedTopics: [...current.studiedTopics, value] };
    if (kind === "gesture") return { ...current, gestureActions: current.gestureActions + 1 };
    if (kind === "voice") return { ...current, voiceCommands: current.voiceCommands + 1 };
    return current;
  });
}

export function saveQuizResult(moduleId: string, result: QuizResult) {
  updateLearningProgress((current) => ({
    ...current,
    completedModules: [...current.completedModules, moduleId],
    quizResults: { ...current.quizResults, [moduleId]: result },
  }));
}

export function resetLearningProgress() {
  cachedRaw = null;
  cachedProgress = EMPTY_PROGRESS;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(EVENT_NAME));
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useLearningProgress() {
  return useSyncExternalStore(subscribe, getLearningProgress, () => serverSnapshot);
}

export function calculateOverallProgress(progress: LearningProgress) {
  const topicScore = Math.min(35, progress.studiedTopics.length * 1.5);
  const modelScore = Math.min(25, progress.exploredModes.length * 5);
  const quizScore = Math.min(30, Object.keys(progress.quizResults).length * 6);
  const interactionScore = Math.min(10, (progress.gestureActions + progress.voiceCommands) * 0.5);
  return Math.round(topicScore + modelScore + quizScore + interactionScore);
}