import fs from "node:fs";
import path from "node:path";

import type { Directory } from "./get-dirs";
import getFiles from "./get-files";
import parseDetailsFile from "./parse-details-file";
import saveTemplate from "./save-template";

const renderPage = async (
  directory: Directory,
  distDir: string,
  templatesDir: string,
) => {
  const outputDir = path.join(distDir, directory.relativePath);

  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Creating directory: ${directory.relativePath}`);

  console.log(`Generating Page for: ${directory.name}`);
  const files = getFiles(directory.parent);

  files.forEach((x) => {
    fs.copyFileSync(x.path, path.join(outputDir, x.name));
  });

  const details = parseDetailsFile(directory.parent);

  await saveTemplate(
    path.join(templatesDir, "page.ejs"),
    {
      title: details?.name || directory.name,
      links: directory.children.map((x) => {
        const childDetails = parseDetailsFile(x.parent);
        return {
          name: childDetails?.name || x.name,
          path: x.relativePath,
        };
      }),
      details,
      files: files.map((x) => ({
        name: x.name,
        path: path.join(directory.relativePath, x.name),
      })),
    },
    path.join(outputDir, "index.html"),
  );
};

export default renderPage;
