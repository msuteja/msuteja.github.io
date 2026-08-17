import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const title = process.argv.slice(2).join(" ").trim();

if (!title) {
  console.error('Usage: npm run new:writing -- "Your writing title"');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .normalize("NFKD")
  .replace(/[^a-z0-9\s-]/g, "")
  .trim()
  .replace(/\s+/g, "-")
  .replace(/-+/g, "-");

const date = new Date().toISOString().slice(0, 10);
const directory = resolve("src/content/writings");
const file = resolve(directory, `${slug}.mdx`);
const template = `---
title: "${title.replaceAll('"', '\\"')}"
date: "${date}"
excerpt: "Add a short description for the writings page."
tags: []
---

Start writing here.

Inline maths works like this: $e^{i\\pi} + 1 = 0$.

Display maths works like this:

$$
\\int_0^1 x^2 \\, dx = \\frac{1}{3}
$$
`;

await mkdir(directory, { recursive: true });

try {
  await writeFile(file, template, { encoding: "utf8", flag: "wx" });
  console.log(`Created ${file}`);
} catch (error) {
  if (error && error.code === "EEXIST") {
    console.error(`A writing with the slug "${slug}" already exists.`);
    process.exit(1);
  }
  throw error;
}
