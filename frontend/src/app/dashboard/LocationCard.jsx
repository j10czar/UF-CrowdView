"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const FALLBACK_BUSYNESS = 5;

export default function LocationCard({
  locationId,
  name,
  imageSrc,
  initialBusyness = null,
}) {
  const [busynessScore, setBusynessScore] = useState(initialBusyness);

  useEffect(() => {
    if (busynessScore !== null || !locationId) {
      return;
    }

    let isMounted = true;

    async function fetchBusyness() {
      try {
        // TODO: replace with real API call once endpoint is ready.
        // const response = await fetch(`/api/locations/${locationId}/busyness`);
        // const { busyness } = await response.json();
        const busyness = FALLBACK_BUSYNESS;

        if (isMounted) {
          setBusynessScore(busyness);
        }
      } catch (error) {
        if (isMounted) {
          setBusynessScore(null);
        }
        console.error("Failed to load busyness score", error);
      }
    }

    fetchBusyness();

    return () => {
      isMounted = false;
    };
  }, [busynessScore, locationId]);

  return (
    <div className="bg-white w-72 overflow-hidden rounded-2xl shadow-lg">
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
            {busynessScore !== null
              ? `Busyness: ${busynessScore}/10`
              : "Loading..."}
          </span>
        </div>
        <div className="h-24 rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}
