export type ExperiencePhoto = {
  src?: string;
  alt: string;
  caption: string;
};

export type Experience = {
  id: string;
  role: string;
  company: string;
  location: string;
  date: string;
  description: string;
  photos: ExperiencePhoto[];
};

// Add image files to public/experiences, then set each photo's src and caption below.
// Keeping src empty leaves a tidy placeholder in the gallery.
export const experiences: Experience[] = [
  {
    id: "ocbc",
    role: "Software Engineer (Internship)",
    company: "OCBC",
    location: "Singapore",
    date: "May — Aug 2026",
    description:
      "Built dependency-free internal developer tools that automated IIS rewrite rules and Content Security Policy configuration.",
    photos: [
      {
        src: "experiences/ocbc-1.jpg",
        alt: "The FRANK team in front of our project poster",
        caption:
          "My FRANK team and I and our solution poster",
      },
      {
        src: "experiences/ocbc-2.jpg",
        alt: "Michael at lunch with his supervisor and fellow intern",
        caption:
          "Department lunch with Zorba, my supervisor, and Nicholas, my fellow intern",
      },
    ],
  },
  {
    id: "radach",
    role: "Software Engineer (Internship)",
    company: "Radach & Family Organics",
    location: "Bangkok",
    date: "May — Aug 2025",
    description:
      "Worked on content management and software improvements supporting the company’s digital operations.",
    photos: [
      {
        src: "experiences/radach-1.jpg",
        alt: "The Radach team planting mangroves",
        caption: "Mangrove planting with the team",
      },
      {
        src: "experiences/radach-2.jpg",
        alt: "The Radach team during a marketing activity",
        caption: "Being part of a marketing effort with the team",
      },
    ],
  },
  {
    id: "teaching-assistant",
    role: "Teaching Assistant",
    company: "Singapore Management University",
    location: "Singapore",
    date: "Jul — Nov 2024",
    description:
      "Guided students through UI/UX project work and object-oriented programming exercises for IS211 and IS442.",
    photos: [
      {
        alt: "Teaching Assistant photo 1",
        caption: "A moment from my time as a teaching assistant.",
      },
    ],
  },
];
