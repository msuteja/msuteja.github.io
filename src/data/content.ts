export type Project = {
  title: string;
  description: string;
  codeUrl?: string;
  media?:
    | {
        type: "image";
        src: string;
        alt: string;
      }
    | {
        type: "video";
        src: string;
        alt: string;
        poster?: string;
      };
};

// Add a media object to any project after placing its file in public/projects/.
// Videos are automatically muted, looped, and played inline.
export const projects: Project[] = [
  {
    title: "IIS Content Security Policy Manager",
    description:
      "A .NET tool that can be installed as a Windows Service for managing IIS Content Security Policy configuration.",
    codeUrl: "https://github.com/msuteja/CSPManager",
    media: {
      type: "image",
      src: "projects/cspManager.png",
      alt: "Screenshot of the URL Rewrite Map and Content Security Policy Manager",
    }
  },
  {
    title: "codellamas",
    description:
      "A VS Code extension for generating and evaluating Java Spring Boot refactoring exercises.",
    codeUrl: "https://github.com/melly19/codellamas",
    media: {
      type: "video",
      src: "projects/codellamas.mp4",
      alt: "Screenshot of the codellamas VS Code extension",
      poster: "projects/codellamas.png"
    }
  },
  {
    title: "Sign Language Recognition System",
    description:
      "An American Sign Language recognition system with word and sentence autocompletion.",
    codeUrl: "https://github.com/msuteja/signLanguage",
    media: {
      type: "image",
      src: "projects/signLanguage.png",
      alt: "Screenshot of the Sign Language Recognition System",
    }
  },
  {
    title: "Cooking Spree - Process Management Game",
    description:
      "An Overcooked-style process management game to teaching project management concepts.",
    codeUrl: "https://github.com/msuteja/ProcessManagerGame",
    media: {
      type: "video",
      src: "projects/projectManagerGame.mp4",
      alt: "Screenshot of Cooking Spree - Process Management Game",
      poster: "projects/cookingspree.jpg"
    }
  },
  {
    title: "Scrooge Global Bank - Customer Relationship Management System",
    description:
      "A customer relationship management system for a fictional Scrooge Global Bank, deployed in AWS following a microservices architecture.",
    media: {
      type: "image",
      src: "projects/301project.png",
      alt: "Customer Relationship Management System Homepage"
    }
  },
  {
    title: "Big Two Card Game",
    description:
      "A card game inspired by the popular Big Two game, implemented in Java with a graphical user interface.",
    codeUrl: "https://github.com/msuteja/bigtwo",
    media: {
      type: "video",
      src: "projects/bigTwo.mkv",
      alt: "Gameplay of the Big Two Card Game"
    }
  },
];
