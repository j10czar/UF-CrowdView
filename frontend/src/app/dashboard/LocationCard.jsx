"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import LocationGraph from "./LocationGraph";
import { DUMMY_HOURLY_TEMPLATE } from "@/lib/busyness";

const HOURS_IN_DAY = 24;
const FALLBACK_BUSYNESS = 5;
function getCurrentUtcHourIndex(seriesLength) {
  if (!Number.isFinite(seriesLength) || seriesLength <= 0) {
    return null;
  }

  const utcHour = new Date().getUTCHours();
 
  if (!Number.isFinite(utcHour)) {
    return null;
  }

  const normalizedLength = Math.max(1, Math.floor(seriesLength));
  const normalizedHour = ((Math.floor(utcHour) % normalizedLength) + normalizedLength) % normalizedLength;

  return normalizedHour;
}

function generateFallbackSeries(baseScore = FALLBACK_BUSYNESS) {
  // Take the seed score from the card props and fan it out across the 24-hour template so the graph has something realistic-ish to render before live data arrives.
  const delta = (baseScore ?? FALLBACK_BUSYNESS) - FALLBACK_BUSYNESS;

  return DUMMY_HOURLY_TEMPLATE.map((value) => {
    const adjusted = Math.round(value + delta);
    return Math.min(10, Math.max(1, adjusted));
  });
}

export default function LocationCard({
  locationId,
  name,
  imageSrc,
  initialBusyness = null,
}) {
  const fallbackSeries = useMemo(
    () => generateFallbackSeries(initialBusyness ?? FALLBACK_BUSYNESS),
    [initialBusyness],
  );

  const fallbackCurrentHourIndex = useMemo(
    () => getCurrentUtcHourIndex(fallbackSeries.length),
    [fallbackSeries.length],
  );

  const [hourlyBusyness, setHourlyBusyness] = useState(fallbackSeries);
  const [currentHourIndex, setCurrentHourIndex] = useState(
    fallbackCurrentHourIndex,
  );

  useEffect(() => {
    setHourlyBusyness(fallbackSeries);
    setCurrentHourIndex(fallbackCurrentHourIndex);
  }, [fallbackCurrentHourIndex, fallbackSeries, locationId]);

  useEffect(() => {
    if (!locationId) {
      return;
    }

    let isMounted = true;

    async function fetchBusyness() {
      try {
        // TODO: replace with real API call once endpoint is ready.
        // const response = await fetch(`/api/locations/${locationId}/busyness`);
        // const { hourlyBusyness: series } = await response.json();
        const series = fallbackSeries;
        const resolvedCurrentHourIndex = getCurrentUtcHourIndex(series.length);

        if (isMounted) {
          setHourlyBusyness(series);
          setCurrentHourIndex(resolvedCurrentHourIndex);
        }
      } catch (error) {
        if (isMounted) {
          setHourlyBusyness(Array(HOURS_IN_DAY).fill(-1));
          setCurrentHourIndex(null);
        }
        console.error("Failed to load busyness data", error);
      }
    }

    fetchBusyness();

    return () => {
      isMounted = false;
    };
  }, [fallbackSeries, locationId]);

  const latestBusyness = useMemo(() => {
    if (
      !Array.isArray(hourlyBusyness) ||
      typeof currentHourIndex !== "number"
    ) {
      return null;
    }

    const safeIndex = Math.max(
      0,
      Math.min(hourlyBusyness.length - 1, Math.floor(currentHourIndex)),
    );
    const value = hourlyBusyness[safeIndex];

    return typeof value === "number" && value !== -1 ? value : null;
  }, [hourlyBusyness, currentHourIndex]);

  return (
    <div className="w-72 overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-slate-50 shadow-2xl backdrop-blur">
      <div className="relative h-40 w-full">
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes="288px"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{name}</h3>
          <span className="text-sm font-medium text-slate-200">
            {latestBusyness !== null
              ? `Busyness: ${latestBusyness}/10`
              : "Loading..."}
          </span>
        </div>
        <LocationGraph
          hourlyBusyness={hourlyBusyness}
          currentHourIndex={currentHourIndex}
        />
        <div className="flex items-center justify-center gap-4 text-xs text-slate-300">
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-blue-400" />
            Past hours
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-blue-500" />
            Current hour
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-slate-400" />
            Upcoming hours
          </span>
        </div>
      </div>
    </div>
  );
}
