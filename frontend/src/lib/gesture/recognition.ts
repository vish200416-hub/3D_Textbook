import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export interface Point2D { x: number; y: number }
export type GestureName = "point" | "point-hold" | "pinch-zoom" | "two-finger-rotate" | "scroll-armed" | "fist-drag" | "fist-release" | "tracking";

export interface GestureFrame {
  pointer: Point2D;
  pointActive: boolean;
  pinchDistance: number;
  twoFingerActive: boolean;
  twoFingerAngle: number;
  palmOpen: boolean;
  palmCenter: Point2D;
  fistActive: boolean;
}

export interface HandCandidate {
  landmarks: NormalizedLandmark[];
  score: number;
  handedness: string;
}

export interface FaceCenter extends Point2D {}

const distance = (a: Point2D, b: Point2D) => Math.hypot(a.x - b.x, a.y - b.y);

export function chooseClosestHand(hands: HandCandidate[], faces: FaceCenter[], previousHandedness: string | null) {
  if (!hands.length) return -1;
  if (!faces.length) {
    const locked = hands.findIndex((hand) => hand.handedness === previousHandedness);
    return locked >= 0 ? locked : hands.reduce((best, hand, index) => hand.score > hands[best].score ? index : best, 0);
  }
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  hands.forEach((hand, index) => {
    const wrist = hand.landmarks[0];
    faces.forEach((face) => {
      const currentDistance = distance(wrist, face) * (hand.handedness === previousHandedness ? 0.88 : 1);
      if (currentDistance < bestDistance) {
        bestDistance = currentDistance;
        bestIndex = index;
      }
    });
  });
  return bestIndex;
}

export function interpretHand(landmarks: NormalizedLandmark[]): GestureFrame {
  const wrist = landmarks[0];
  const thumb = landmarks[4];
  const indexPip = landmarks[6];
  const indexTip = landmarks[8];
  const middlePip = landmarks[10];
  const middleTip = landmarks[12];
  const ringPip = landmarks[14];
  const ringTip = landmarks[16];
  const pinkyPip = landmarks[18];
  const pinkyTip = landmarks[20];
  const indexExtended = distance(indexTip, wrist) > distance(indexPip, wrist) * 1.12;
  const middleExtended = distance(middleTip, wrist) > distance(middlePip, wrist) * 1.1;
  const ringExtended = distance(ringTip, wrist) > distance(ringPip, wrist) * 1.08;
  const pinkyExtended = distance(pinkyTip, wrist) > distance(pinkyPip, wrist) * 1.08;
  const palmOpen = [indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length >= 4;
  const pointActive = indexExtended && !middleExtended && !ringExtended && !pinkyExtended;
  const twoFingerActive = indexExtended && middleExtended && !ringExtended && !pinkyExtended;
  const fistActive = !indexExtended && !middleExtended && !ringExtended && !pinkyExtended;
  return {
    pointer: { x: 1 - indexTip.x, y: indexTip.y },
    pointActive,
    pinchDistance: distance(thumb, indexTip),
    twoFingerActive,
    twoFingerAngle: Math.atan2(middleTip.y - indexTip.y, middleTip.x - indexTip.x),
    palmOpen,
    palmCenter: { x: 1 - landmarks[9].x, y: landmarks[9].y },
    fistActive,
  };
}

export class GestureStateMachine {
  private stablePointFrames = 0;
  private stablePalmFrames = 0;
  private stableFistFrames = 0;
  private stableTwoFingerFrames = 0;
  private lastFrame: GestureFrame | null = null;
  private pointHoldStartedAt = 0;
  private pointHoldOrigin: Point2D | null = null;
  private pointHoldFired = false;
  private lastClickAt = 0;
  private scrollArmed = false;
  private fistDragging = false;
  private lastDragPoint: Point2D | null = null;

  process(frame: GestureFrame, timestamp: number) {
    const events: Array<{ name: GestureName; detail?: number | Point2D | { x: number; y: number } }> = [];
    this.stablePointFrames = frame.pointActive ? this.stablePointFrames + 1 : 0;
    this.stablePalmFrames = frame.palmOpen ? this.stablePalmFrames + 1 : 0;
    this.stableFistFrames = frame.fistActive ? this.stableFistFrames + 1 : 0;
    this.stableTwoFingerFrames = frame.twoFingerActive ? this.stableTwoFingerFrames + 1 : 0;

    if (this.stablePointFrames >= 3) {
      events.push({ name: "point", detail: frame.pointer });
      if (!this.pointHoldOrigin || distance(frame.pointer, this.pointHoldOrigin) > 0.035) {
        this.pointHoldOrigin = frame.pointer;
        this.pointHoldStartedAt = timestamp;
        this.pointHoldFired = false;
      } else if (!this.pointHoldFired && timestamp - this.pointHoldStartedAt >= 1000 && timestamp - this.lastClickAt > 1200) {
        events.push({ name: "point-hold", detail: frame.pointer });
        this.pointHoldFired = true;
        this.lastClickAt = timestamp;
      }
    } else {
      this.pointHoldOrigin = null;
      this.pointHoldStartedAt = 0;
      this.pointHoldFired = false;
    }

    if (this.stablePalmFrames === 5 && !this.fistDragging) {
      this.scrollArmed = true;
      events.push({ name: "scroll-armed" });
    }

    if (this.scrollArmed && this.stableFistFrames >= 3 && !this.fistDragging) {
      this.fistDragging = true;
      this.lastDragPoint = frame.palmCenter;
    }

    if (this.fistDragging && frame.fistActive && this.lastDragPoint) {
      const delta = { x: frame.palmCenter.x - this.lastDragPoint.x, y: frame.palmCenter.y - this.lastDragPoint.y };
      if (Math.max(Math.abs(delta.x), Math.abs(delta.y)) > 0.002) events.push({ name: "fist-drag", detail: delta });
      this.lastDragPoint = frame.palmCenter;
    }

    if (this.fistDragging && this.stablePalmFrames >= 3) {
      this.fistDragging = false;
      this.scrollArmed = false;
      this.lastDragPoint = null;
      events.push({ name: "fist-release" });
    }

    if (this.lastFrame) {
      const pinchDelta = frame.pinchDistance - this.lastFrame.pinchDistance;
      if (frame.pinchDistance < 0.2 && this.lastFrame.pinchDistance < 0.2 && Math.abs(pinchDelta) > 0.004) {
        events.push({ name: "pinch-zoom", detail: pinchDelta * 20 });
      }
      if (this.stableTwoFingerFrames >= 4 && this.lastFrame.twoFingerActive) {
        let angleDelta = frame.twoFingerAngle - this.lastFrame.twoFingerAngle;
        if (angleDelta > Math.PI) angleDelta -= Math.PI * 2;
        if (angleDelta < -Math.PI) angleDelta += Math.PI * 2;
        if (Math.abs(angleDelta) > 0.015) events.push({ name: "two-finger-rotate", detail: angleDelta });
      }
    }
    this.lastFrame = frame;
    return events;
  }

  reset() {
    this.stablePointFrames = 0;
    this.stablePalmFrames = 0;
    this.stableFistFrames = 0;
    this.stableTwoFingerFrames = 0;
    this.lastFrame = null;
    this.pointHoldStartedAt = 0;
    this.pointHoldOrigin = null;
    this.pointHoldFired = false;
    this.scrollArmed = false;
    this.fistDragging = false;
    this.lastDragPoint = null;
  }
}