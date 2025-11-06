import React, { useMemo } from "react";

const MAX_BUSINESS_SCORE = 10;
const HOURS_EACH_SIDE = 3;

function clampScore(score) {
  if (
    typeof score !== "number" ||
    Number.isNaN(score) ||
    score < 0
  ) {
    return -1;
  }

  return Math.min(MAX_BUSINESS_SCORE, Math.max(0, score));
}

function LocationGraph({ hourlyBusyness = [], currentHourIndex }) {
  const formatHourLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      hour12: true,
    });

    return (date) => {
      try {
        const parts = formatter.formatToParts(date);
        const hourPart = parts.find((part) => part.type === "hour");
        if (hourPart) {
          return hourPart.value;
        }
      } catch (error) {
        // Fallback to basic string stripping if formatToParts is unavailable.
      }

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

    const seriesLength = hourlyBusyness.length;
    const effectiveCurrentIndex =
      typeof currentHourIndex === "number" && Number.isFinite(currentHourIndex)
        ? ((Math.floor(currentHourIndex) % seriesLength) + seriesLength) %
          seriesLength
        : (() => {
            const utcHour = new Date().getUTCHours();
            if (!Number.isFinite(utcHour)) {
              return null;
            }
            return (Math.floor(utcHour) % seriesLength + seriesLength) %
              seriesLength;
          })();

    if (effectiveCurrentIndex === null) {
      return [];
    }

    const offsets = Array.from(
      { length: HOURS_EACH_SIDE * 2 + 1 },
      (_, index) => index - HOURS_EACH_SIDE,
    );

    const now = new Date();
    now.setMinutes(0, 0, 0);
    const currentIndex = effectiveCurrentIndex;

    return offsets
      .map((offset) => {
        const displayTime = new Date(now.getTime() + offset * 60 * 60 * 1000);
        const normalizedIndex =
          ((currentIndex + offset) % seriesLength + seriesLength) %
          seriesLength;
        const rawScore = hourlyBusyness[normalizedIndex];
        const score = clampScore(rawScore);

        return {
          id: `${normalizedIndex}-${displayTime.toISOString()}`,
          label: formatHourLabel(displayTime),
          score,
          hourOffset: offset,
          isFuture: offset > 0,
        };
      })
      .filter((bar) => bar.score !== -1);
  }, [hourlyBusyness, currentHourIndex, formatHourLabel]);

  if (bars.length === 0) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
        No busyness data available.
      </div>
    );
  }

  return (
    <div className="relative flex h-36 items-end gap-2 rounded-xl bg-gray-100 p-3">
      <div
        className="pointer-events-none absolute bottom-3 left-3 right-3 h-px bg-gray-300"
        aria-hidden="true"
      />
      {bars.map(({ id, label, score, isFuture, hourOffset }) => (
        <div
          key={id}
          className="relative z-10 flex h-full min-h-0 w-full flex-1 flex-col items-center gap-2"
          aria-label={`${label}: ${score}/10`}
        >
          <div className="flex min-h-0 w-full flex-1 items-end overflow-hidden rounded-sm bg-gray-200">
            <div
              className={`relative flex w-full items-end justify-center rounded-sm transition-all ${
                hourOffset === 0
                  ? "bg-blue-600"
                  : isFuture
                    ? "bg-gray-400"
                    : "bg-blue-500"
              }`}
              style={{
                height: `${(score / MAX_BUSINESS_SCORE) * 100}%`,
                maxHeight: "100%",
              }}
            >
              <span className="mb-1 text-[10px] font-semibold text-white drop-shadow-sm">
                {score}
              </span>
            </div>
          </div>
          <span className="text-xs font-medium text-gray-600">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default LocationGraph;
