import { NextResponse } from "next/server";
import type { SearchResult } from "../../../lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] satisfies SearchResult[] });
  }

  const trimmed = query.trim();

  const [itunesResult, tvResult] = await Promise.allSettled([
    fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(
        trimmed
      )}&media=movie&limit=8`,
      {
        headers: {
          "Content-Type": "application/json"
        },
        next: { revalidate: 60 }
      }
    ).then(async (response) => {
      if (!response.ok) throw new Error("itunes failed");
      return (await response.json()) as {
        results: Array<{
          trackId: number;
          trackName: string;
          artworkUrl100?: string;
          releaseDate?: string;
        }>;
      };
    }),
    fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(trimmed)}`, {
      headers: {
        "Content-Type": "application/json"
      },
      next: { revalidate: 60 }
    }).then(async (response) => {
      if (!response.ok) throw new Error("tvmaze failed");
      return (await response.json()) as Array<{
        show: {
          id: number;
          name: string;
          image?: { medium?: string; original?: string };
          premiered?: string;
        };
      }>;
    })
  ]);

  const results: SearchResult[] = [];
  if (itunesResult.status === "fulfilled") {
    for (const entry of itunesResult.value.results.slice(0, 8)) {
      results.push({
        id: `itunes-${entry.trackId}`,
        source: "itunes",
        title: entry.trackName,
        year: entry.releaseDate?.slice(0, 4),
        poster: entry.artworkUrl100
          ? entry.artworkUrl100.replace("100x100", "400x600")
          : undefined,
        type: "movie"
      });
    }
  }

  if (tvResult.status === "fulfilled") {
    for (const entry of tvResult.value.slice(0, 8)) {
      const show = entry.show;
      results.push({
        id: `tvmaze-${show.id}`,
        source: "tvmaze",
        title: show.name,
        year: show.premiered?.slice(0, 4),
        poster: show.image?.original || show.image?.medium,
        type: "tv"
      });
    }
  }

  // Deduplicate by title and type to surface diverse results
  const deduped = Array.from(
    new Map(results.map((item) => [`${item.title}-${item.type}`, item])).values()
  ).slice(0, 12);

  return NextResponse.json({ results: deduped });
}
