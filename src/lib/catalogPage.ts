import { filterIndex, PAGE_SIZE, type IndexEntry } from "./catalogIndex";

/**
 * 中文 /merch/ 与日文 /ja/merch/ 共用的图录交互：搜索、筛选、排序、URL 同步、
 * 浏览器前进后退恢复，以及分批显示（首屏 PAGE_SIZE 张，其余按「显示更多」展开）。
 * 卡片仍全部由服务器渲染，未启用 JavaScript 时通过 <noscript> 样式全部显示。
 */
export function initCatalog(opts: {
  locale: string;
  moreLabel: (remaining: number) => string;
}) {
  const data: { products: IndexEntry[] } = JSON.parse(
    document.getElementById("catalog-data")!.textContent!,
  );
  const form = document.getElementById("catalog-form") as HTMLFormElement;
  const grid = document.getElementById("product-grid")!;
  const more = document.getElementById("load-more")!;
  const moreButton = document.getElementById("load-more-button")!;
  const cards = Array.from(grid.children) as HTMLElement[];
  const byId = new Map(cards.map((card) => [card.dataset.productId!, card]));
  let matches: IndexEntry[] = [];
  let limit = PAGE_SIZE;
  let restoring = false;

  function paint() {
    for (const card of cards) card.hidden = true;
    for (const entry of matches.slice(0, limit)) {
      const card = byId.get(entry.id);
      if (!card) continue;
      card.hidden = false;
      grid.appendChild(card);
    }
    const remaining = matches.length - Math.min(limit, matches.length);
    more.hidden = remaining <= 0;
    moreButton.textContent = opts.moreLabel(remaining);
  }

  function render(params: URLSearchParams) {
    matches = filterIndex(data.products, params, opts.locale);
    limit = PAGE_SIZE;
    paint();
    document.getElementById("result-count")!.textContent = String(
      matches.length,
    );
    document.getElementById("no-results")!.hidden = matches.length > 0;
  }

  function restore() {
    restoring = true;
    form.reset();
    const params = new URLSearchParams(location.search);
    for (const control of Array.from(form.elements)) {
      if (control instanceof HTMLInputElement) {
        if (control.type === "checkbox")
          control.checked = params
            .getAll(control.name)
            .includes(control.value);
        else if (control.name) control.value = params.get(control.name) || "";
      }
      if (control instanceof HTMLSelectElement) {
        const value = params.get(control.name) || "added";
        control.value = Array.from(control.options).some(
          (option) => option.value === value,
        )
          ? value
          : "added";
      }
    }
    restoring = false;
    render(params);
  }

  function update() {
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form)) {
      if (
        typeof value === "string" &&
        value &&
        !(key === "sort" && value === "added")
      )
        params.append(key, value);
    }
    const next =
      location.pathname + (params.size ? "?" + params.toString() : "");
    if (next !== location.pathname + location.search)
      history.pushState({}, "", next);
    render(params);
  }

  moreButton.addEventListener("click", () => {
    limit += PAGE_SIZE;
    paint();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    update();
  });
  form.addEventListener("change", (event) => {
    const control = event.target;
    if (
      control instanceof HTMLSelectElement ||
      (control instanceof HTMLInputElement && control.type === "checkbox")
    )
      update();
  });
  form.addEventListener("reset", () => {
    if (!restoring) setTimeout(update, 0);
  });
  window.addEventListener("popstate", restore);
  restore();
  if (matchMedia("(max-width: 700px)").matches)
    (document.getElementById("filter-details") as HTMLDetailsElement).open =
      false;
}
