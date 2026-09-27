import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, BookOpen, Calculator, CheckCircle2, Clock3, Code2, Database, Search, Sparkles } from "lucide-react";
import { syllabusModules, syllabusSubject } from "@/data/syllabus";

export default function Subject() {
  const [query, setQuery] = useState("");
  const filteredModules = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return syllabusModules;
    return syllabusModules.filter((module) => `${module.title} ${module.description} ${module.topics.map((topic) => topic.title).join(" ")}`.toLowerCase().includes(normalized));
  }, [query]);

  return (
    <div className="content-stack" data-testid="subject-page">
      <div className="page-heading-row" data-testid="subject-heading-row">
        <div>
          <Link to="/" className="back-link" data-testid="subject-back-link"><ArrowLeft size={15} /> Back to dashboard</Link>
          <p className="eyebrow cyan-eyebrow" data-testid="subject-eyebrow">VTU 2022 SCHEME · {syllabusSubject.code}</p>
          <h1 className="page-title" data-testid="subject-page-title">{syllabusSubject.name}</h1>
          <p className="page-lede" data-testid="subject-page-description">{syllabusSubject.description}</p>
        </div>
        <div className="heading-orbit-card" data-testid="subject-orbit-card">
          <div className="orbit-ring orbit-ring-one" /><div className="orbit-ring orbit-ring-two" /><div className="orbit-core"><Database size={24} /></div>
          <span className="orbit-caption" data-testid="subject-orbit-caption">5 modules · 47 study points</span>
        </div>
      </div>

      <div className="metric-strip" data-testid="subject-metrics">
        <div className="metric-cell" data-testid="subject-progress-metric"><span className="metric-label">Overall progress</span><strong>28%</strong><div className="progress-track"><div className="progress-fill progress-cyan" style={{ width: "28%" }} /></div></div>
        <div className="metric-cell" data-testid="subject-topics-metric"><span className="metric-label">Topics mapped</span><strong>47</strong><span className="metric-note"><CheckCircle2 size={14} /> 14 explored</span></div>
        <div className="metric-cell" data-testid="subject-practice-metric"><span className="metric-label">Practice queue</span><strong>12</strong><span className="metric-note amber-note"><Calculator size={14} /> numericals ready</span></div>
        <div className="metric-cell" data-testid="subject-code-metric"><span className="metric-label">Code library</span><strong>16</strong><span className="metric-note violet-note"><Code2 size={14} /> snippets mapped</span></div>
      </div>

      <div className="section-heading-row" data-testid="module-list-heading-row">
        <div><p className="eyebrow" data-testid="module-list-eyebrow">THE LEARNING PATH</p><h2 className="section-title" data-testid="module-list-title">Five modules. One connected story.</h2></div>
        <label className="module-search" data-testid="module-search-label"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter modules or topics" aria-label="Filter modules or topics" data-testid="module-search-input" /></label>
      </div>

      <div className="module-list" data-testid="module-list">
        {filteredModules.map((module, index) => (
          <article className="module-row glass-panel" key={module.id} data-testid={`module-card-${module.id}`}>
            <div className="module-number" style={{ color: module.accent }} data-testid={`module-number-${module.id}`}>{String(index + 1).padStart(2, "0")}</div>
            <div className="module-info"><div className="module-code" style={{ color: module.accent }} data-testid={`module-code-${module.id}`}>{module.code}</div><h3 data-testid={`module-title-${module.id}`}>{module.title}</h3><p data-testid={`module-description-${module.id}`}>{module.description}</p><div className="module-meta" data-testid={`module-meta-${module.id}`}><span><Clock3 size={14} /> {module.duration}</span><span><BookOpen size={14} /> {module.topics.length} topics</span><span><Calculator size={14} /> {module.numericals.length} numericals</span><span><Code2 size={14} /> {module.snippets.length} snippets</span></div></div>
            <div className="module-progress" data-testid={`module-progress-${module.id}`}><span>{module.progress}%</span><div className="progress-track"><div className="progress-fill" style={{ width: `${module.progress}%`, backgroundColor: module.accent }} /></div><small>complete</small></div>
            <Link to={`/subject/big-data-analytics/module/${module.id}`} className="circle-arrow" aria-label={`Open ${module.title}`} data-testid={`module-open-button-${module.id}`}><ArrowUpRight size={19} /></Link>
          </article>
        ))}
        {filteredModules.length === 0 && <div className="empty-state glass-panel" data-testid="module-search-empty-state"><Sparkles size={20} /><p data-testid="module-search-empty-message">No module matches that search yet. Try “HDFS”, “Hive” or “PageRank”.</p></div>}
      </div>

      <section className="practical-banner glass-panel" data-testid="practical-banner">
        <div className="banner-icon"><Sparkles size={21} /></div><div><p className="eyebrow" data-testid="practical-banner-eyebrow">PRACTICAL COMPONENT / IPCC</p><h3 data-testid="practical-banner-title">Nine experiments mapped for your lab record.</h3><p data-testid="practical-banner-copy">HDFS file management, matrix multiplication, weather mining, MongoDB, Pig, Hive, Spark and more will live beside every concept.</p></div><Link to="/progress" className="text-link" data-testid="practical-banner-link">View study plan <ArrowUpRight size={15} /></Link>
      </section>
    </div>
  );
}