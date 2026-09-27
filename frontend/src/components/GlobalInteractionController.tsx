import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, CameraOff, ChevronDown, Hand, Lock, Mic, MicOff, MousePointer2, RefreshCw, ScanFace, X } from "lucide-react";
import type { FaceDetector, HandLandmarker } from "@mediapipe/tasks-vision";
import { createVisionTasks } from "@/lib/gesture/vision";
import { chooseClosestHand, GestureStateMachine, interpretHand, type FaceCenter, type HandCandidate, type Point2D } from "@/lib/gesture/recognition";
import { trackProgress } from "@/lib/progress";
import { createSpeechRecognition, type VoiceCommand } from "@/lib/voice";

type ControllerStatus = "off" | "loading" | "ready" | "searching" | "error";

interface TasksRef { hands: HandLandmarker; faces: FaceDetector | null }

function friendlyCameraError(error: unknown) {
  if (error instanceof DOMException && error.name === "NotAllowedError") return "Camera permission was denied. Mouse controls are still available.";
  if (error instanceof DOMException && error.name === "NotFoundError") return "No webcam was found. Continue with mouse controls.";
  return "Gesture tracking could not start. Check your connection, then retry or use the mouse.";
}

function emitInteraction(name: string, detail?: unknown) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export default function GlobalInteractionController() {
  const navigate = useNavigate();
  const [panelOpen, setPanelOpen] = useState(false);
  const [status, setStatus] = useState<ControllerStatus>("off");
  const [statusMessage, setStatusMessage] = useState("Mouse controls active");
  const [gestureName, setGestureName] = useState("Waiting");
  const [confidence, setConfidence] = useState(0);
  const [lockedHand, setLockedHand] = useState<string | null>(null);
  const [pointer, setPointer] = useState<Point2D | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("Voice ready");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const tasksRef = useRef<TasksRef | null>(null);
  const frameRef = useRef(0);
  const activeRef = useRef(false);
  const lastVideoTimeRef = useRef(-1);
  const lastInferenceRef = useRef(0);
  const lockedHandRef = useRef<string | null>(null);
  const lockLostAtRef = useRef(0);
  const machineRef = useRef(new GestureStateMachine());
  const recognitionRef = useRef<ReturnType<typeof createSpeechRecognition>>(null);

  const stopGestureControl = useCallback(() => {
    activeRef.current = false;
    window.cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    tasksRef.current?.hands.close();
    tasksRef.current?.faces?.close();
    tasksRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    lockedHandRef.current = null;
    machineRef.current.reset();
    setPointer(null);
    setLockedHand(null);
    setConfidence(0);
    setGestureName("Waiting");
    setStatus("off");
    setStatusMessage("Mouse controls active");
  }, []);

  const actAtPointer = useCallback((point: Point2D) => {
    const x = Math.max(0, Math.min(window.innerWidth - 1, point.x * window.innerWidth));
    const y = Math.max(0, Math.min(window.innerHeight - 1, point.y * window.innerHeight));
    const target = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!target) return;
    if (target instanceof HTMLCanvasElement && target.closest('[data-testid="three-canvas-host"]')) {
      emitInteraction("lesson-select-at", { clientX: x, clientY: y });
      return;
    }
    target.click();
  }, []);

  const processEvents = useCallback((events: ReturnType<GestureStateMachine["process"]>) => {
    events.forEach((event) => {
      setGestureName(event.name);
      trackProgress("gesture");
      if (event.name === "point") setPointer(event.detail as Point2D);
      if (event.name === "double-tap") actAtPointer(event.detail as Point2D);
      if (event.name === "pinch-zoom") emitInteraction("lesson-zoom", event.detail);
      if (event.name === "two-finger-rotate") emitInteraction("lesson-rotate", event.detail);
      if (event.name === "palm-slide") {
        const delta = event.detail as Point2D;
        if (Math.abs(delta.y) > Math.abs(delta.x)) window.scrollBy({ top: delta.y * 900, behavior: "smooth" });
        else emitInteraction("lesson-swipe", delta.x > 0 ? "next" : "previous");
      }
    });
  }, [actAtPointer]);

  const inferenceLoop = useCallback(() => {
    if (!activeRef.current || !videoRef.current || !tasksRef.current) return;
    const video = videoRef.current;
    const timestamp = performance.now();
    if (video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current && timestamp - lastInferenceRef.current >= 66) {
      lastVideoTimeRef.current = video.currentTime;
      lastInferenceRef.current = timestamp;
      const handResult = tasksRef.current.hands.detectForVideo(video, timestamp);
      let faceDetections: ReturnType<FaceDetector["detectForVideo"]>["detections"] = [];
      if (tasksRef.current.faces) {
        try {
          faceDetections = tasksRef.current.faces.detectForVideo(video, timestamp).detections;
        } catch {
          // Isolate a face graph failure so hand control never crashes the app.
          tasksRef.current.faces.close();
          tasksRef.current.faces = null;
          setStatusMessage("Hand tracking active · face matching unavailable");
        }
      }
      const hands: HandCandidate[] = handResult.landmarks.map((landmarks, index) => ({
        landmarks,
        score: handResult.handednesses[index]?.[0]?.score ?? 0,
        handedness: handResult.handednesses[index]?.[0]?.categoryName ?? `Hand ${index + 1}`,
      }));
      const faces: FaceCenter[] = faceDetections.flatMap((detection) => {
        const box = detection.boundingBox;
        if (!box || !video.videoWidth || !video.videoHeight) return [];
        return [{ x: (box.originX + box.width / 2) / video.videoWidth, y: (box.originY + box.height / 2) / video.videoHeight }];
      });
      const candidateIndex = chooseClosestHand(hands, faces, lockedHandRef.current);
      const candidate = hands[candidateIndex];
      if (candidate) {
        lockLostAtRef.current = 0;
        lockedHandRef.current = candidate.handedness;
        setLockedHand(candidate.handedness);
        setConfidence(candidate.score);
        setStatus("ready");
        setStatusMessage(faces.length ? "Teacher hand locked to nearest face" : tasksRef.current.faces ? "Hand locked · face not visible" : "Hand tracking active · face matching unavailable");
        processEvents(machineRef.current.process(interpretHand(candidate.landmarks), timestamp));
      } else {
        if (!lockLostAtRef.current) lockLostAtRef.current = timestamp;
        if (timestamp - lockLostAtRef.current > 700) {
          lockedHandRef.current = null;
          setLockedHand(null);
          setPointer(null);
          machineRef.current.reset();
        }
        setStatus("searching");
        setStatusMessage("Step into view and raise one hand");
      }
    }
    frameRef.current = window.requestAnimationFrame(inferenceLoop);
  }, [processEvents]);

  const startGestureControl = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setStatusMessage("This browser cannot access a camera. Use mouse controls.");
      return;
    }
    setPanelOpen(true);
    setStatus("loading");
    setStatusMessage("Loading camera and vision models…");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (!videoRef.current) throw new Error("Video preview unavailable");
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      tasksRef.current = await createVisionTasks();
      activeRef.current = true;
      setStatus("searching");
      setStatusMessage("Models ready · looking for teacher");
      frameRef.current = window.requestAnimationFrame(inferenceLoop);
    } catch (error) {
      stopGestureControl();
      setPanelOpen(true);
      setStatus("error");
      setStatusMessage(friendlyCameraError(error));
    }
  };

  const executeVoiceCommand = useCallback((command: VoiceCommand | null) => {
    if (!command) return;
    trackProgress("voice");
    if (command === "open-lab") navigate("/lab");
    else if (command === "open-hdfs") navigate("/lab?mode=hdfs");
    else if (command === "open-foundations") navigate("/lab?mode=foundations");
    else if (command === "open-mongodb") navigate("/lab?mode=mongodb");
    else if (command === "open-hive-pig") navigate("/lab?mode=hive-pig");
    else if (command === "open-spark-web") navigate("/lab?mode=spark-web");
    else if (command === "open-hdfs-animation") navigate("/lab?mode=hdfs&play=1");
    else if (command === "open-mongodb-animation") navigate("/lab?mode=mongodb&play=1");
    else if (command === "open-hive-pig-animation") navigate("/lab?mode=hive-pig&play=1");
    else if (command === "open-spark-web-animation") navigate("/lab?mode=spark-web&play=1");
    else if (command === "open-progress") navigate("/progress");
    else if (command === "open-gesture") { setPanelOpen(true); void startGestureControl(); }
    else if (command === "next" || command === "previous") emitInteraction("lesson-swipe", command);
    else if (command === "zoom-in") emitInteraction("lesson-zoom", 0.8);
    else if (command === "zoom-out") emitInteraction("lesson-zoom", -0.8);
    else if (command.startsWith("select-")) emitInteraction("lesson-select-object", command.replace("select-", ""));
    else emitInteraction("voice-command", command);
  }, [navigate]);

  const startVoice = () => {
    const recognition = createSpeechRecognition((transcript, command) => {
      setVoiceMessage(command ? `Heard: “${transcript}”` : `No matching command: “${transcript}”`);
      executeVoiceCommand(command);
    }, () => {
      setListening(false);
      setVoiceMessage("Voice unavailable. Use gestures or mouse controls.");
    }, () => setListening(false));
    if (!recognition) {
      setVoiceMessage("Voice recognition is unsupported in this browser.");
      setPanelOpen(true);
      return;
    }
    recognitionRef.current = recognition;
    setPanelOpen(true);
    setListening(true);
    setVoiceMessage("Listening… try “open MongoDB animation” or “zoom in”");
    recognition.start();
  };

  useEffect(() => () => {
    recognitionRef.current?.stop();
    stopGestureControl();
  }, [stopGestureControl]);

  return <>
    {pointer && status === "ready" && <div className="virtual-cursor" style={{ left: `${pointer.x * 100}%`, top: `${pointer.y * 100}%` }} data-testid="virtual-cursor"><span /></div>}
    <div className={`interaction-dock ${panelOpen ? "is-open" : ""}`} data-testid="interaction-dock">
      <div className="dock-buttons" data-testid="interaction-dock-buttons">
        <button className={status === "ready" || status === "searching" ? "is-active" : ""} onClick={() => status === "off" || status === "error" ? void startGestureControl() : stopGestureControl()} data-testid="global-gesture-toggle-button">{status === "ready" || status === "searching" ? <CameraOff size={17} /> : <Hand size={17} />}<span>{status === "ready" ? "Gesture on" : "Gestures"}</span></button>
        <button className={listening ? "is-active" : ""} onClick={listening ? () => recognitionRef.current?.stop() : startVoice} data-testid="global-voice-toggle-button">{listening ? <MicOff size={17} /> : <Mic size={17} />}<span>{listening ? "Listening" : "Voice"}</span></button>
        <button className="dock-expand" onClick={() => setPanelOpen((value) => !value)} aria-label="Toggle interaction panel" data-testid="interaction-panel-toggle-button"><ChevronDown size={17} /></button>
      </div>
      {panelOpen && <div className="interaction-panel" data-testid="interaction-panel"><div className="interaction-panel-head"><div><span className="eyebrow">CLASSROOM CONTROL</span><h3 data-testid="interaction-panel-title">Teacher interaction lock</h3></div><button onClick={() => setPanelOpen(false)} aria-label="Close interaction panel" data-testid="interaction-panel-close-button"><X size={16} /></button></div><div className="camera-preview-wrap" data-testid="camera-preview-wrap"><video ref={videoRef} muted playsInline data-testid="gesture-camera-preview" /><div className={`camera-state state-${status}`}><span>{status === "loading" ? <RefreshCw size={15} className="spin-icon" /> : status === "ready" ? <Lock size={15} /> : status === "error" ? <CameraOff size={15} /> : <ScanFace size={15} />}</span><strong data-testid="gesture-status-message">{statusMessage}</strong></div>{status === "ready" && <div className="hand-lock-badge" data-testid="hand-lock-badge"><Lock size={12} /> {lockedHand ?? "Hand"} · {Math.round(confidence * 100)}%</div>}</div><div className="gesture-readout" data-testid="gesture-readout"><div><MousePointer2 size={15} /><span>Detected</span><strong data-testid="detected-gesture-name">{gestureName}</strong></div><div><ScanFace size={15} /><span>Lock</span><strong data-testid="detected-hand-lock">{lockedHand ?? "Searching"}</strong></div></div><p className="gesture-guide" data-testid="gesture-guide">Point = cursor · double finger tap = click · pinch distance = zoom · two fingers = rotate · open palm slide = move page. Mouse and touch always remain available.</p><div className="voice-readout" data-testid="voice-readout"><Mic size={14} /><span data-testid="voice-status-message">{voiceMessage}</span></div><p className="voice-guide" data-testid="voice-command-guide">Say: “open MongoDB animation”, “zoom in”, “pause animation”, “select DataNode”, “explain NameNode”, “open progress”, “next topic”.</p><p className="privacy-note" data-testid="gesture-privacy-note">Video is processed on this device and is never uploaded. Good lighting and a raised hand improve long-distance classroom tracking.</p></div>}
    </div>
  </>;
}