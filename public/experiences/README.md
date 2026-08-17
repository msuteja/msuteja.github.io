Place experience photos in this folder, then connect them in
`src/data/experiences.ts`.

For example:

```ts
photos: [
  {
    src: "experiences/ocbc-1.jpg",
    alt: "Presenting my internship project at OCBC",
  },
  {
    src: "experiences/ocbc-2.jpg",
    alt: "A team photo from my OCBC internship",
  },
],
```

Each experience opens a popup gallery. The arrows, photo count, keyboard arrow
controls, and Escape-to-close behaviour work automatically with any number of
photos.
