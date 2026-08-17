import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import rehypeKatex from "rehype-katex";
import remarkFrontmatter from "remark-frontmatter";
import remarkMath from "remark-math";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

const buildDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Singapore",
}).format(new Date());

export default defineConfig({
  plugins: [
    mdx({
      remarkPlugins: [
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: "frontmatter" }],
        remarkMath,
      ],
      rehypePlugins: [rehypeKatex],
    }),
    react(),
  ],
  define: {
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  base: process.env.VITE_BASE_PATH || "/",
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
  },
});
