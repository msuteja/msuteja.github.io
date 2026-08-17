import { projects, type Project } from "../data/content";
import { usePageMeta } from "../hooks/usePageMeta";

function publicAsset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}

function ProjectMedia({ project }: { project: Project }) {
  if (!project.media) {
    return (
      <div className="project-media-placeholder" aria-label="Project media placeholder">
        <span>project media</span>
        <small>image or looping video</small>
      </div>
    );
  }

  if (project.media.type === "video") {
    return (
      <video
        src={publicAsset(project.media.src)}
        poster={
          project.media.poster ? publicAsset(project.media.poster) : undefined
        }
        aria-label={project.media.alt}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />
    );
  }

  return (
    <img
      src={publicAsset(project.media.src)}
      alt={project.media.alt}
      loading="lazy"
    />
  );
}

export function ProjectsPage() {
  usePageMeta(
    "Projects",
    "Selected software projects by Michael Suteja.",
  );

  return (
    <main className="index-page projects-page">
      <header className="index-header">
        <h1>projects</h1>
        <p>A small collection of things I have contributed to in building.</p>
      </header>

      <section className="project-grid" aria-label="Selected projects">
        {projects.map((project) => (
          <article className="project-card" key={project.title}>
            <div className="project-media">
              <ProjectMedia project={project} />
            </div>
            <div className="project-card-copy">
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              {project.codeUrl && (
                <a
                  className="project-code-link"
                  href={project.codeUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Code ↗
                </a>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
