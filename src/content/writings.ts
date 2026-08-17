import type { ComponentType } from "react";

export type WritingFrontmatter = {
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
};

type WritingModule = {
  default: ComponentType;
  frontmatter: WritingFrontmatter;
};

export type Writing = WritingFrontmatter & {
  slug: string;
  displayDate: string;
  Component: ComponentType;
};

const modules = import.meta.glob<WritingModule>("./writings/*.mdx", {
  eager: true,
});

export const writingTags = ["travel", "food", "films"] as const;

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export const writings: Writing[] = Object.entries(modules)
  .map(([path, module]) => ({
    ...module.frontmatter,
    tags: module.frontmatter.tags ?? [],
    slug: path.split("/").pop()!.replace(/\.mdx$/, ""),
    displayDate: formatDate(module.frontmatter.date),
    Component: module.default,
  }))
  .sort((a, b) => b.date.localeCompare(a.date));

export function getWriting(slug: string) {
  return writings.find((writing) => writing.slug === slug);
}
