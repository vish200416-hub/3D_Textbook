import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Calculator, CheckCircle2, ChevronRight, CirclePlay, Code2, Database, FileText, FlaskConical, Layers3, LockKeyhole, MousePointer2, Sparkles } from "lucide-react";
import { getSyllabusModule, syllabusModules, type SyllabusModule, type TopicKind } from "@/data/syllabus";

type LearningTab = "learn" | "explore" | "practice" | "code";

const tabConfig: Array<{ id: LearningTab; label: string; icon: typeof BookOpen }> = [
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "explore", label: "Explore", icon: Layers3 },
  { id: "practice", label: "Practice", icon: Calculator },
  { id: "code", label: "Code lab", icon: Code2 },
];

const kindLabel: Record<TopicKind, string> = { concept: "Concept", demo: "Demo", numerical: "Numerical", code: "Code" };

function TopicIcon({ kind }: { kind: TopicKind }) {
  if (kind === "demo") return <CirclePlay size={15} />;
  if (kind === "numerical") return <Calculator size={15} />;
  if (kind === "code") return <Code2 size={15} />;
  return <FileText size={15} />;
}

function ModuleProgressRail({ module }: { module: SyllabusModule }) {
  return <aside className="module-rail glass-panel" data-testid="module-topic-rail"><div className="rail-top"><p className="eyebrow" data-testid="module-rail-label">MODULE MAP</p><span className="rail-count" data-testid="module-rail-count">{module.topics.length}</span></div><div className="topic-rail-list">{module.topics.map((topic, index) => <div className="topic-rail-item" key={topic.id} data-testid={`topic-rail-item-${topic.id}`}><span className="topic-rail-index">{String(index + 1).padStart(2, "0")}</span><span data-testid={`topic-rail-title-${topic.id}`}>{topic.title}</span></div>)}</div><div className="rail-footer" data-testid="module-rail-footer"><CheckCircle2 size={15} /><span>{module.progress}% explored</span></div></aside>;
}

function LearnPanel({ module }: { module: SyllabusModule }) {
  const featuredTopic = module.topics[0];
  return <div className="learning-panel" data-testid="learn-panel"><div className="panel-kicker" data-testid="learn-panel-kicker"><span className="kicker-dot" /> FOUNDATIONAL CONCEPT</div><h2 data-testid="learn-panel-title">{featuredTopic.title}</h2><p className="panel-copy" data-testid="learn-panel-copy">{featuredTopic.summary} This learning surface will grow into concise textbook notes, annotated diagrams and visual examples so you can build intuition before opening the lab.</p><div className="definition-card" data-testid="definition-card"><div className="definition-icon"><Sparkles size={18} /></div><div><span className="definition-label" data-testid="definition-label">WHY THIS MATTERS</span><p data-testid="definition-copy">The syllabus is arranged as a connected pipeline: understand the data, distribute the work, query it at the right level, then extract insight.</p></div></div><div className="takeaways" data-testid="key-takeaways"><div className="takeaway-heading"><span>KEY TAKEAWAYS</span><span className="takeaway-rule" /></div><ul><li data-testid="takeaway-one"><CheckCircle2 size={15} /> Build vocabulary before choosing a tool.</li><li data-testid="takeaway-two"><CheckCircle2 size={15} /> Connect every abstraction to a data flow.</li><li data-testid="takeaway-three"><CheckCircle2 size={15} /> Practice with small examples before scaling up.</li></ul></div></div>;
}

function ExplorePanel({ module }: { module: SyllabusModule }) {
  return <div className="learning-panel" data-testid="explore-panel"><div className="panel-kicker"><span className="kicker-dot violet-dot" /> INTERACTIVE PREVIEW</div><h2 data-testid="explore-panel-title">Make the architecture visible.</h2><p className="panel-copy" data-testid="explore-panel-copy">Phase 1 gives every topic a visual home. The Three.js lab will turn this {module.title.toLowerCase()} map into a manipulable scene in Phase 3.</p><div className="architecture-preview" data-testid="architecture-preview"><div className="architecture-line line-a" /><div className="architecture-line line-b" /><div className="architecture-node node-a"><Database size={18} /><span>NameNode</span></div><div className="architecture-node node-b"><Layers3 size={18} /><span>DataNodes</span></div><div className="architecture-node node-c"><Sparkles size={18} /><span>Insights</span></div><div className="data-pulse pulse-a" /><div className="data-pulse pulse-b" /></div><div className="preview-footer" data-testid="explore-preview-footer"><span><MousePointer2 size={15} /> Click to inspect</span><span><Layers3 size={15} /> Orbit and zoom</span><span><LockKeyhole size={15} /> Phase 3</span></div></div>;
}

function PracticePanel({ module }: { module: SyllabusModule }) {
  return <div className="learning-panel" data-testid="practice-panel"><div className="panel-kicker"><span className="kicker-dot amber-dot" /> PRACTICE QUEUE</div><h2 data-testid="practice-panel-title">Think like the system.</h2><p className="panel-copy" data-testid="practice-panel-copy">Use short numericals and lab prompts to check your understanding before moving on.</p><div className="practice-list" data-testid="practice-list">{module.numericals.map((item, index) => <div className="practice-item" key={item} data-testid={`numerical-item-${index + 1}`}><span className="practice-number">0{index + 1}</span><span data-testid={`numerical-item-text-${index + 1}`}>{item}</span><ChevronRight size={16} /></div>)}</div><div className="practice-note" data-testid="practice-note"><FlaskConical size={17} /><span>IPCC practicals linked to this module: {module.practicals.length}</span></div></div>;
}

function CodePanel({ module }: { module: SyllabusModule }) {
  return <div className="learning-panel" data-testid="code-panel"><div className="panel-kicker"><span className="kicker-dot green-dot" /> CODE LIBRARY</div><h2 data-testid="code-panel-title">From idea to implementation.</h2><p className="panel-copy" data-testid="code-panel-copy">Each module will pair its concepts with readable Java, Python, R or query examples. The first code cards are queued below.</p><div className="code-list" data-testid="code-list">{module.snippets.map((snippet, index) => <div className="code-item" key={snippet} data-testid={`code-snippet-item-${index + 1}`}><div className="code-item-icon"><Code2 size={16} /></div><div><strong data-testid={`code-snippet-title-${index + 1}`}>{snippet}</strong><small data-testid={`code-snippet-status-${index + 1}`}>Snippet mapped · available in code lab</small></div><ArrowRight size={16} /></div>)}</div></div>;
}

export default function Module() {
  const { moduleId } = useParams();
  const module = getSyllabusModule(moduleId);
  const [activeTab, setActiveTab] = useState<LearningTab>("learn");
  const moduleIndex = syllabusModules.findIndex((item) => item.id === module.id);
  const nextModule = syllabusModules[moduleIndex + 1];

  return <div className="content-stack" data-testid="module-page"><div className="module-page-top"><div><Link to="/subject/big-data-analytics" className="back-link" data-testid="module-back-link"><ArrowLeft size={15} /> All modules</Link><p className="eyebrow cyan-eyebrow" data-testid="module-eyebrow">{module.code} · {module.topics.length} STUDY POINTS</p><h1 className="page-title" data-testid="module-page-title">{module.title}</h1><p className="page-lede" data-testid="module-page-description">{module.description}</p></div><div className="module-status-card" data-testid="module-status-card"><div className="status-icon"><Sparkles size={18} /></div><span className="metric-label">Your progress</span><strong data-testid="module-status-progress">{module.progress}%</strong><div className="progress-track"><div className="progress-fill" style={{ width: `${module.progress}%`, backgroundColor: module.accent }} /></div><small data-testid="module-status-duration">{module.duration} estimated</small></div></div><div className="module-workspace" data-testid="module-workspace"><ModuleProgressRail module={module} /><section className="module-content glass-panel" data-testid="module-content"><div className="learning-tabs" role="tablist" aria-label="Learning modes" data-testid="learning-tabs">{tabConfig.map(({ id, label, icon: Icon }) => <button key={id} className={`learning-tab ${activeTab === id ? "is-active" : ""}`} onClick={() => setActiveTab(id)} role="tab" aria-selected={activeTab === id} data-testid={`learning-tab-${id}`}><Icon size={16} />{label}{id === "explore" && <span className="phase-pill" data-testid="explore-phase-pill">P3</span>}</button>)}</div>{activeTab === "learn" && <LearnPanel module={module} />}{activeTab === "explore" && <ExplorePanel module={module} />}{activeTab === "practice" && <PracticePanel module={module} />}{activeTab === "code" && <CodePanel module={module} />}</section></div><div className="module-footer-row" data-testid="module-footer-row"><span data-testid="module-footer-status"><CheckCircle2 size={15} /> Next up: connect this concept to a visual demo and a quiz.</span>{nextModule ? <Link to={`/subject/big-data-analytics/module/${nextModule.id}`} className="next-module-link" data-testid="next-module-link">Next module <ArrowRight size={15} /></Link> : <Link to="/progress" className="next-module-link" data-testid="next-module-link">View study plan <ArrowRight size={15} /></Link>}</div></div>;
}