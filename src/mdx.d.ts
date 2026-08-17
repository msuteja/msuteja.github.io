declare module "*.mdx" {
  import type { ComponentType } from "react";

  export const frontmatter: {
    title: string;
    date: string;
    excerpt: string;
  };

  const MDXContent: ComponentType;
  export default MDXContent;
}
