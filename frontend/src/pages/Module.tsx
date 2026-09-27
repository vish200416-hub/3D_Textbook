import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Calculator, CheckCircle2, ChevronRight, CirclePlay, Code2, Database, FileText, FlaskConical, Layers3, LockKeyhole, MousePointer2, Sparkles, Trophy } from "lucide-react";
import { getSyllabusModule, syllabusModules, type SyllabusModule, type TopicKind } from "@/data/syllabus";
import { getTopicLesson } from "@/data/topicContent";
import ModuleQuiz from "@/components/ModuleQuiz";
import { trackProgress } from "@/lib/progress";

type LearningTab = "learn" | "explore" | "practice" | "code" | "quiz";

const tabConfig: Array<{ id: LearningTab; label: string; icon: typeof BookOpen }> = [
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "explore", label: "Explore", icon: Layers3 },
  { id: "practice", label: "Practice", icon: Calculator },
  { id: "code", label: "Code lab", icon: Code2 },
  { id: "quiz", label: "Quiz", icon: Trophy },
];

function TopicIcon({ kind }: { kind: TopicKind }) {
  if (kind === "demo") return <CirclePlay size={13} />;
  if (kind === "numerical") return <Calculator size={13} />;
  if (kind === "code") return <Code2 size={13} />;
  return <FileText size={13} />;
}

function ModuleProgressRail({ module, activeTopicId, onSelect }: { module: SyllabusModule; activeTopicId: string; onSelect: (index: number) => void }) {
  return <aside className="module-rail glass-panel" data-testid="module-topic-rail"><div className="rail-top"><p className="eyebrow" data-testid="module-rail-label">MODULE MAP</p><span className="rail-count" data-testid="module-rail-count">{module.topics.length}</span></div><div className="topic-rail-list">{module.topics.map((topic, index) => <button className={`topic-rail-item ${topic.id === activeTopicId ? "is-active" : ""}`} onClick={() => onSelect(index)} key={topic.id} data-testid={`topic-rail-item-${topic.id}`}><span className="topic-rail-index">{String(index + 1).padStart(2, "0")}</span><TopicIcon kind={topic.kind} /><span data-testid={`topic-rail-title-${topic.id}`}>{topic.title}</span></button>)}</div><div className="rail-footer" data-testid="module-rail-footer"><CheckCircle2 size={15} /><span>{module.progress}% explored</span></div></aside>;
}

function LearnPanel({ module, topicIndex, onNavigate }: { module: SyllabusModule; topicIndex: number; onNavigate: (index: number) => void }) {
  const topic = module.topics[topicIndex];
  const lesson = getTopicLesson(topic, module);
  return <div className="learning-panel topic-lesson-panel" data-testid="learn-panel"><div className="topic-lesson-meta"><div className="panel-kicker" data-testid="learn-panel-kicker"><span className="kicker-dot" /> {topic.kind.toUpperCase()} · TOPIC {String(topicIndex + 1).padStart(2, "0")}</div><span data-testid="topic-progress-count">{topicIndex + 1} / {module.topics.length}</span></div><h2 data-testid="learn-panel-title">{topic.title}</h2><p className="panel-copy" data-testid="learn-panel-copy">{lesson.definition}</p><div className="topic-content-grid"><div className="definition-card" data-testid="definition-card"><div className="definition-icon"><BookOpen size={18} /></div><div><span className="definition-label" data-testid="definition-label">REAL-WORLD EXAMPLE</span><p data-testid="definition-copy">{lesson.example}</p></div></div><div className="concept-note" data-testid="concept-note"><span>KEY IDEA</span><p data-testid="concept-note-copy">{topic.summary}</p></div></div><div className="takeaways" data-testid="key-takeaways"><div className="takeaway-heading"><span>KEY POINTS</span><span className="takeaway-rule" /></div><ul>{lesson.keyPoints.map((point, index) => <li key={point} data-testid={`takeaway-${index + 1}`}><CheckCircle2 size={15} /> {point}</li>)}</ul></div><div className="topic-takeaway" data-testid="topic-takeaway"><Sparkles size={17} /><div><span>TAKEAWAY</span><p>{lesson.takeaway}</p></div></div><div className="topic-navigation"><button disabled={topicIndex === 0} onClick={() => onNavigate(topicIndex - 1)} data-testid="previous-topic-button"><ArrowLeft size={15} /> Previous topic</button><button disabled={topicIndex === module.topics.length - 1} onClick={() => onNavigate(topicIndex + 1)} data-testid="next-topic-button">Next topic <ArrowRight size={15} /></button></div></div>;
}

function ExplorePanel({ module }: { module: SyllabusModule }) {
  return <div className="learning-panel" data-testid="explore-panel"><div className="panel-kicker"><span className="kicker-dot violet-dot" /> INTERACTIVE 3D PREVIEW</div><h2 data-testid="explore-panel-title">Make the architecture visible.</h2><p className="panel-copy" data-testid="explore-panel-copy">Phase 2 turns this {module.title.toLowerCase()} map into a manipulable scene. Start with HDFS, then switch visual modes to compare the other syllabus systems.</p><div className="architecture-preview" data-testid="architecture-preview"><div className="architecture-line line-a" /><div className="architecture-line line-b" /><div className="architecture-node node-a"><Database size={18} /><span>NameNode</span></div><div className="architecture-node node-b"><Layers3 size={18} /><span>DataNodes</span></div><div className="architecture-node node-c"><Sparkles size={18} /><span>Insights</span></div><div className="data-pulse pulse-a" /><div className="data-pulse pulse-b" /></div><div className="preview-footer" data-testid="explore-preview-footer"><span><MousePointer2 size={15} /> Click to inspect</span><span><Layers3 size={15} /> Orbit and zoom</span><span><LockKeyhole size={15} /> Phase 2</span><Link to="/lab" className="preview-lab-link" data-testid="open-3d-lab-button">Open full 3D lab <ArrowRight size={14} /></Link></div></div>;
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
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const moduleIndex = syllabusModules.findIndex((item) => item.id === module.id);
  const nextModule = syllabusModules[moduleIndex + 1];

  const navigateTopic = (index: number) => {
    const safeIndex = Math.max(0, Math.min(module.topics.length - 1, index));
    setActiveTopicIndex(safeIndex);
    setActiveTab("learn");
    trackProgress("topic", module.topics[safeIndex].id);
  };

  useEffect(() => {
    setActiveTopicIndex(0);
    trackProgress("topic", module.topics[0].id);
  }, [module.id, module.topics]);

  useEffect(() => {
    const onSwipe = (event: Event) => {
      const direction = (event as CustomEvent<string>).detail;
      setActiveTopicIndex((current) => {
        const next = direction === "next" ? Math.min(module.topics.length - 1, current + 1) : Math.max(0, current - 1);
        trackProgress("topic", module.topics[next].id);
        return next;
      });
      setActiveTab("learn");
    };
    window.addEventListener("lesson-swipe", onSwipe);
    return () => window.removeEventListener("lesson-swipe", onSwipe);
  }, [module.topics]);

  return <div className="content-stack" data-testid="module-page"><div className="module-page-top"><div><Link to="/subject/big-data-analytics" className="back-link" data-testid="module-back-link"><ArrowLeft size={15} /> All modules</Link><p className="eyebrow cyan-eyebrow" data-testid="module-eyebrow">{module.code} · {module.topics.length} STUDY POINTS</p><h1 className="page-title" data-testid="module-page-title">{module.title}</h1><p className="page-lede" data-testid="module-page-description">{module.description}</p></div><div className="module-status-card" data-testid="module-status-card"><div className="status-icon"><Sparkles size={18} /></div><span className="metric-label">Your progress</span><strong data-testid="module-status-progress">{module.progress}%</strong><div className="progress-track"><div className="progress-fill" style={{ width: `${module.progress}%`, backgroundColor: module.accent }} /></div><small data-testid="module-status-duration">{module.duration} estimated</small></div></div><div className="module-workspace" data-testid="module-workspace"><ModuleProgressRail module={module} activeTopicId={module.topics[activeTopicIndex].id} onSelect={navigateTopic} /><section className="module-content glass-panel" data-testid="module-content"><div className="learning-tabs" role="tablist" aria-label="Learning modes" data-testid="learning-tabs">{tabConfig.map(({ id, label, icon: Icon }) => <button key={id} className={`learning-tab ${activeTab === id ? "is-active" : ""}`} onClick={() => setActiveTab(id)} role="tab" aria-selected={activeTab === id} data-testid={`learning-tab-${id}`}><Icon size={16} />{label}</button>)}</div>{activeTab === "learn" && <LearnPanel module={module} topicIndex={activeTopicIndex} onNavigate={navigateTopic} />}{activeTab === "explore" && <ExplorePanel module={module} />}{activeTab === "practice" && <PracticePanel module={module} />}{activeTab === "code" && <CodePanel module={module} />}{activeTab === "quiz" && <ModuleQuiz moduleId={module.id} />}</section></div><div className="module-footer-row" data-testid="module-footer-row"><span data-testid="module-footer-status"><CheckCircle2 size={15} /> Explanations, visual models, practice and quiz stay connected in one module.</span>{nextModule ? <Link to={`/subject/big-data-analytics/module/${nextModule.id}`} className="next-module-link" data-testid="next-module-link">Next module <ArrowRight size={15} /></Link> : <Link to="/progress" className="next-module-link" data-testid="next-module-link">View study plan <ArrowRight size={15} /></Link>}</div></div>;
}