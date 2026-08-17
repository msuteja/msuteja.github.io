import { Link, useParams } from "react-router-dom";
import { getWriting } from "../content/writings";
import { usePageMeta } from "../hooks/usePageMeta";

export function WritingPage() {
  const { slug = "" } = useParams();
  const writing = getWriting(slug);

  usePageMeta(
    writing?.title ?? "Writing not found",
    writing?.excerpt ?? "This writing could not be found.",
  );

  if (!writing) {
    return (
      <main className="missing-page">
        <p>404</p>
        <h1>This writing does not exist.</h1>
        <Link to="/writings">back to writings</Link>
      </main>
    );
  }

  return (
    <main className="article-page">
      <Link className="back-link" to="/writings">
        ← writings
      </Link>

      <article>
        <header className="article-header">
          <time dateTime={writing.date}>{writing.displayDate}</time>
          <h1>{writing.title}</h1>
          <div className="article-tags" aria-label="Tags">
            {writing.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </header>

        <div className="article-body">
          <writing.Component />
        </div>

        <footer className="article-end">
          <Link to="/writings">more writing</Link>
        </footer>
      </article>
    </main>
  );
}
