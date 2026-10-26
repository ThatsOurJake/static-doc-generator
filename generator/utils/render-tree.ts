import type { NavNode } from "./build-site";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// activePath is null for pages that don't live in the tree (e.g. the viewer)
const renderTree = (nodes: NavNode[], activePath: string | null): string => {
  if (nodes.length === 0) {
    return "";
  }

  const items = nodes.map((node) => {
    const isActive = node.path === activePath;
    const isOpen =
      activePath !== null &&
      (isActive || activePath.startsWith(`${node.path}/`));
    const hasChildren = node.children.length > 0;
    const name = escapeHtml(node.name);

    const classes = ["tree-item"];
    if (isActive) classes.push("is-active");
    if (isOpen) classes.push("is-open");

    const toggle = hasChildren
      ? `<button type="button" class="tree-toggle" aria-label="Toggle ${name}" aria-expanded="${isOpen}"></button>`
      : `<span class="tree-spacer"></span>`;

    return `<li class="${classes.join(" ")}" data-path="${escapeHtml(node.path)}"><div class="tree-row">${toggle}<a class="tree-link" href="${escapeHtml(node.path)}/"${isActive ? ' aria-current="page"' : ""}>${name}</a></div>${hasChildren ? renderTree(node.children, activePath) : ""}</li>`;
  });

  return `<ul class="tree-children">${items.join("")}</ul>`;
};

export default renderTree;
