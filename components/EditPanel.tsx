'use client';

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import type { MediaType, WatchItem } from "../lib/types";

type EditPanelProps = {
  item: WatchItem | null;
  onClose: () => void;
  onUpdate: (item: WatchItem) => void;
  onDelete: (id: string) => void;
};

export function EditPanel({ item, onClose, onUpdate, onDelete }: EditPanelProps) {
  const [title, setTitle] = useState("");
  const [poster, setPoster] = useState("");
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [type, setType] = useState<MediaType>("movie");
  const [year, setYear] = useState("");

  useEffect(() => {
    if (!item) return;
    setTitle(item.title);
    setPoster(item.poster || "");
    setNotes(item.notes);
    setRating(item.rating);
    setType(item.type);
    setYear(item.year || "");
  }, [item]);

  const open = Boolean(item);

  const previewPoster = useMemo(() => {
    if (poster.trim()) return poster.trim();
    return (
      item?.poster ||
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80"
    );
  }, [poster, item]);

  if (!open || !item) {
    return null;
  }

  const persist = (overrides?: Partial<WatchItem>) => {
    onUpdate({
      ...item,
      title,
      poster: poster.trim(),
      notes,
      rating,
      type,
      year: year.trim() || undefined,
      ...overrides
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative glass-panel w-[min(720px,96vw)] overflow-hidden border-white/20 bg-white/10 p-8 animate-[fadeEnter_220ms_ease-out]">
        <button
          type="button"
          onClick={() => {
            persist();
            onClose();
          }}
          className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/60 transition hover:border-white/40 hover:bg-white/20 hover:text-white"
          aria-label="Close"
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
              d="M6 6l12 12M18 6 6 18"
            />
          </svg>
        </button>
        <div className="grid gap-6 md:grid-cols-[240px,1fr]">
          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-3xl border border-white/20 bg-black/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPoster}
                alt={title || "poster preview"}
                className="h-[320px] w-full object-cover"
              />
            </div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
              update poster url
            </div>
            <input
              value={poster}
              onChange={(event) => setPoster(event.target.value)}
              placeholder="https://"
              className="rounded-2xl border border-white/15 bg-white/5 px-3 py-3 text-sm placeholder:text-white/30 focus:border-white/30 focus:outline-none"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setType("movie")}
                className={clsx(
                  "flex-1 rounded-2xl border px-3 py-2 text-xs uppercase tracking-[0.2em] transition",
                  type === "movie"
                    ? "border-white/50 bg-white/10"
                    : "border-white/15 bg-white/5 text-white/40"
                )}
              >
                movie
              </button>
              <button
                type="button"
                onClick={() => setType("tv")}
                className={clsx(
                  "flex-1 rounded-2xl border px-3 py-2 text-xs uppercase tracking-[0.2em] transition",
                  type === "tv"
                    ? "border-white/50 bg-white/10"
                    : "border-white/15 bg-white/5 text-white/40"
                )}
              >
                tv
              </button>
            </div>
            <input
              value={year}
              onChange={(event) => setYear(event.target.value)}
              placeholder="year"
              className="rounded-2xl border border-white/15 bg-white/5 px-3 py-3 text-sm placeholder:text-white/30 focus:border-white/30 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                persist();
                onDelete(item.id);
                onClose();
              }}
              className="rounded-2xl border border-red-400/40 bg-red-500/10 py-3 text-sm uppercase tracking-[0.3em] text-red-200 transition hover:border-red-400/80 hover:bg-red-500/20"
            >
              delete item
            </button>
          </div>
          <div className="flex flex-col gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                title
              </div>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-base font-medium text-white focus:border-white/30 focus:outline-none"
              />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                score
              </div>
              <div className="mt-3 grid grid-cols-5 gap-3">
                {Array.from({ length: 10 }).map((_, index) => {
                  const value = index + 1;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setRating(value);
                        persist({ rating: value });
                      }}
                      className={clsx(
                        "rounded-2xl border px-3 py-2 text-sm font-semibold transition",
                        rating === value
                          ? "border-white/80 bg-white/20 text-white"
                          : "border-white/15 bg-white/5 text-white/50 hover:border-white/30 hover:text-white/80"
                      )}
                    >
                      {value}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    setRating(null);
                    persist({ rating: null });
                  }}
                  className={clsx(
                    "col-span-5 rounded-2xl border px-3 py-2 text-xs uppercase tracking-[0.2em] transition",
                    rating === null
                      ? "border-white/80 bg-white/20 text-white"
                      : "border-white/15 bg-white/5 text-white/50 hover:border-white/30 hover:text-white/80"
                  )}
                >
                  unrated
                </button>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                thoughts
              </div>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={6}
                className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm leading-relaxed text-white/80 focus:border-white/30 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  persist();
                  onClose();
                }}
                className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm uppercase tracking-[0.3em] transition hover:border-white/40 hover:bg-white/20"
              >
                close
              </button>
              <button
                type="button"
                onClick={() => {
                  persist();
                  onClose();
                }}
                className="rounded-2xl border border-white/60 bg-white/20 px-5 py-3 text-sm uppercase tracking-[0.3em] text-white transition hover:bg-white/30"
              >
                save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
