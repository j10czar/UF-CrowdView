"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import LocationGraph from "./LocationGraph";

const HOURS_IN_DAY = 24;
const FALLBACK_BUSYNESS = 5;
const DUMMY_HOURLY_TEMPLATE = [
  3, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 4,
];

function generateFallbackSeries(baseScore = FALLBACK_BUSYNESS) {
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

  const fallbackCurrentHourIndex = Math.max(6, fallbackSeries.length - 7);

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
        const resolvedCurrentHourIndex = Math.max(6, series.length - 7);

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
    <div className="w-72 overflow-hidden rounded-2xl bg-white shadow-lg">
      <div className="relative h-40 w-full">
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes="288px"
          className="object-cover"
          priority
        />
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <span className="text-sm font-medium text-gray-700">
            {latestBusyness !== null
              ? `Busyness: ${latestBusyness}/10`
              : "Loading..."}
          </span>
        </div>
        <LocationGraph
          hourlyBusyness={hourlyBusyness}
          currentHourIndex={currentHourIndex}
        />
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-blue-500" />
            Past hours
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-gray-400" />
            Upcoming hours
          </span>
        </div>
      </div>
    </div>
  );
}
