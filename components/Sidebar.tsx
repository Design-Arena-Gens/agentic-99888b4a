'use client';

import { useMemo, useRef, useState } from "react";
import useSWR from "swr";
import clsx from "clsx";
import type {
  MediaType,
  SearchResult,
  WatchCategory,
  WatchItem
} from "../lib/types";

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Search failed");
      }
      return res.json();
    })
    .then((payload) => payload.results as SearchResult[]);

type SidebarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onSelectSearchResult: (result: SearchResult) => void;
  onManualAdd: (item: {
    title: string;
    type: MediaType;
    poster?: string;
    year?: string;
    category: WatchCategory;
  }) => void;
  onExport: () => void;
  onImport: (items: WatchItem[]) => void;
  globalTypeFilter: "all" | "movie" | "tv";
  onGlobalTypeFilterChange: (value: "all" | "movie" | "tv") => void;
  compactMode: boolean;
  onCompactModeChange: (value: boolean) => void;
  highlightTopRated: boolean;
  onHighlightToggle: (value: boolean) => void;
};

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  onSelectSearchResult,
  onManualAdd,
  onExport,
  onImport,
  globalTypeFilter,
  onGlobalTypeFilterChange,
  compactMode,
  onCompactModeChange,
  highlightTopRated,
  onHighlightToggle
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualPoster, setManualPoster] = useState("");
  const [manualType, setManualType] = useState<MediaType>("movie");
  const [manualYear, setManualYear] = useState("");
  const [manualCategory, setManualCategory] =
    useState<WatchCategory>("planning");
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const shouldSearch = searchTerm.trim().length > 1;
  const { data: results, isLoading } = useSWR<SearchResult[]>(
    shouldSearch ? `/api/search?q=${encodeURIComponent(searchTerm.trim())}` : null,
    fetcher,
    {
      revalidateOnFocus: false
    }
  );

  const searchContent = useMemo(() => {
    if (!shouldSearch) {
      return null;
    }
    if (isLoading) {
      return (
        <div className="mt-3 text-xs uppercase tracking-[0.2em] text-neutral-400 fade-enter">
          searching…
        </div>
      );
    }
    const trimmedResults = results ?? [];
    if (trimmedResults.length === 0) {
      return (
        <div className="mt-3 text-xs uppercase tracking-[0.2em] text-neutral-500 fade-enter">
          no matches
        </div>
      );
    }
    return (
      <ul className="mt-3 flex flex-col gap-2">
        {trimmedResults.map((item) => (
          <li key={item.id}>
            <button
              className="relative flex w-full items-center gap-3 rounded-2xl border border-transparent bg-white/5 px-3 py-2 text-left text-sm transition hover:border-white/20 hover:bg-white/10"
              onClick={() => {
                onSelectSearchResult(item);
                setSearchTerm("");
              }}
            >
              <div className="flex h-10 w-7 items-center justify-center overflow-hidden rounded-lg bg-white/10">
                {item.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-[10px] uppercase tracking-wide text-white/60">
                    {item.type}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{item.title}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">
                  {item.type === "movie" ? "Movie" : "TV"}{" "}
                  {item.year ? `• ${item.year}` : ""}
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                add
              </span>
            </button>
          </li>
        ))}
      </ul>
    );
  }, [results, shouldSearch, isLoading, onSelectSearchResult]);

  return (
    <aside
      className={clsx(
        "relative flex flex-col glass-panel sidebar-transition h-full overflow-hidden",
        collapsed ? "w-[88px]" : "w-[360px]"
      )}
    >
      <button
        type="button"
        onClick={onToggleCollapsed}
        className={clsx(
          "absolute top-5 -right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-glass-border bg-white/10 backdrop-blur-xl transition hover:bg-white/20",
          "shadow-lg"
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className={clsx(
            "h-5 w-5 transition-transform",
            collapsed ? "rotate-180" : "rotate-0"
          )}
        >
          <path d="M8 5l8 7-8 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="space-y-8">
          <div>
            <header className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-xs uppercase tracking-[0.3em] text-white/60">
                WL
              </span>
              {!collapsed && (
                <div>
                  <h1 className="text-lg font-semibold uppercase tracking-[0.4em] text-white/70">
                    Watchlist
                  </h1>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/40">
                    curate stories
                  </p>
                </div>
              )}
            </header>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.4em] text-white/40">
              search
            </label>
            <div className="mt-3">
              <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 px-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="mr-2 h-4 w-4 text-white/40"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-4.35-4.35m.85-3.65a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
                  />
                </svg>
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="title or talent"
                  className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-white/30"
                />
              </div>
              {!collapsed && searchContent}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.4em] text-white/40">
              manual
            </div>
            <div className="mt-3 space-y-3">
              <input
                value={manualTitle}
                onChange={(event) => setManualTitle(event.target.value)}
                placeholder="title"
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-3 text-sm placeholder:text-white/30 focus:border-white/30 focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setManualType("movie")}
                  className={clsx(
                    "rounded-2xl border px-3 py-2 text-xs uppercase tracking-[0.2em] transition",
                    manualType === "movie"
                      ? "border-white/50 bg-white/10"
                      : "border-white/15 bg-white/5 text-white/40"
                  )}
                >
                  movie
                </button>
                <button
                  type="button"
                  onClick={() => setManualType("tv")}
                  className={clsx(
                    "rounded-2xl border px-3 py-2 text-xs uppercase tracking-[0.2em] transition",
                    manualType === "tv"
                      ? "border-white/50 bg-white/10"
                      : "border-white/15 bg-white/5 text-white/40"
                  )}
                >
                  tv
                </button>
              </div>
              <input
                value={manualPoster}
                onChange={(event) => setManualPoster(event.target.value)}
                placeholder="poster url"
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-3 text-sm placeholder:text-white/30 focus:border-white/30 focus:outline-none"
              />
              <input
                value={manualYear}
                onChange={(event) => setManualYear(event.target.value)}
                placeholder="year"
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-3 text-sm placeholder:text-white/30 focus:border-white/30 focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["currentlyWatching", "now"],
                    ["planning", "next"],
                    ["watched", "done"],
                    ["dropped", "skip"]
                  ] as Array<[WatchCategory, string]>
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setManualCategory(value)}
                    className={clsx(
                      "rounded-2xl border px-3 py-2 text-xs uppercase tracking-[0.2em] transition",
                      manualCategory === value
                        ? "border-white/50 bg-white/10"
                        : "border-white/15 bg-white/5 text-white/40"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!manualTitle.trim()) {
                    return;
                  }
                  onManualAdd({
                    title: manualTitle.trim(),
                    type: manualType,
                    poster: manualPoster.trim() || undefined,
                    year: manualYear.trim() || undefined,
                    category: manualCategory
                  });
                  setManualTitle("");
                  setManualPoster("");
                  setManualYear("");
                  setManualType("movie");
                  setManualCategory("planning");
                }}
                className="w-full rounded-2xl border border-white/20 bg-white/10 py-3 text-sm uppercase tracking-[0.3em] transition hover:border-white/40 hover:bg-white/20"
              >
                add
              </button>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.4em] text-white/40">
              focus
            </div>
            <div className="mt-3 flex gap-2">
              {(["all", "movie", "tv"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onGlobalTypeFilterChange(value)}
                  className={clsx(
                    "flex-1 rounded-2xl border px-3 py-2 text-xs uppercase tracking-[0.2em] transition",
                    globalTypeFilter === value
                      ? "border-white/50 bg-white/10"
                      : "border-white/15 bg-white/5 text-white/40"
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <label className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white/60">
                compact grid
                <Switch
                  checked={compactMode}
                  onChange={onCompactModeChange}
                />
              </label>
              <label className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white/60">
                celebrate 8+
                <Switch
                  checked={highlightTopRated}
                  onChange={onHighlightToggle}
                />
              </label>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.4em] text-white/40">
              backup
            </div>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={onExport}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 text-xs uppercase tracking-[0.3em] transition hover:border-white/40 hover:bg-white/20"
              >
                <ArrowOutIcon />
                export
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportError("");
                  fileInputRef.current?.click();
                }}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 text-xs uppercase tracking-[0.3em] transition hover:border-white/40 hover:bg-white/20"
              >
                <ArrowInIcon />
                import
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                hidden
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  try {
                    const text = await file.text();
                    const parsed = JSON.parse(text) as WatchItem[];
                    if (!Array.isArray(parsed)) {
                      throw new Error("Invalid format");
                    }
                    onImport(parsed);
                    setImportError("");
                  } catch (error) {
                    console.error(error);
                    setImportError("import failed");
                  } finally {
                    event.target.value = "";
                  }
                }}
              />
            </div>
            {importError && (
              <div className="mt-2 text-[10px] uppercase tracking-[0.3em] text-red-300">
                {importError}
              </div>
            )}
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.4em] text-white/40">
              settings
            </div>
            <div className="mt-3 space-y-3 text-xs text-white/40">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="uppercase tracking-[0.3em] text-white/50">
                  sync soon
                </div>
                <div className="mt-2 text-[11px] leading-relaxed text-white/50">
                  offline first. auto sync coming next release.
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="uppercase tracking-[0.3em] text-white/50">
                  keyboard
                </div>
                <div className="mt-2 text-[11px] leading-relaxed text-white/50">
                  shift + s toggles search. drag with click or spacebar.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {!collapsed && (
        <footer className="border-t border-white/5 px-6 py-4 text-[10px] uppercase tracking-[0.4em] text-white/30">
          curated by you
        </footer>
      )}
    </aside>
  );
}

type SwitchProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
};

function Switch({ checked, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative h-6 w-11 rounded-full border border-white/20 transition bg-white/10",
        checked ? "bg-white/25" : "bg-white/10"
      )}
    >
      <span
        className={clsx(
          "absolute top-[3px] h-4 w-4 rounded-full bg-white transition-all",
          checked ? "right-[4px]" : "left-[4px]"
        )}
      />
    </button>
  );
}

function ArrowOutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 16V4m0 0 4 4m-4-4-4 4M6 14v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4"
      />
    </svg>
  );
}

function ArrowInIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v12m0 0-4-4m4 4 4-4M18 10V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v4"
      />
    </svg>
  );
}
