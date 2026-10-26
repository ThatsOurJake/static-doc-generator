(() => {
  const input = document.getElementById("file-filter-input") as HTMLInputElement | null;
  const chips = document.getElementById("file-filter-chips");
  const rows = Array.from(document.querySelectorAll<HTMLElement>(".file-row"));
  const empty = document.getElementById("file-empty");

  if (!input) {
    return;
  }

  let activeFormat = "";

  const applyFilter = () => {
    const query = input.value.trim().toLowerCase();
    let visible = 0;

    rows.forEach((row) => {
      const matchesText = !query || (row.dataset.search ?? "").includes(query);
      const matchesFormat =
        !activeFormat || (row.dataset.formats ?? "").split(" ").includes(activeFormat);
      const show = matchesText && matchesFormat;

      row.hidden = !show;
      if (show) {
        visible++;
      }
    });

    if (empty) {
      empty.hidden = visible > 0;
    }
  };

  input.addEventListener("input", applyFilter);

  chips?.addEventListener("click", (event) => {
    const chip = (event.target as HTMLElement).closest<HTMLElement>(".file-chip");

    if (!chip) {
      return;
    }

    activeFormat = chip.dataset.format ?? "";
    chips
      .querySelectorAll(".file-chip")
      .forEach((x) => x.classList.toggle("file-chip-active", x === chip));
    applyFilter();
  });
})();
