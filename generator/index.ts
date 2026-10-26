import fs from "node:fs";
import path from "node:path";

import compile from "./compiler";
import buildSite from "./utils/build-site";
import getDirs, { type Directory } from "./utils/get-dirs";
import getNotifications from "./utils/get-notifications";
import renderPage from "./utils/render-page";
import renderTree from "./utils/render-tree";
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

  const site = buildSite(directories);

  // Generate each page
  const generatePages = async (dirs: Directory[]) => {
    for (let i = 0; i < dirs.length; i++) {
      const directory = dirs[i];

      if (!directory) {
        continue;
      }

      await renderPage(directory, distDir, templatesDir, site);

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
      navTree: renderTree(site.tree, null),
      sections: site.tree,
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
      navTree: renderTree(site.tree, null),
    },
    path.join(distDir, "viewer", "index.html"),
  );

  console.log("Copying assets to dist");
  fs.cpSync(path.resolve("assets"), path.join(distDir, "assets"), {
    recursive: true,
    force: true,
  });

  console.log("Writing Search Index");
  fs.writeFileSync(
    path.join(distDir, "assets", "search-index.json"),
    JSON.stringify(site.search),
  );

  console.log("Compiling Scripts");
  compile(clientScriptDir, path.join(distDir, "assets"));
})();
