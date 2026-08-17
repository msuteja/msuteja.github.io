import { ChevronLeft, ChevronRight, Image, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Experience } from "../data/experiences";

function publicAsset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}

type ExperienceGalleryProps = {
  experience: Experience;
  onClose: () => void;
};

export function ExperienceGallery({
  experience,
  onClose,
}: ExperienceGalleryProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [failedPhotos, setFailedPhotos] = useState<Set<number>>(new Set());
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const photo = experience.photos[photoIndex];

  const previousPhoto = () => {
    setPhotoIndex((current) =>
      current === 0 ? experience.photos.length - 1 : current - 1,
    );
  };

  const nextPhoto = () => {
    setPhotoIndex((current) => (current + 1) % experience.photos.length);
  };

  useEffect(() => {
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") previousPhoto();
      if (event.key === "ArrowRight") nextPhoto();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [experience.photos.length, onClose]);

  const showPlaceholder = !photo.src || failedPhotos.has(photoIndex);

  return (
    <div className="gallery-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="experience-gallery"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="gallery-header">
          <div>
            <p>{experience.date}</p>
            <h2 id="gallery-title">{experience.company}</h2>
          </div>
          <button
            ref={closeButtonRef}
            className="gallery-close"
            type="button"
            onClick={onClose}
            aria-label="Close photo gallery"
          >
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="gallery-stage">
          {showPlaceholder ? (
            <div className="gallery-placeholder">
              <Image aria-hidden="true" strokeWidth={1.4} />
              <span>{photo.alt}</span>
            </div>
          ) : (
            <img
              src={publicAsset(photo.src!)}
              alt={photo.alt}
              onError={() =>
                setFailedPhotos((current) => new Set(current).add(photoIndex))
              }
            />
          )}

          {experience.photos.length > 1 && (
            <>
              <button
                className="gallery-arrow gallery-arrow-left"
                type="button"
                onClick={previousPhoto}
                aria-label="Previous photo"
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <button
                className="gallery-arrow gallery-arrow-right"
                type="button"
                onClick={nextPhoto}
                aria-label="Next photo"
              >
                <ChevronRight aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        <footer className="gallery-footer">
          <p>{photo.caption}</p>
          <span>
            {photoIndex + 1} / {experience.photos.length}
          </span>
        </footer>
      </section>
    </div>
  );
}
