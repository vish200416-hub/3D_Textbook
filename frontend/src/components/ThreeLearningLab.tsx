import { useEffect, useRef } from "react";
import { createLearningScene } from "@/lib/three/learningScene";
import type { LabConfig, LearningSceneController, SelectedObjectInfo } from "@/lib/three/types";

interface ThreeLearningLabProps {
  config: LabConfig;
  playing: boolean;
  resetSignal: number;
  animationResetSignal: number;
  layerVisibility: { labels: boolean; connections: boolean; blocks: boolean };
  onSelect: (info: SelectedObjectInfo | null) => void;
}

export default function ThreeLearningLab({ config, playing, resetSignal, animationResetSignal, layerVisibility, onSelect }: ThreeLearningLabProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<LearningSceneController | null>(null);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!hostRef.current) return;
    const controller = createLearningScene(hostRef.current, config, (info) => onSelectRef.current(info));
    sceneRef.current = controller;
    return () => {
      controller.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.updateConfig(config);
    sceneRef.current?.setLayerVisible("labels", layerVisibility.labels);
    sceneRef.current?.setLayerVisible("connections", layerVisibility.connections);
    sceneRef.current?.setLayerVisible("blocks", layerVisibility.blocks);
  }, [config]);

  useEffect(() => {
    sceneRef.current?.setPlaying(playing);
  }, [playing]);

  useEffect(() => {
    if (resetSignal > 0) sceneRef.current?.resetCamera();
  }, [resetSignal]);

  useEffect(() => {
    if (animationResetSignal > 0) sceneRef.current?.resetAnimation();
  }, [animationResetSignal]);

  useEffect(() => {
    sceneRef.current?.setLayerVisible("labels", layerVisibility.labels);
    sceneRef.current?.setLayerVisible("connections", layerVisibility.connections);
    sceneRef.current?.setLayerVisible("blocks", layerVisibility.blocks);
  }, [layerVisibility]);

  useEffect(() => {
    const onZoom = (event: Event) => sceneRef.current?.gestureZoom((event as CustomEvent<number>).detail);
    const onRotate = (event: Event) => sceneRef.current?.gestureRotate((event as CustomEvent<number>).detail);
    const onSelectAt = (event: Event) => {
      const point = (event as CustomEvent<{ clientX: number; clientY: number }>).detail;
      sceneRef.current?.selectAtClientPoint(point.clientX, point.clientY);
    };
    const onSelectObject = (event: Event) => sceneRef.current?.selectObjectByName((event as CustomEvent<string>).detail);
    window.addEventListener("lesson-zoom", onZoom);
    window.addEventListener("lesson-rotate", onRotate);
    window.addEventListener("lesson-select-at", onSelectAt);
    window.addEventListener("lesson-select-object", onSelectObject);
    return () => {
      window.removeEventListener("lesson-zoom", onZoom);
      window.removeEventListener("lesson-rotate", onRotate);
      window.removeEventListener("lesson-select-at", onSelectAt);
      window.removeEventListener("lesson-select-object", onSelectObject);
    };
  }, []);

  return <div ref={hostRef} className="three-canvas-host" aria-label="Interactive Three.js learning model" data-testid="three-canvas-host" />;
}