import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  Box,
  BrainCircuit,
  ChevronRight,
  Database,
  Hand,
  Home,
  Menu,
  Mic,
  Moon,
  Search,
  Settings,
  Sparkles,
  Sun,
  Trophy,
  X,
} from "lucide-react";
import { searchSyllabus } from "@/data/syllabus";

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { label: "Home", path: "/", icon: Home, testId: "nav-home-link" },
  { label: "VTU syllabus", path: "/subject/big-data-analytics", icon: BookOpen, testId: "nav-subjects-link" },
  { label: "3D learning lab", path: "/lab", icon: Box, testId: "nav-lab-link" },
  { label: "Gesture mode", path: "/gesture", icon: Hand, testId: "nav-gesture-link" },
  { label: "Progress", path: "/progress", icon: Trophy, testId: "nav-progress-link" },
];

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = searchSyllabus(searchQuery).slice(0, 5);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const closeMenu = () => setMenuOpen(false);
  const isActive = (path: string) => path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <div className="app-shell" data-testid="app-shell">
      <aside className={`app-sidebar ${menuOpen ? "is-open" : ""}`} data-testid="app-sidebar">
        <div className="sidebar-brand" data-testid="sidebar-brand">
          <div className="brand-mark" aria-hidden="true"><Sparkles size={18} /></div>
          <div>
            <p className="brand-name" data-testid="brand-name">Learn Beyond</p>
            <p className="brand-subtitle" data-testid="brand-subtitle">Interactive textbook</p>
          </div>
          <button className="icon-button sidebar-close" onClick={closeMenu} aria-label="Close menu" data-testid="sidebar-close-button">
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-label" data-testid="sidebar-navigation-label">Workspace</div>
        <nav className="sidebar-nav" aria-label="Primary navigation" data-testid="primary-navigation">
          {navItems.map(({ label, path, icon: Icon, testId }) => (
            <Link
              key={path}
              to={path}
              onClick={closeMenu}
              className={`sidebar-link ${isActive(path) ? "is-active" : ""}`}
              data-testid={testId}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span data-testid={`${testId}-label`}>{label}</span>
              {isActive(path) && <span className="active-indicator" aria-hidden="true" />}
            </Link>
          ))}
        </nav>

        <div className="sidebar-label sidebar-label-spaced" data-testid="sidebar-tools-label">Tools</div>
        <nav className="sidebar-nav" aria-label="Utility navigation" data-testid="utility-navigation">
          <Link to="/settings" onClick={closeMenu} className={`sidebar-link ${isActive("/settings") ? "is-active" : ""}`} data-testid="nav-settings-link">
            <Settings size={18} strokeWidth={1.8} /><span data-testid="nav-settings-link-label">Settings</span>
          </Link>
        </nav>

        <div className="sidebar-bottom" data-testid="sidebar-bottom-card">
          <div className="mini-orbit" aria-hidden="true"><div /><div /><div /></div>
          <p className="eyebrow" data-testid="sidebar-phase-label">PHASE 01 / FOUNDATION</p>
          <p className="sidebar-card-title" data-testid="sidebar-card-title">Make every concept visible.</p>
          <p className="sidebar-card-copy" data-testid="sidebar-card-copy">Your 3D lab, gestures and practice tools are being mapped to the syllabus.</p>
        </div>
      </aside>

      {menuOpen && <button className="sidebar-scrim" onClick={closeMenu} aria-label="Close navigation" data-testid="sidebar-scrim-button" />}

      <div className="app-main">
        <header className="topbar" data-testid="topbar">
          <button className="icon-button menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu" data-testid="menu-open-button"><Menu size={20} /></button>
          <div className="breadcrumbs" data-testid="breadcrumbs">
            <span className="breadcrumb-muted" data-testid="breadcrumb-product">Learn Beyond</span>
            <ChevronRight size={14} />
            <span data-testid="breadcrumb-current">Big Data Analytics</span>
          </div>
          <div className="topbar-actions">
            <div className="global-search-wrap" data-testid="global-search-wrap">
              <Search size={16} aria-hidden="true" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && searchResults[0]) {
                    navigate(`/subject/big-data-analytics/module/${searchResults[0].module.id}`);
                    setSearchQuery("");
                  }
                }}
                placeholder="Search the syllabus"
                aria-label="Search the syllabus"
                data-testid="global-search-input"
              />
              {searchQuery && <button className="search-clear" onClick={() => setSearchQuery("")} aria-label="Clear search" data-testid="global-search-clear-button"><X size={14} /></button>}
              {searchResults.length > 0 && (
                <div className="search-results" data-testid="global-search-results">
                  <p className="search-results-label" data-testid="global-search-results-label">Jump to a topic</p>
                  {searchResults.map(({ module, topic }) => (
                    <button
                      key={`${module.id}-${topic.id}`}
                      className="search-result"
                      onClick={() => { navigate(`/subject/big-data-analytics/module/${module.id}`); setSearchQuery(""); }}
                      data-testid={`global-search-result-${topic.id}`}
                    >
                      <span><strong data-testid={`search-result-title-${topic.id}`}>{topic.title}</strong><small data-testid={`search-result-module-${topic.id}`}>{module.code} · {module.title}</small></span>
                      <ChevronRight size={15} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="icon-button theme-toggle" onClick={() => setDarkMode((value) => !value)} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} data-testid="theme-toggle-button">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="profile-chip" data-testid="profile-chip"><span className="profile-avatar" data-testid="profile-avatar">A</span><span className="profile-name" data-testid="profile-name">Aarav</span></div>
          </div>
        </header>
        <main className="page-content" data-testid="page-content">{children}</main>
      </div>
    </div>
  );
}