import path from "node:path";

import type { Directory } from "./get-dirs";
import getFiles from "./get-files";
import groupFiles from "./group-files";
import parseDetailsFile from "./parse-details-file";

export interface NavNode {
  name: string;
  description?: string | undefined;
  path: string;
  docCount: number;
  children: NavNode[];
}

// Compact keys keep the generated JSON small
export interface SearchEntry {
  t: string;
  p: string;
  k: "folder" | "file";
  c: string;
  n?: string;
}

export interface Site {
  tree: NavNode[];
  nodes: Map<string, NavNode>;
  search: SearchEntry[];
}

const byName = (a: NavNode, b: NavNode) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

const buildSite = (directories: Directory[]): Site => {
  const nodes = new Map<string, NavNode>();
  const search: SearchEntry[] = [];

  const build = (dirs: Directory[], ancestors: string[]): NavNode[] =>
    dirs
      .map((directory) => {
        const details = parseDetailsFile(directory.parent);
        const name = details?.name || directory.name;
        const context = ancestors.join(" / ");
        const groups = groupFiles(getFiles(directory.parent));

        const node: NavNode = {
          name,
          description: details?.description,
          path: directory.relativePath,
          docCount: groups.length,
          children: [],
        };

        nodes.set(node.path, node);
        search.push({ t: name, p: node.path, k: "folder", c: context });

        const fileContext = [...ancestors, name].join(" / ");
        groups.forEach((group) => {
          const entry: SearchEntry = {
            t: group.title,
            p: `/viewer?file=${encodeURIComponent(path.join(node.path, group.primary.name))}`,
            k: "file",
            c: fileContext,
          };

          if (group.title !== group.key) {
            entry.n = group.key;
          }

          search.push(entry);
        });

        node.children = build(directory.children, [...ancestors, name]);

        return node;
      })
      .sort(byName);

  return { tree: build(directories, []), nodes, search };
};

export default buildSite;
