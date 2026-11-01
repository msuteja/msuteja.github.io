const sisyphusImage =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Punishment_sisyph.jpg/500px-Punishment_sisyph.jpg";
const sisyphusImageLarge =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Punishment_sisyph.jpg/960px-Punishment_sisyph.jpg";
const sisyphusSource =
  "https://en.wikipedia.org/wiki/File:Punishment_sisyph.jpg";

export function SisyphusFilmAnimation() {
  return (
    <figure className="sisyphus-figure">
      <div className="sisyphus-artwork">
        <img
          src={sisyphusImage}
          srcSet={`${sisyphusImage} 500w, ${sisyphusImageLarge} 960w`}
          sizes="(max-width: 640px) 78vw, 310px"
          alt="Sisyphus straining beneath the boulder in Titian's painting"
          decoding="async"
        />
      </div>
      <figcaption>
        <span>the watchlist grows faster than the climb</span>
        <a href={sisyphusSource} target="_blank" rel="noreferrer">
          Titian, c. 1548–49
        </a>
      </figcaption>
    </figure>
  );
}

