'use client';

import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import clsx from "clsx";
import type { WatchItem } from "../lib/types";

type WatchCardProps = {
  item: WatchItem;
  onOpen: (item: WatchItem) => void;
  compact: boolean;
  highlightTopRated: boolean;
};

export function WatchCard({
  item,
  onOpen,
  compact,
  highlightTopRated
}: WatchCardProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({
      id: item.id,
      data: { category: item.category }
    });

  const style = useMemo<React.CSSProperties>(
    () => ({
      transform: transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
      transition
    }),
    [transform, transition]
  );

  const encouraged = highlightTopRated && (item.rating ?? 0) >= 8;

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={clsx(
        "relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-3 transition",
        encouraged ? "border-white/50 shadow-[0_0_25px_rgba(255,255,255,0.18)]" : "",
        isDragging ? "z-20 scale-105 border-white/40 bg-white/10" : "",
        compact ? "gap-2" : "gap-4"
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="group relative overflow-hidden rounded-2xl"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            item.poster ||
            "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=400&q=80"
          }
          alt={item.title}
          className={clsx(
            "h-[200px] w-full object-cover transition duration-500",
            compact ? "h-[180px]" : "h-[220px]",
            "group-hover:scale-[1.04]"
          )}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-black/20 opacity-0 transition group-hover:opacity-100" />
      </button>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white/90">{item.title}</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
              {item.type === "movie" ? "movie" : "tv"}{" "}
              {item.year ? `• ${item.year}` : ""}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              {...listeners}
              {...attributes}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/50 transition hover:border-white/30 hover:text-white/90"
              aria-label="Drag handle"
            >
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
                  d="M10 4H6m0 0v4m0-4 4 4m4-4h4m0 0v4m0-4-4 4m4 8h-4m0 0v4m0-4 4 4M6 14h4m0 0v4m0-4-4 4"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-[11px] leading-relaxed text-white/50 line-clamp-3">
          {item.notes ? item.notes : "notes waiting"}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
            score
          </div>
          <div className="flex items-center gap-1">
            <span className="rounded-full bg-white/10 px-2 py-[2px] text-xs tracking-[0.2em] text-white/70">
              {item.rating ?? "—"}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
