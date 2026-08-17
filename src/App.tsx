import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ScrollToTop } from "./components/ScrollToTop";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { WritingPage } from "./pages/WritingPage";
import { WritingsPage } from "./pages/WritingsPage";

function getBasename() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return base || undefined;
}

export default function App() {
  return (
    <BrowserRouter basename={getBasename()}>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="writings" element={<WritingsPage />} />
          <Route path="writings/:slug" element={<WritingPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
