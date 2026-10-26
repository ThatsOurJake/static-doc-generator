import fs from "node:fs";
import path from "node:path";

import type { Site } from "./build-site";
import type { Directory } from "./get-dirs";
import getFiles from "./get-files";
import groupFiles, { type FileFormat } from "./group-files";
import parseDetailsFile from "./parse-details-file";
import renderTree from "./render-tree";
import saveTemplate from "./save-template";

const renderPage = async (
  directory: Directory,
  distDir: string,
  templatesDir: string,
  site: Site,
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
  const node = site.nodes.get(directory.relativePath);

  // Every ancestor, excluding the current page
  const segments = directory.relativePath.split("/").filter(Boolean);
  const crumbs = segments.slice(0, -1).map((segment, i) => {
    const crumbPath = `/${segments.slice(0, i + 1).join("/")}`;
    return { name: site.nodes.get(crumbPath)?.name ?? segment, path: crumbPath };
  });

  await saveTemplate(
    path.join(templatesDir, "page.ejs"),
    {
      title: details?.name || directory.name,
      navTree: renderTree(site.tree, directory.relativePath),
      crumbs,
      folders: node?.children ?? [],
      details,
      files: groupFiles(files).map((group) => {
        const withViewPath = (format: FileFormat) => ({
          ...format,
          path: path.join(directory.relativePath, format.name),
        });

        return {
          ...group,
          formats: group.formats.map(withViewPath),
          primary: withViewPath(group.primary),
        };
      }),
    },
    path.join(outputDir, "index.html"),
  );
};

export default renderPage;
