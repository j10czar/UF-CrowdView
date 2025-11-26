import React, { useMemo } from "react";

const MAX_BUSINESS_SCORE = 10;
const HOURS_EACH_SIDE = 3; 

function clampScore(score) {
  if (typeof score !== "number" || Number.isNaN(score) || score < 0) {
    return 0;
  }
  return Math.min(MAX_BUSINESS_SCORE, score);
}

function LocationGraph({ hourlyBusyness = [], currentHourIndex }) {
  
  const formatHourLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      hour12: true,
    });

    return (date) => {
      return formatter
        .format(date)
        .replace(/\s*([AP]M)\.?/i, "") 
        .trim();
    };
  }, []);

  const bars = useMemo(() => {
    if (!Array.isArray(hourlyBusyness) || hourlyBusyness.length === 0) {
      return [];
    }

    const safeCurrentIndex = typeof currentHourIndex === "number" 
      ? Math.floor(currentHourIndex) 
      : new Date().getHours();

    const seriesLength = hourlyBusyness.length;
    
    const offsets = Array.from(
      { length: HOURS_EACH_SIDE * 2 + 1 },
      (_, index) => index - HOURS_EACH_SIDE
    );

    const now = new Date();
    now.setMinutes(0, 0, 0);

    return offsets.map((offset) => {
      const displayTime = new Date(now.getTime() + offset * 60 * 60 * 1000);
      
      const normalizedIndex =
        ((safeCurrentIndex + offset) % seriesLength + seriesLength) %
        seriesLength;

      const rawScore = hourlyBusyness[normalizedIndex];
      const score = clampScore(rawScore);

      return {
        id: `${normalizedIndex}-${offset}`,
        label: formatHourLabel(displayTime),
        score,
        hourOffset: offset,
        isFuture: offset > 0,
        isCurrent: offset === 0,
      };
    });
  }, [hourlyBusyness, currentHourIndex, formatHourLabel]);

  if (bars.length === 0) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div className="relative flex h-36 items-end gap-2 rounded-xl bg-gray-100 p-3">
      {/* Background Line */}
      <div
        className="pointer-events-none absolute bottom-3 left-3 right-3 h-px bg-gray-300"
        aria-hidden="true"
      />
      
      {bars.map(({ id, label, score, isFuture, isCurrent, hourOffset }) => (
        <div
          key={id}
          className="relative z-10 flex h-full min-h-0 w-full flex-1 flex-col items-center gap-2"
        >
          {/* Bar Container */}
          <div className="flex min-h-0 w-full flex-1 items-end overflow-hidden rounded-sm bg-gray-200">
            {/* The Colored Bar */}
            <div
              className={`relative flex w-full items-end justify-center rounded-sm transition-all duration-500 ${
                isCurrent
                  ? "bg-blue-600" 
                  : isFuture
                  ? "bg-gray-400" 
                  : "bg-blue-400" 
              }`}
              style={{
                height: `${(score / MAX_BUSINESS_SCORE) * 100}%`,
                maxHeight: "100%",
              }}
            >
              {score > 0 && (
                <span className="mb-1 text-[10px] font-semibold text-white drop-shadow-sm">
                  {score}
                </span>
              )}
            </div>
          </div>
          
          {/* Hour Label */}
          <span className={`text-xs font-medium ${isCurrent ? 'text-blue-700 font-bold' : 'text-gray-600'}`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default LocationGraph;