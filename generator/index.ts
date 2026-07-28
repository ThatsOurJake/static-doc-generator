import fs from "node:fs";
import path from "node:path";

import compile from "./compiler";
import getDirs, { type Directory } from "./utils/get-dirs";
import getNotifications from "./utils/get-notifications";
import parseDetailsFile from "./utils/parse-details-file";
import renderPage from "./utils/render-page";
import saveTemplate from "./utils/save-template";

(async () => {
  const docsDir = path.resolve("docs");
  const distDir = path.resolve("dist");
  const clientScriptDir = path.resolve("client");
  const templatesDir = path.resolve(__dirname, "templates");

  console.log("⚒ Building Static Site");
  console.log(`Building from: ${docsDir}`);

  console.log("Deleting Dist Directory");
  fs.rmSync(distDir, { force: true, recursive: true });

  console.log("Making Dist Directory");
  fs.mkdirSync(distDir);

  const directories = getDirs(docsDir, docsDir).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  // Generate each page
  const generatePages = async (dirs: Directory[]) => {
    for (let i = 0; i < dirs.length; i++) {
      const directory = dirs[i];

      if (!directory) {
        continue;
      }

      await renderPage(directory, distDir, templatesDir);

      if (directory.children.length > 0) {
        await generatePages(directory.children);
      }
    }
  };

  await generatePages(directories);

  console.log("Generating Home Page");
  const homepageNotifications = getNotifications(docsDir);
  await saveTemplate(
    path.join(templatesDir, "main.ejs"),
    {
      title: "Jakes Documentation",
      links: directories.map((x) => {
        const dirDetails = parseDetailsFile(x.parent);

        return { name: dirDetails?.name || x.name, path: x.relativePath };
      }),
      notifications: homepageNotifications,
    },
    path.join(distDir, "index.html"),
  );

  console.log("Generating File Viewer");
  fs.mkdirSync(path.join(distDir, "viewer"));
  await saveTemplate(
    path.join(templatesDir, "viewer.ejs"),
    {
      title: "File Viewer",
    },
    path.join(distDir, "viewer", "index.html"),
  );

  console.log("Copying assets to dist");
  fs.cpSync(path.resolve("assets"), path.join(distDir, "assets"), {
    recursive: true,
    force: true,
  });

  console.log("Compiling Scripts");
  compile(clientScriptDir, path.join(distDir, "assets"));
})();
