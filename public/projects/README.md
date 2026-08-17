Place project images and short videos in this folder.

Then add a `media` object to the matching project in `src/data/content.ts`.

Image example:

```ts
media: {
  type: "image",
  src: "projects/codellamas.jpg",
  alt: "The Codellamas extension inside VS Code",
},
```

Looping video example:

```ts
media: {
  type: "video",
  src: "projects/codellamas-demo.mp4",
  poster: "projects/codellamas-poster.jpg",
  alt: "A short demonstration of Codellamas",
},
```

Videos play automatically, muted, inline, and on a loop. Keep files short and
compressed so the projects page stays quick to load.
