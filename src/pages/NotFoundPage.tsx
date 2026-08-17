import { Link } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta";

export function NotFoundPage() {
  usePageMeta("Page not found", "This page could not be found.");

  return (
    <main className="missing-page">
      <p>404</p>
      <h1>This page does not exist.</h1>
      <Link to="/">go home</Link>
    </main>
  );
}
