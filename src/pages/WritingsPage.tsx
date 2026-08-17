import { Link } from "react-router-dom";
import { useState } from "react";
import { writings, writingTags } from "../content/writings";
import { usePageMeta } from "../hooks/usePageMeta";

export function WritingsPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const visibleWritings = activeTag
    ? writings.filter((writing) => writing.tags.includes(activeTag))
    : writings;

  usePageMeta(
    "Writings",
    "Writing by Michael Suteja on experiences, films, food, places, and ideas.",
  );

  return (
    <main className="index-page writings-page">
      <header className="index-header">
        <h1>writings</h1>
        <p>Thoughts, experiences, and things worth putting into words.</p>
      </header>

      <p className="writing-statement">
        I find writing about what lingers in the mind to be an exercise in thought. Learning to articulate, as clearly as I can, experiences and emotions that can never be fully captured through mere description alone is a skill I consider indispensable in an age increasingly saturated with AI slop and disingenuous writing that merely echoes the dogma of collective thought.  
      </p>

      <div className="writing-filters" aria-label="Filter writings by tag">
        <button
          type="button"
          className={activeTag === null ? "active" : undefined}
          onClick={() => setActiveTag(null)}
          aria-pressed={activeTag === null}
        >
          all
        </button>
        {writingTags.map((tag) => (
          <button
            type="button"
            key={tag}
            className={activeTag === tag ? "active" : undefined}
            onClick={() => setActiveTag(tag)}
            aria-pressed={activeTag === tag}
          >
            {tag}
          </button>
        ))}
      </div>

      <section className="writing-list" aria-label="Writings">
        {visibleWritings.map((writing) => (
          <Link key={writing.slug} to={`/writings/${writing.slug}`}>
            <span className="writing-title-group">
              <strong>{writing.title}</strong>
              <span className="writing-tags">
                {writing.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </span>
            </span>
            <time dateTime={writing.date}>{writing.displayDate}</time>
          </Link>
        ))}
        {visibleWritings.length === 0 && (
          <p className="writing-empty">No writing tagged “{activeTag}” yet.</p>
        )}
      </section>
    </main>
  );
}
