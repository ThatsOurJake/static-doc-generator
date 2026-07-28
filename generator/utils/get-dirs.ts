import fs from "node:fs";
import path from "node:path";
import docsIgnore from "./docs-ignore";
import gitIgnore from "./gitignore";

export interface Directory {
  parent: string;
  name: string;
  relativePath: string;
  children: Directory[];
}

const getDirs = (rootDir: string, docsDir: string): Directory[] => {
  const output: Directory[] = [];
  const gitignore = gitIgnore();
  const docsignore = docsIgnore();

  fs.readdirSync(rootDir, { withFileTypes: true })
    .filter((x) => x.isDirectory())
    .filter((x) => !gitignore.includes(x.name))
    .filter((x) => !docsignore.includes(x.name))
    .forEach((x) => {
      const dirLoc = path.join(rootDir, x.name);
      output.push({
        parent: dirLoc,
        name: x.name,
        relativePath: dirLoc.replace(docsDir, ""),
        children: [...getDirs(dirLoc, docsDir)],
      });
    });

  return output;
};

export default getDirs;
