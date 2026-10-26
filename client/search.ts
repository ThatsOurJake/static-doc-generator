(() => {
  interface SearchEntry {
    t: string;
    p: string;
    k: "folder" | "file";
    c: string;
    n?: string;
  }

  interface IndexedEntry extends SearchEntry {
    haystack: string;
  }

  const MAX_RESULTS = 12;

  const input = document.getElementById("site-search") as HTMLInputElement | null;
  const list = document.getElementById("search-results");

  if (!input || !list) {
    return;
  }

  let entries: IndexedEntry[] | null = null;
  let loading: Promise<void> | null = null;
  let results: IndexedEntry[] = [];
  let activeIndex = -1;

  const loadIndex = () => {
    loading ??= fetch("/assets/search-index.json")
      .then((response) => response.json() as Promise<SearchEntry[]>)
      .then((data) => {
        entries = data.map((entry) => ({
          ...entry,
          haystack: `${entry.t} ${entry.n ?? ""} ${entry.c}`.toLowerCase(),
        }));
      })
      .catch((error) => {
        console.error(error);
        loading = null;
      });

    return loading;
  };

  const close = () => {
    list.hidden = true;
    input.setAttribute("aria-expanded", "false");
    activeIndex = -1;
  };

  const setActive = (index: number) => {
    activeIndex = index;
    Array.from(list.children).forEach((item, i) => {
      item.classList.toggle("is-active", i === index);
      if (i === index) {
        item.scrollIntoView({ block: "nearest" });
      }
    });
  };

  const render = (query: string) => {
    list.replaceChildren();

    if (results.length === 0) {
      const empty = document.createElement("li");
      empty.className = "search-empty";
      empty.textContent = `No results for "${query}"`;
      list.append(empty);
    }

    results.forEach((entry) => {
      const item = document.createElement("li");
      item.setAttribute("role", "option");

      const link = document.createElement("a");
      link.href = entry.k === "folder" ? `${entry.p}/` : entry.p;

      const title = document.createElement("span");
      title.className = "search-result-title";
      title.textContent = `${entry.k === "folder" ? "📁" : "📄"} ${entry.t}`;

      const context = document.createElement("span");
      context.className = "search-result-context";
      context.textContent = entry.c || "Top level";

      link.append(title, context);
      item.append(link);
      list.append(item);
    });

    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
    setActive(results.length > 0 ? 0 : -1);
  };

  const search = async () => {
    const query = input.value.trim().toLowerCase();

    if (!query) {
      return close();
    }

    await loadIndex();

    // Input may have changed while the index was loading
    if (!entries || input.value.trim().toLowerCase() !== query) {
      return;
    }

    const terms = query.split(/\s+/);
    results = entries
      .filter((entry) => terms.every((term) => entry.haystack.includes(term)))
      .map((entry) => {
        // Title matches rank above context-only matches, folders above files
        const title = entry.t.toLowerCase();
        const score =
          (title.startsWith(query) ? 0 : title.includes(query) ? 1 : 2) * 2 +
          (entry.k === "folder" ? 0 : 1);
        return { entry, score };
      })
      .sort((a, b) => a.score - b.score)
      .slice(0, MAX_RESULTS)
      .map((x) => x.entry);

    render(query);
  };

  input.addEventListener("focus", () => void loadIndex());
  input.addEventListener("input", () => void search());

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();

      if (results.length > 0) {
        const step = event.key === "ArrowDown" ? 1 : -1;
        setActive((activeIndex + step + results.length) % results.length);
      }
    } else if (event.key === "Enter") {
      const link = list.children[activeIndex]?.querySelector("a");

      if (link) {
        event.preventDefault();
        window.location.href = link.href;
      }
    } else if (event.key === "Escape") {
      close();
      input.blur();
    }
  });

  document.addEventListener("click", (event) => {
    if (!(event.target as HTMLElement).closest("#search")) {
      close();
    }
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target as HTMLElement;
    const typing = target.matches("input, textarea, select, [contenteditable]");

    if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      input.focus();
      input.select();
    }
  });
})();
