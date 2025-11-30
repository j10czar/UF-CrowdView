"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import LocationGraph from "./LocationGraph";
import axios from "axios";

export default function LocationCard({ locationId, name, imageSrc, refreshTrigger }) {
  
  const [hourlyBusyness, setHourlyBusyness] = useState(Array(24).fill(0));
  const [loading, setLoading] = useState(true);
  
  const currentHourIndex = new Date().getHours();

  useEffect(() => {
    if (!locationId) return;

    let isMounted = true;

    async function fetchBusyness() {

      try {
        const response = await axios.get(
          `http://localhost:5000/locations/${locationId}`,
          { withCredentials: true }
        );

        if (isMounted && response.data && response.data.busyness) {
          setHourlyBusyness(response.data.busyness);
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to load busyness data for", name, error);
      }
    }

    fetchBusyness();

    return () => {
      isMounted = false;
    };
  // Added refreshTrigger here. Whenever this number changes the fetch runs again.
  }, [locationId, name, refreshTrigger]); 

  const latestBusyness = useMemo(() => {
    if (loading) return null;
    return hourlyBusyness[currentHourIndex];
  }, [hourlyBusyness, currentHourIndex, loading]);

  return (
    <div className="w-72 overflow-hidden rounded-2xl bg-white shadow-lg transition-transform hover:scale-105">
      <div className="relative h-40 w-full">
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes="288px"
          className="object-cover"
          priority
        />
        {!loading && latestBusyness > 7 && (
           <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md animate-pulse">
             BUSY
           </div>
        )}
      </div>
      
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <span className={`text-sm font-medium ${loading ? "text-gray-400" : "text-blue-600"}`}>
            {loading ? "Loading..." : `Busyness: ${latestBusyness}/10`}
          </span>
        </div>
        
        <div className={loading ? "opacity-50 blur-sm transition-all duration-500" : "opacity-100 transition-all duration-500"}>
            <LocationGraph
            hourlyBusyness={hourlyBusyness}
            currentHourIndex={currentHourIndex}
            />
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-blue-500" />
            Past
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-blue-600" />
            Now
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-gray-400" />
            Future
          </span>
        </div>
      </div>
    </div>
  );
}