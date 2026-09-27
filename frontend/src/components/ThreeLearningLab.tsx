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

  return <div ref={hostRef} className="three-canvas-host" aria-label="Interactive Three.js learning model" data-testid="three-canvas-host" />;
}