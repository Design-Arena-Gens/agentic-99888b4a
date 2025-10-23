"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCorners
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import clsx from "clsx";
import { Sidebar } from "../components/Sidebar";
import { CategorySection } from "../components/CategorySection";
import { WatchCard } from "../components/WatchCard";
import { EditPanel } from "../components/EditPanel";
import { initialItems } from "../lib/sampleData";
import type {
  MediaType,
  SearchResult,
  WatchCategory,
  WatchItem
} from "../lib/types";

const categoryConfig: Array<{ key: WatchCategory; title: string }> = [
  { key: "currentlyWatching", title: "Currently Watching" },
  { key: "planning", title: "Planning to Watch" },
  { key: "watched", title: "Watched" },
  { key: "dropped", title: "Dropped" }
];

const emptyBoard = (): Record<WatchCategory, WatchItem[]> => ({
  currentlyWatching: [],
  planning: [],
  watched: [],
  dropped: []
});

const initialBoardState = () => {
  const grouped = emptyBoard();
  for (const item of initialItems) {
    grouped[item.category].push(item);
  }
  return grouped;
};

const initialCategoryFilters: Record<WatchCategory, "all" | MediaType> = {
  currentlyWatching: "all",
  planning: "all",
  watched: "all",
  dropped: "all"
};

const createId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `item-${Math.random().toString(36).slice(2, 10)}`;

export default function Page() {
  const [board, setBoard] = useState<Record<WatchCategory, WatchItem[]>>(
    initialBoardState
  );
  const [categoryFilters, setCategoryFilters] = useState<
    Record<WatchCategory, "all" | MediaType>
  >(initialCategoryFilters);
  const [globalTypeFilter, setGlobalTypeFilter] = useState<
    "all" | MediaType
  >("all");
  const [compactMode, setCompactMode] = useState(false);
  const [highlightTopRated, setHighlightTopRated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<WatchItem | null>(null);

  const allItems = useMemo(
    () =>
      categoryConfig.flatMap(({ key }) =>
        board[key].map((item) => ({ ...item, category: key }))
      ),
    [board]
  );

  const findItem = (id: string) =>
    categoryConfig
      .flatMap(({ key }) => board[key])
      .find((item) => item.id === id) || null;

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const active = event.active.id as string;
    const overId = event.over?.id as string | undefined;
    setActiveId(null);
    if (!overId) return;
    if (active === overId) return;

    let fromCategory: WatchCategory | null = null;
    let toCategory: WatchCategory | null = null;
    let fromIndex = -1;

    for (const { key } of categoryConfig) {
      const index = board[key].findIndex((item) => item.id === active);
      if (index !== -1) {
        fromCategory = key;
        fromIndex = index;
        break;
      }
    }

    if (fromCategory === null || fromIndex === -1) return;

    let toIndex = -1;
    const overAsCategory = categoryConfig.some(({ key }) => key === overId);

    if (overAsCategory) {
      toCategory = overId as WatchCategory;
      toIndex = board[toCategory].length;
    } else {
      for (const { key } of categoryConfig) {
        const index = board[key].findIndex((item) => item.id === overId);
        if (index !== -1) {
          toCategory = key;
          toIndex = index;
          break;
        }
      }
    }

    if (!toCategory) {
      toCategory = fromCategory;
      toIndex = board[toCategory].length;
    }

    setBoard((prev) => {
      const updated = { ...prev };
      const sourceList = [...updated[fromCategory!]];
      const [moving] = sourceList.splice(fromIndex, 1);
      if (!moving) return prev;

      const destinationOriginal = updated[toCategory!];
      const destinationList =
        fromCategory === toCategory
          ? [...sourceList]
          : [...destinationOriginal];

      const originalOverIndex = overAsCategory
        ? destinationOriginal.length
        : destinationOriginal.findIndex((item) => item.id === overId);

      let insertIndex =
        originalOverIndex === -1 ? destinationOriginal.length : originalOverIndex;

      if (
        fromCategory === toCategory &&
        originalOverIndex !== -1 &&
        originalOverIndex > fromIndex
      ) {
        insertIndex = Math.max(0, insertIndex - 1);
      }

      destinationList.splice(insertIndex, 0, {
        ...moving,
        category: toCategory!
      });

      updated[fromCategory!] =
        fromCategory === toCategory ? destinationList : sourceList;
      if (fromCategory !== toCategory) {
        updated[toCategory!] = destinationList;
      }

      return updated;
    });
  };

  const handleAddFromSearch = (result: SearchResult) => {
    const item: WatchItem = {
      id: createId(),
      title: result.title,
      type: result.type,
      poster: result.poster || "",
      rating: null,
      notes: "",
      category: "planning",
      year: result.year,
      sourceId: result.id
    };
    setBoard((prev) => ({
      ...prev,
      planning: [item, ...prev.planning]
    }));
  };

  const handleManualAdd = (input: {
    title: string;
    type: MediaType;
    poster?: string;
    year?: string;
    category: WatchCategory;
  }) => {
    const item: WatchItem = {
      id: createId(),
      title: input.title,
      type: input.type,
      poster: input.poster || "",
      rating: null,
      notes: "",
      category: input.category,
      year: input.year
    };
    setBoard((prev) => ({
      ...prev,
      [input.category]: [item, ...prev[input.category]]
    }));
  };

  const handleUpdateItem = (updatedItem: WatchItem) => {
    setBoard((prev) => {
      const updated = { ...prev };
      const list = [...updated[updatedItem.category]];
      const index = list.findIndex((entry) => entry.id === updatedItem.id);
      if (index === -1) return prev;
      list[index] = { ...updatedItem };
      updated[updatedItem.category] = list;
      return updated;
    });
    setEditingItem(updatedItem);
  };

  const handleDeleteItem = (id: string) => {
    setBoard((prev) => {
      const updated = { ...prev };
      for (const { key } of categoryConfig) {
        const list = updated[key];
        const index = list.findIndex((item) => item.id === id);
        if (index !== -1) {
          const nextList = [...list];
          nextList.splice(index, 1);
          updated[key] = nextList;
          break;
        }
      }
      return updated;
    });
  };

  const handleImport = (items: WatchItem[]) => {
    const nextBoard = emptyBoard();
    for (const item of items) {
      const category: WatchCategory = categoryConfig.some(
        ({ key }) => key === item.category
      )
        ? item.category
        : "planning";
      nextBoard[category].push({
        ...item,
        id: item.id || createId(),
        category
      });
    }
    setBoard(nextBoard);
  };

  const handleExport = () => {
    const payload = JSON.stringify(allItems, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "watchlist.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const filteredBoard = useMemo(() => {
    const globalFilter = globalTypeFilter;
    const result: Record<WatchCategory, WatchItem[]> = emptyBoard();
    for (const { key } of categoryConfig) {
      const categoryFilter = categoryFilters[key];
      result[key] = board[key].filter((item) => {
        const matchesGlobal =
          globalFilter === "all" ? true : item.type === globalFilter;
        const matchesCategory =
          categoryFilter === "all" ? true : item.type === categoryFilter;
        return matchesGlobal && matchesCategory;
      });
    }
    return result;
  }, [board, categoryFilters, globalTypeFilter]);

  return (
    <div
      className={clsx(
        "flex min-h-screen gap-6 px-6 py-8 transition-[padding]",
        sidebarCollapsed ? "pl-4" : "pl-6"
      )}
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
        onSelectSearchResult={handleAddFromSearch}
        onManualAdd={handleManualAdd}
        onExport={handleExport}
        onImport={handleImport}
        globalTypeFilter={globalTypeFilter}
        onGlobalTypeFilterChange={setGlobalTypeFilter}
        compactMode={compactMode}
        onCompactModeChange={setCompactMode}
        highlightTopRated={highlightTopRated}
        onHighlightToggle={setHighlightTopRated}
      />
      <main className="flex-1">
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="grid h-full gap-6 xl:grid-cols-2">
            {categoryConfig.map(({ key, title }) => (
              <SortableContext
                key={key}
                items={filteredBoard[key].map((item) => item.id)}
              >
                <CategorySection
                  category={key}
                  title={title}
                  filter={categoryFilters[key]}
                  onFilterChange={(filter) =>
                    setCategoryFilters((prev) => ({
                      ...prev,
                      [key]: filter
                    }))
                  }
                  highlightTopRated={highlightTopRated}
                >
                  {filteredBoard[key].length === 0 ? (
                    <div className="col-span-full flex min-h-[200px] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 text-xs uppercase tracking-[0.3em] text-white/30">
                      drag here
                    </div>
                  ) : (
                    filteredBoard[key].map((item) => (
                      <WatchCard
                        key={item.id}
                        item={item}
                        onOpen={(selected) => setEditingItem(selected)}
                        compact={compactMode}
                        highlightTopRated={highlightTopRated}
                      />
                    ))
                  )}
                </CategorySection>
              </SortableContext>
            ))}
          </div>
          <DragOverlay>
            {activeId ? (
              <OverlayCard
                item={findItem(activeId)}
                compact={compactMode}
                highlightTopRated={highlightTopRated}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
      <EditPanel
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onUpdate={handleUpdateItem}
        onDelete={(id) => {
          handleDeleteItem(id);
          setEditingItem(null);
        }}
      />
    </div>
  );
}

type OverlayCardProps = {
  item: WatchItem | null;
  compact: boolean;
  highlightTopRated: boolean;
};

function OverlayCard({ item, compact, highlightTopRated }: OverlayCardProps) {
  if (!item) return null;
  return (
    <div className="w-[260px]">
      <div
        className={clsx(
          "relative flex flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-3",
          compact ? "gap-2" : "gap-4",
          highlightTopRated && (item.rating ?? 0) >= 8
            ? "border-white/60 shadow-[0_0_25px_rgba(255,255,255,0.18)]"
            : ""
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            item.poster ||
            "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=400&q=80"
          }
          alt={item.title}
          className={clsx(
            compact ? "h-[180px]" : "h-[220px]",
            "w-full rounded-2xl object-cover"
          )}
        />
        <div className="text-sm font-semibold text-white/90">{item.title}</div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-[11px] leading-relaxed text-white/50 line-clamp-3">
          {item.notes || "notes waiting"}
        </div>
      </div>
    </div>
  );
}
