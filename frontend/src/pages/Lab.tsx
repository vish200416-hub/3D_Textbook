import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Box, Calculator, CheckCircle2, CircleHelp, Eye, EyeOff, Gauge, Info, Layers3, Pause, Play, RotateCcw, SlidersHorizontal, Sparkles, Target, Zap } from "lucide-react";
import ThreeLearningLab from "@/components/ThreeLearningLab";
import { getLabMetrics, DEFAULT_LAB_CONFIG, type LabConfig, type LabMode, type SelectedObjectInfo } from "@/lib/three/types";
import { trackProgress } from "@/lib/progress";

const modeOptions: Array<{ id: LabMode; label: string; short: string; accent: string }> = [
  { id: "hdfs", label: "HDFS architecture", short: "Distributed storage", accent: "cyan" },
  { id: "foundations", label: "5Vs foundations", short: "Big Data concepts", accent: "violet" },
  { id: "mongodb", label: "MongoDB documents", short: "NoSQL model", accent: "green" },
  { id: "hive-pig", label: "Hive + Pig pipeline", short: "High-level analytics", accent: "amber" },
  { id: "spark-web", label: "Spark + web graph", short: "Text and link analytics", accent: "pink" },
];

const modeTitles: Record<LabMode, string> = {
  hdfs: "HDFS Architecture",
  foundations: "Big Data Foundations",
  mongodb: "MongoDB Document Model",
  "hive-pig": "Hive + Pig Dataflow",
  "spark-web": "Spark + Web Graph",
};

function ParameterControl({ label, value, min, max, step = 1, suffix, onChange, testId }: { label: string; value: number; min: number; max: number; step?: number; suffix: string; onChange: (value: number) => void; testId: string }) {
  return <label className="parameter-control" data-testid={`${testId}-control`}><span><span data-testid={`${testId}-label`}>{label}</span><strong data-testid={`${testId}-value`}>{value}{suffix}</strong></span><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} aria-label={label} data-testid={`${testId}-slider`} /></label>;
}

export default function Lab() {
  const [config, setConfig] = useState<LabConfig>(DEFAULT_LAB_CONFIG);
  const [playing, setPlaying] = useState(true);
  const [resetSignal, setResetSignal] = useState(0);
  const [animationResetSignal, setAnimationResetSignal] = useState(0);
  const [layerVisibility, setLayerVisibility] = useState({ labels: true, connections: true, blocks: true });
  const [selected, setSelected] = useState<SelectedObjectInfo | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const metrics = useMemo(() => getLabMetrics(config), [config]);
  const currentMode = modeOptions.find((option) => option.id === config.mode) ?? modeOptions[0];

  const updateConfig = (key: keyof LabConfig, value: number | LabMode) => setConfig((current) => ({ ...current, [key]: value }));
  const handleSelect = useCallback((info: SelectedObjectInfo | null) => {
    setSelected(info);
    setShowExplanation(false);
    if (info) trackProgress("object", info.id);
  }, []);

  const toggleLayer = (layer: keyof typeof layerVisibility) => setLayerVisibility((current) => ({ ...current, [layer]: !current[layer] }));

  const changeMode = (mode: LabMode) => {
    updateConfig("mode", mode);
    setSelected(null);
    trackProgress("mode", mode);
  };

  useEffect(() => {
    trackProgress("mode", config.mode);
    const onVoice = (event: Event) => {
      const command = (event as CustomEvent<string>).detail;
      if (command === "start-animation") setPlaying(true);
      if (command === "pause-animation") setPlaying(false);
      if (command === "reset-model") { setResetSignal((value) => value + 1); setAnimationResetSignal((value) => value + 1); }
      if (command === "show-datanodes") { setConfig((current) => ({ ...current, mode: "hdfs" })); setLayerVisibility((current) => ({ ...current, blocks: true, connections: true })); }
      if (command === "explain-namenode") setSelected({ id: "namenode", name: "NameNode", type: "Metadata manager", description: "The NameNode manages metadata and the namespace of the distributed file system.", properties: ["Tracks file names", "Maps blocks to DataNodes", "Coordinates replication"] });
    };
    window.addEventListener("voice-command", onVoice);
    return () => window.removeEventListener("voice-command", onVoice);
  }, [config.mode]);

  return <div className="lab-page" data-testid="lab-page">
    <div className="lab-header" data-testid="lab-header"><div><Link to="/subject/big-data-analytics/module/module-2" className="back-link" data-testid="lab-back-link"><ArrowLeft size={15} /> Back to Hadoop module</Link><div className="lab-title-line"><span className="live-badge" data-testid="lab-live-badge"><span /> PHASE 3 / CLASSROOM READY</span><h1 data-testid="lab-page-title">3D Learning Lab</h1></div><p data-testid="lab-page-description">Explore how data moves, splits and scales across the VTU Big Data Analytics syllabus.</p></div><div className="lab-header-tools" data-testid="lab-header-tools"><span className="lab-status"><span className="status-dot" /> Mouse + gesture controls</span><button className="secondary-button" onClick={() => (document.querySelector('[data-testid="global-gesture-toggle-button"]') as HTMLButtonElement | null)?.click()} data-testid="lab-gesture-preview-link"><Target size={15} /> Enable gestures <ArrowRight size={14} /></button></div></div>

    <div className="lab-mode-strip" data-testid="lab-mode-strip"><div className="mode-strip-label"><span className="eyebrow" data-testid="lab-mode-eyebrow">VISUAL TOPIC MODES</span><span data-testid="lab-mode-caption">Every module gets a visual language.</span></div><div className="mode-options">{modeOptions.map((option) => <button key={option.id} className={`mode-option accent-${option.accent} ${config.mode === option.id ? "is-active" : ""}`} onClick={() => changeMode(option.id)} data-testid={`lab-mode-${option.id}`}><span className="mode-option-icon">{option.id === "hdfs" ? <Layers3 size={15} /> : option.id === "foundations" ? <Sparkles size={15} /> : option.id === "mongodb" ? <Box size={15} /> : option.id === "hive-pig" ? <SlidersHorizontal size={15} /> : <Zap size={15} />}</span><span><strong data-testid={`lab-mode-label-${option.id}`}>{option.label}</strong><small data-testid={`lab-mode-short-${option.id}`}>{option.short}</small></span></button>)}</div></div>

    <div className="lab-layout" data-testid="lab-layout"><section className="lab-stage-card glass-panel" data-testid="lab-stage-card"><div className="lab-stage-toolbar" data-testid="lab-stage-toolbar"><div><span className="module-code" data-testid="lab-current-mode-code">{currentMode.short}</span><h2 data-testid="lab-current-mode-title">{modeTitles[config.mode]}</h2></div><div className="stage-actions"><button className={`stage-control ${playing ? "is-active" : ""}`} onClick={() => setPlaying((value) => !value)} data-testid="lab-animation-toggle-button">{playing ? <Pause size={15} /> : <Play size={15} />}{playing ? "Pause flow" : "Play flow"}</button><button className="stage-control" onClick={() => setResetSignal((value) => value + 1)} data-testid="lab-reset-camera-button"><RotateCcw size={15} /> Reset camera</button></div></div><div className="canvas-frame" data-testid="canvas-frame"><ThreeLearningLab config={config} playing={playing} resetSignal={resetSignal} animationResetSignal={animationResetSignal} layerVisibility={layerVisibility} onSelect={handleSelect} /><div className="canvas-overlay-top" data-testid="canvas-overlay-status"><span><span className="status-dot" /> LIVE SCENE</span><span><Eye size={13} /> Drag to orbit · Scroll to zoom</span></div><div className="canvas-overlay-bottom" data-testid="canvas-overlay-bottom"><span>{config.mode === "hdfs" ? `${config.dataNodes} DataNodes · ${config.blocks} blocks · ${config.replicas}× replication` : `${config.dataNodes + config.blocks} visual objects · ${config.flowSpeed.toFixed(1)}× flow`}</span><span className="canvas-hint"><Info size={13} /> Click an object to inspect</span></div></div><div className="lab-stage-footer" data-testid="lab-stage-footer"><span><CheckCircle2 size={15} /> Procedural fallback active — no model download required</span><span><Box size={15} /> GLTFLoader ready for future approved assets</span></div></section>

      <aside className="lab-inspector" data-testid="lab-inspector"><section className="inspector-card glass-panel" data-testid="object-inspector"><div className="inspector-heading"><span className="eyebrow" data-testid="inspector-eyebrow">SELECTED OBJECT</span><span className="selection-pulse" /></div>{selected ? <><div className="selected-object-heading"><div className="selected-object-icon"><Box size={20} /></div><div><h2 data-testid="selected-object-name">{selected.name}</h2><span data-testid="selected-object-type">{selected.type}</span></div></div><p className="selected-description" data-testid="selected-object-description">{selected.description}</p><div className="properties-list" data-testid="selected-object-properties">{selected.properties.map((property, index) => <div key={property} data-testid={`selected-object-property-${index + 1}`}><CheckCircle2 size={14} />{property}</div>)}</div><button className="explain-button" onClick={() => setShowExplanation((value) => !value)} data-testid="explain-this-button"><Sparkles size={15} /> {showExplanation ? "Hide explanation" : "Explain this"}</button>{showExplanation && <div className="explain-box" data-testid="explain-this-response"><strong>In simple terms</strong><p>{selected.name} is one part of a larger data journey. Change the sliders, watch the scene update, and connect this object to the metrics below.</p></div>}</> : <div className="empty-inspector" data-testid="empty-object-inspector"><div className="empty-inspector-icon"><CircleHelp size={24} /></div><h2 data-testid="empty-inspector-title">Select a component</h2><p data-testid="empty-inspector-copy">Point and click a node, block or pipeline stage to reveal its role in the system.</p></div>}</section>

        <section className="inspector-card glass-panel" data-testid="visibility-inspector"><div className="inspector-heading"><span className="eyebrow" data-testid="visibility-eyebrow">SCENE LAYERS</span><Eye size={15} /></div><div className="layer-controls" data-testid="layer-controls">{(["labels", "connections", "blocks"] as const).map((layer) => <button key={layer} className={layerVisibility[layer] ? "is-visible" : ""} onClick={() => toggleLayer(layer)} data-testid={`toggle-${layer}-button`}>{layerVisibility[layer] ? <Eye size={14} /> : <EyeOff size={14} />}<span>{layer}</span><strong>{layerVisibility[layer] ? "ON" : "OFF"}</strong></button>)}</div><button className="animation-reset-button" onClick={() => { setAnimationResetSignal((value) => value + 1); setPlaying(false); }} data-testid="lab-reset-animation-button"><RotateCcw size={14} /> Reset animation</button></section>

        <section className="inspector-card glass-panel" data-testid="parameter-inspector"><div className="inspector-heading"><span className="eyebrow" data-testid="parameter-eyebrow">DYNAMIC PARAMETERS</span><Gauge size={15} /></div><p className="inspector-copy" data-testid="parameter-copy">Change the model and immediately see how the numerical story changes.</p><div className="parameter-list">{config.mode === "hdfs" && <><ParameterControl label="DataNodes" value={config.dataNodes} min={2} max={6} suffix=" nodes" onChange={(value) => updateConfig("dataNodes", value)} testId="parameter-data-nodes" /><ParameterControl label="File blocks" value={config.blocks} min={2} max={10} suffix=" blocks" onChange={(value) => updateConfig("blocks", value)} testId="parameter-blocks" /><ParameterControl label="Replication" value={config.replicas} min={1} max={3} suffix="×" onChange={(value) => updateConfig("replicas", value)} testId="parameter-replication" /></>}<ParameterControl label="Flow speed" value={config.flowSpeed} min={0.2} max={2.5} step={0.1} suffix="×" onChange={(value) => updateConfig("flowSpeed", value)} testId="parameter-flow-speed" /><ParameterControl label="Dataset scale" value={config.datasetScale} min={16} max={256} step={16} suffix=" GB" onChange={(value) => updateConfig("datasetScale", value)} testId="parameter-dataset-scale" /></div></section>

        <section className="inspector-card glass-panel" data-testid="metrics-card"><div className="inspector-heading"><span className="eyebrow" data-testid="metrics-eyebrow">NUMERICAL LENS</span><Calculator size={15} /></div><div className="metrics-list">{metrics.map((metric) => <div className="lab-metric" key={metric.label} data-testid={`lab-metric-${metric.label.toLowerCase().replaceAll(" ", "-")}`}><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.explanation}</small></div>)}</div></section></aside>
    </div>
    <div className="lab-footnote" data-testid="lab-footnote"><span><Info size={14} /> Educational model: values are intentionally simplified for visual reasoning.</span><Link to="/subject/big-data-analytics/module/module-2" data-testid="lab-textbook-link">Read the textbook explanation <ArrowRight size={14} /></Link></div>
  </div>;
}