# My Personal Website

Welcome to my personal website! Built with React, TypeScript, Vite, and MDX, the website consists of three main pages: Home, Projects, and Writings.

## Pages

- `/` — A bit about myself
- `/projects` — Projects I have done
- `/food` — Restaurants and hawkers I have visited
- `/recommend-a-film` — Recommend a film for my watchlist
- `/writings` — Whenever I have something lingering on my mind

## Film recommendations

The film recommendation page uses the TMDB API for search, film details, and
posters. Create a free TMDB API key, then:

- For local development, copy `.env.example` to `.env.local` and add the key.
- For GitHub Pages, add the key as a repository Actions secret named
  `TMDB_API_KEY`.

The key is included in the browser build, as required for this static GitHub
Pages site, so it should be a TMDB application key and not a general-purpose
secret.

Recommendations are delivered to the email address in `src/data/site.ts` using
FormSubmit. The first live submission sends an activation email; confirm it once
to begin receiving recommendations.

## Design Inspirations

I owe the majority of my design to Ted Chai (https://www.tedchai.com/) and Stephen K. Yang (https://stephenkyang.com/).

Took inspiration for “A little about me” panel from Joel Lim (https://www.limjingkaijoel.com/).
