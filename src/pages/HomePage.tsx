import { Clapperboard, ChessKnight, House, Piano } from "lucide-react";
import { useState } from "react";
import { ExperienceGallery } from "../components/ExperienceGallery";
import { ProfilePhoto } from "../components/ProfilePhoto";
import { experiences, type Experience } from "../data/experiences";
import { designCredits, siteLinks } from "../data/site";
import { usePageMeta } from "../hooks/usePageMeta";

const contacts = [
  { label: "Email", href: siteLinks.email },
  { label: "LinkedIn", href: siteLinks.linkedin },
  { label: "GitHub", href: siteLinks.github },
  { label: "Letterboxd", href: siteLinks.letterboxd },
];

const personalDetails = [
  {
    Icon: House,
    content: <>From the small town of Bogor, Indonesia</>,
  },
  {
    Icon: Piano,
    content: (
      <>
        Classically trained (amateur){" "}
        <a href={siteLinks.piano} target="_blank" rel="noreferrer">
          pianist
        </a>
      </>
    ),
  },
  {
    Icon: ChessKnight,
    content: <>Love playing chess and poker</>,
  },
  {
    Icon: Clapperboard,
    content: (
      <>
        Will free up my schedule for good food and{" "}
        <a href={siteLinks.letterboxd} target="_blank" rel="noreferrer">
          good films
        </a>
      </>
    ),
  },
];

export function HomePage() {
  const [aboutTab, setAboutTab] = useState<"personal" | "professional">(
    "personal",
  );
  const [selectedExperience, setSelectedExperience] =
    useState<Experience | null>(null);

  usePageMeta(
    "Michael Suteja",
    "Michael Suteja is an Indonesian-Thai computer science undergraduate at Singapore Management University.",
  );

  return (
    <main className="home-page">
      <section className="home-intro" aria-labelledby="home-title">
        <div className="home-copy">
          <h1 id="home-title">Hi, I&apos;m Michael</h1>
          <p>
            I am an Indonesian-Thai Computer Science undergraduate at Singapore
            Management University
          </p>
          <p>
            Previously, I had short stints at OCBC and Radach &amp; Family
            Organics as a Software Engineer Intern where I worked on internal
            developer tooling and content management
          </p>
          <p>
            I am borderline addicted to the consumption of great food and great
            films — both of which I find to be life&apos;s greatest pleasures
          </p>
          <nav className="contact-list" aria-label="Contact links">
            {contacts.map((contact) => (
              <a
                key={contact.label}
                href={contact.href}
                target={contact.href.startsWith("http") ? "_blank" : undefined}
                rel={contact.href.startsWith("http") ? "noreferrer" : undefined}
              >
                {contact.label.toLowerCase()}
              </a>
            ))}
          </nav>
        </div>
        <ProfilePhoto />
      </section>

      <section className="about-section" aria-labelledby="about-title">
        <h2 id="about-title">a little about me</h2>
        <div className="about-panel">
          <div className="about-tabs" role="tablist" aria-label="About me">
            <button
              id="personal-tab"
              type="button"
              role="tab"
              aria-selected={aboutTab === "personal"}
              aria-controls="about-panel-content"
              className={aboutTab === "personal" ? "active" : undefined}
              onClick={() => setAboutTab("personal")}
            >
              personal
            </button>
            <button
              id="professional-tab"
              type="button"
              role="tab"
              aria-selected={aboutTab === "professional"}
              aria-controls="about-panel-content"
              className={aboutTab === "professional" ? "active" : undefined}
              onClick={() => setAboutTab("professional")}
            >
              professional
            </button>
          </div>

          <div
            id="about-panel-content"
            className="about-panel-content"
            role="tabpanel"
            aria-labelledby={`${aboutTab}-tab`}
          >
            {aboutTab === "personal" ? (
              <ul className="personal-list">
                {personalDetails.map((item, index) => (
                  <li key={index}>
                    <item.Icon aria-hidden="true" strokeWidth={1.6} />
                    <p>{item.content}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="professional-list">
                {experiences.map((item) => (
                  <article key={`${item.company}-${item.role}`}>
                    {item.id === "teaching-assistant" ? (
                      <div className="experience-trigger">
                        <span className="experience-heading">
                          <span>
                            <strong>{item.role}</strong>
                            <small>
                              {item.company} · {item.location}
                            </small>
                          </span>
                          <time>{item.date}</time>
                        </span>

                        <span className="experience-description">
                          {item.description}
                        </span>
                      </div>
                    ) : (
                      <button
                        className="experience-trigger"
                        type="button"
                        onClick={() => setSelectedExperience(item)}
                        aria-label={`View photos from ${item.company}`}
                      >
                        <span className="experience-heading">
                          <span>
                            <strong>{item.role}</strong>
                            <small>
                              {item.company} · {item.location}
                            </small>
                          </span>
                          <time>{item.date}</time>
                        </span>

                        <span className="experience-description">
                          {item.description}
                        </span>

                        <span className="experience-view">view photos ↗</span>
                      </button>
                    )}
                  </article>
                ))}
                <a
                  className="cv-link"
                  href={`${import.meta.env.BASE_URL}Michael_Suteja_CV.pdf`}
                  download
                >
                  download cv ↓
                </a>
              </div>
            )}
          </div>
        </div>
        <p className="design-credits">
          design inspirations: {designCredits.map((credit, index) => (
            <span key={credit.name}>
              {index > 0 && " · "}
              <a href={credit.href} target="_blank" rel="noreferrer">
                {credit.name}
              </a>
            </span>
          ))}
        </p>
      </section>

      {selectedExperience && (
        <ExperienceGallery
          experience={selectedExperience}
          onClose={() => setSelectedExperience(null)}
        />
      )}
    </main>
  );
}
