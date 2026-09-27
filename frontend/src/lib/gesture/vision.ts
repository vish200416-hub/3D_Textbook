import { FaceDetector, FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

const WASM_ROOT = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm";
const HAND_MODEL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const FACE_MODEL = "https://storage.googleapis.com/mediapipe-assets/face_detection_full_range_sparse.tflite?generation=1674261618323821";

export interface VisionTasks {
  hands: HandLandmarker;
  faces: FaceDetector;
}

async function buildTasks(delegate: "GPU" | "CPU"): Promise<VisionTasks> {
  const fileset = await FilesetResolver.forVisionTasks(WASM_ROOT);
  const hands = await HandLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: HAND_MODEL, delegate },
    runningMode: "VIDEO",
    numHands: 2,
    minHandDetectionConfidence: 0.55,
    minHandPresenceConfidence: 0.55,
    minTrackingConfidence: 0.55,
  });
  const faces = await FaceDetector.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: FACE_MODEL, delegate },
    runningMode: "VIDEO",
    minDetectionConfidence: 0.5,
  });
  return { hands, faces };
}

export async function createVisionTasks() {
  try {
    return await buildTasks("GPU");
  } catch {
    return buildTasks("CPU");
  }
}