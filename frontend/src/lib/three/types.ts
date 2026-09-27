import type { Group, Object3D } from "three";

export type LabMode = "hdfs" | "foundations" | "mongodb" | "hive-pig" | "spark-web";

export interface LabConfig {
  mode: LabMode;
  dataNodes: number;
  blocks: number;
  replicas: number;
  flowSpeed: number;
  datasetScale: number;
}

export interface SelectedObjectInfo {
  id: string;
  name: string;
  type: string;
  description: string;
  properties: string[];
}

export interface LabMetric {
  label: string;
  value: string;
  explanation: string;
}

export interface LearningSceneController {
  updateConfig: (config: LabConfig) => void;
  setPlaying: (playing: boolean) => void;
  setLayerVisible: (layer: "labels" | "connections" | "blocks", visible: boolean) => void;
  gestureZoom: (delta: number) => void;
  gestureRotate: (delta: number) => void;
  selectAtClientPoint: (clientX: number, clientY: number) => void;
  selectObjectByName: (name: string) => boolean;
  resetAnimation: () => void;
  resetCamera: () => void;
  dispose: () => void;
}

export interface SceneBuildContext {
  world: Group;
  selectable: Object3D[];
  register: (object: Object3D, info: SelectedObjectInfo) => void;
  addLabel: (text: string, color: string, x: number, y: number, z: number) => void;
}

export const DEFAULT_LAB_CONFIG: LabConfig = {
  mode: "hdfs",
  dataNodes: 4,
  blocks: 6,
  replicas: 2,
  flowSpeed: 1,
  datasetScale: 64,
};

export function clampLabConfig(config: LabConfig): LabConfig {
  return {
    mode: config.mode,
    dataNodes: Math.max(2, Math.min(6, Math.round(config.dataNodes))),
    blocks: Math.max(2, Math.min(10, Math.round(config.blocks))),
    replicas: Math.max(1, Math.min(3, Math.round(config.replicas))),
    flowSpeed: Math.max(0.2, Math.min(2.5, config.flowSpeed)),
    datasetScale: Math.max(16, Math.min(256, Math.round(config.datasetScale / 16) * 16)),
  };
}

export function getLabMetrics(config: LabConfig): LabMetric[] {
  const safe = clampLabConfig(config);
  if (safe.mode === "hdfs") {
    const copies = safe.blocks * safe.replicas;
    const average = (copies / safe.dataNodes).toFixed(1);
    return [
      { label: "Logical blocks", value: `${safe.blocks}`, explanation: "The file is split into these independent chunks." },
      { label: "Physical copies", value: `${copies}`, explanation: `${safe.replicas} replica(s) protect each logical block.` },
      { label: "Avg. node load", value: `${average}`, explanation: "A balanced cluster spreads physical copies across DataNodes." },
    ];
  }
  if (safe.mode === "foundations") {
    return [
      { label: "Data dimensions", value: "5Vs", explanation: "Volume, Velocity, Variety, Veracity and Value frame the problem." },
      { label: "Dataset scale", value: `${safe.datasetScale} GB`, explanation: "A larger dataset makes distributed processing more valuable." },
      { label: "Signal speed", value: `${safe.flowSpeed.toFixed(1)}×`, explanation: "The stream speed changes how quickly insight must arrive." },
    ];
  }
  if (safe.mode === "mongodb") {
    return [
      { label: "Documents", value: `${safe.blocks * 4}`, explanation: "Flexible documents sit inside collections rather than rows." },
      { label: "Shards", value: `${safe.dataNodes}`, explanation: "Shards distribute collections across the cluster." },
      { label: "Query rate", value: `${safe.flowSpeed.toFixed(1)}×`, explanation: "Use the slider to imagine a busier document workload." },
    ];
  }
  if (safe.mode === "hive-pig") {
    return [
      { label: "Pipeline stages", value: `${Math.min(6, safe.dataNodes + 1)}`, explanation: "Load, transform and store stages form a dataflow." },
      { label: "Records", value: `${safe.datasetScale}k`, explanation: "High-level languages hide low-level distributed work." },
      { label: "Operators", value: `${safe.blocks + 2}`, explanation: "Group, join, filter, project and aggregate shape the data." },
    ];
  }
  return [
    { label: "Graph nodes", value: `${safe.dataNodes + safe.blocks}`, explanation: "Pages and documents become vertices in an analytical graph." },
    { label: "Link edges", value: `${safe.blocks * 2}`, explanation: "Links connect pages and influence PageRank scores." },
    { label: "Iterations", value: `${Math.max(2, Math.round(safe.flowSpeed * 3))}`, explanation: "Repeated passes help scores converge across the graph." },
  ];
}