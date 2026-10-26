import fs from "node:fs";
import path from "node:path";

import type { File } from "./get-files";

export interface FileFormat {
  label: string;
  ext: string;
  name: string;
  path: string;
}

export interface FileGroup {
  key: string;
  title: string;
  formats: FileFormat[];
  primary: FileFormat;
}

// The first format found in this list is used for the row's main link
const FORMAT_PRIORITY = ["md", "html", "pdf", "iseq"];
const MARKDOWN_EXTENSIONS = ["md", "markdown"];

const getFrontmatterTitle = (filePath: string): string | null => {
  let content: string;

  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }

  const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/);

  if (lines[0]?.trim() !== "---") {
    return null;
  }

  const end = lines.findIndex((line, i) => i > 0 && line.trim() === "---");

  if (end < 0) {
    return null;
  }

  const titleLine = lines.slice(1, end).find((line) => /^title\s*:/i.test(line));

  return (
    titleLine
      ?.replace(/^title\s*:/i, "")
      .trim()
      .replace(/^(["'])(.*)\1$/, "$2") || null
  );
};

const groupFiles = (files: File[]): FileGroup[] => {
  const groups = new Map<string, FileFormat[]>();

  files.forEach((file) => {
    const parsed = path.parse(file.name);
    const ext = parsed.ext.replace(/^\./, "").toLowerCase();
    const key = ext ? parsed.name : file.name;

    const formats = groups.get(key) ?? [];
    formats.push({
      label: (ext || "file").toUpperCase(),
      ext,
      name: file.name,
      path: file.path,
    });
    groups.set(key, formats);
  });

  const rank = (ext: string) => {
    const index = FORMAT_PRIORITY.indexOf(ext);
    return index === -1 ? FORMAT_PRIORITY.length : index;
  };

  return Array.from(groups.entries())
    .map(([key, formats]) => {
      const sorted = [...formats].sort(
        (a, b) => rank(a.ext) - rank(b.ext) || a.name.localeCompare(b.name),
      );
      const markdown = sorted.find((x) =>
        MARKDOWN_EXTENSIONS.includes(x.ext),
      );

      return {
        key,
        title: (markdown && getFrontmatterTitle(markdown.path)) || key,
        formats: sorted,
        primary: sorted[0]!,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
};

export default groupFiles;
