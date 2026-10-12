/** Markdown → plain text for one-line previews (headings, emphasis, list markers, links). */
export const stripMarkdown = (text: string) =>
  text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^\s*(?:[-+*]|\d+\.)\s+/gm, "")
    .replace(/[#*`~>|]+/g, "")
    .replace(/(?<!\w)_+|_+(?!\w)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

export const wordCount = (text?: string) => {
  const plain = text ? stripMarkdown(text) : "";
  return plain ? plain.split(" ").length : 0;
};
