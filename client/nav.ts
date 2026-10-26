(() => {
  const sidebar = document.getElementById("sidebar");
  const toggleButton = document.getElementById("nav-toggle");
  const backdrop = document.getElementById("nav-backdrop");

  const setNavOpen = (open: boolean) => {
    document.body.classList.toggle("nav-open", open);
    toggleButton?.setAttribute("aria-expanded", String(open));
  };

  toggleButton?.addEventListener("click", () =>
    setNavOpen(!document.body.classList.contains("nav-open")),
  );
  backdrop?.addEventListener("click", () => setNavOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setNavOpen(false);
    }
  });

  const setExpanded = (item: Element, expanded: boolean) => {
    item.classList.toggle("is-open", expanded);
    item
      .querySelector(":scope > .tree-row > .tree-toggle")
      ?.setAttribute("aria-expanded", String(expanded));
  };

  sidebar?.addEventListener("click", (event) => {
    const toggle = (event.target as HTMLElement).closest(".tree-toggle");
    const item = toggle?.closest(".tree-item");

    if (item) {
      setExpanded(item, !item.classList.contains("is-open"));
    }
  });

  const treeItems = Array.from(
    document.querySelectorAll<HTMLElement>(".tree-item"),
  );
  const findItem = (dirPath: string) =>
    treeItems.find((item) => item.dataset.path === dirPath) ?? null;

  const revealItem = (item: HTMLElement) => {
    item.classList.add("is-active");
    item.querySelector(":scope > .tree-row > .tree-link")?.setAttribute("aria-current", "page");

    for (
      let parent = item.parentElement?.closest(".tree-item");
      parent;
      parent = parent.parentElement?.closest(".tree-item")
    ) {
      setExpanded(parent, true);
    }

    setExpanded(item, true);
    item.scrollIntoView({ block: "nearest" });
  };

  const activeItem = sidebar?.querySelector<HTMLElement>(".tree-item.is-active");
  activeItem?.scrollIntoView({ block: "nearest" });

  if (document.body.dataset.page !== "viewer") {
    return;
  }

  const file = new URLSearchParams(window.location.search).get("file");

  if (!file) {
    return;
  }

  const segments = file.split("/").filter(Boolean);
  const fileName = segments[segments.length - 1] ?? file;
  const dirPath = `/${segments.slice(0, -1).join("/")}`;
  const dirItem = findItem(dirPath);

  const crumbs: { name: string; path: string }[] = [];
  for (
    let item: Element | null | undefined = dirItem;
    item;
    item = item.parentElement?.closest(".tree-item")
  ) {
    const link = item.querySelector<HTMLAnchorElement>(":scope > .tree-row > .tree-link");
    crumbs.unshift({
      name: link?.textContent ?? "",
      path: (item as HTMLElement).dataset.path ?? "",
    });
  }

  if (dirItem) {
    revealItem(dirItem);
  }

  const crumbContainer = document.getElementById("viewer-crumbs");
  if (crumbContainer) {
    const home = document.createElement("a");
    home.href = "/";
    home.textContent = "Home";
    crumbContainer.append(home);

    const addSeparator = () => {
      const separator = document.createElement("span");
      separator.className = "breadcrumb-separator";
      separator.textContent = "/";
      crumbContainer.append(separator);
    };

    crumbs.forEach((crumb) => {
      addSeparator();
      const link = document.createElement("a");
      link.href = `${crumb.path}/`;
      link.textContent = crumb.name;
      crumbContainer.append(link);
    });

    addSeparator();
    const current = document.createElement("span");
    current.className = "breadcrumb-current";
    current.textContent = fileName;
    crumbContainer.append(current);
  }

  const title = document.getElementById("viewer-title");
  if (title) {
    title.textContent = fileName;
  }

  const back = document.getElementById("viewer-back") as HTMLAnchorElement | null;
  if (back && dirItem) {
    back.href = `${dirPath}/`;
    back.hidden = false;
  }

  const download = document.getElementById("viewer-download") as HTMLAnchorElement | null;
  if (download) {
    download.href = file;
    download.download = fileName;
    download.hidden = false;
  }
})();
