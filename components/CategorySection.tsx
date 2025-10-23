'use client';

import { PropsWithChildren } from "react";
import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import type { WatchCategory } from "../lib/types";

type CategorySectionProps = PropsWithChildren<{
  category: WatchCategory;
  title: string;
  filter: "all" | "movie" | "tv";
  onFilterChange: (filter: "all" | "movie" | "tv") => void;
  highlightTopRated: boolean;
}>;

export function CategorySection({
  category,
  title,
  filter,
  onFilterChange,
  children,
  highlightTopRated
}: CategorySectionProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: category
  });

  return (
    <section
      ref={setNodeRef}
      className={clsx(
        "glass-panel flex h-full flex-col overflow-hidden border-white/10 bg-white/5 transition-all",
        isOver ? "border-white/40" : "border-white/20"
      )}
    >
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold uppercase tracking-[0.4em] text-white/80">
            {title}
          </h2>
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/30">
            {highlightTopRated ? "spotlight ≥8" : "curate freely"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["all", "movie", "tv"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onFilterChange(option)}
              className={clsx(
                "rounded-xl border px-3 py-1 text-[11px] uppercase tracking-[0.2em] transition",
                filter === option
                  ? "border-white/50 bg-white/10"
                  : "border-white/15 bg-white/5 text-white/40"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="grid min-h-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {children}
        </div>
      </div>
    </section>
  );
}
