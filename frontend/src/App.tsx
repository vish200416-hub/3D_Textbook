import { Routes, Route } from "react-router-dom";
import AppShell from "@/components/AppShell";
import FeaturePreview from "@/pages/FeaturePreview";
import Home from "@/pages/Home";
import Lab from "@/pages/Lab";
import Module from "@/pages/Module";
import Subject from "@/pages/Subject";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/subject/big-data-analytics" element={<Subject />} />
        <Route path="/subject/big-data-analytics/module/:moduleId" element={<Module />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="/gesture" element={<FeaturePreview />} />
        <Route path="/progress" element={<FeaturePreview />} />
        <Route path="/settings" element={<FeaturePreview />} />
      </Routes>
    </AppShell>
  );
}
