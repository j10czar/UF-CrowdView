import React, { useMemo } from "react";

const MAX_BUSINESS_SCORE = 10;
const HOURS_EACH_SIDE = 6;

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
  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
      }),
    [],
  );

  const bars = useMemo(() => {
    if (!Array.isArray(hourlyBusyness) || hourlyBusyness.length === 0) {
      return [];
    }

    const fallbackIndex = hourlyBusyness.findLastIndex(
      (value) => typeof value === "number" && value !== -1,
    );
    const effectiveCurrentIndex =
      typeof currentHourIndex === "number"
        ? Math.max(
            0,
            Math.min(
              hourlyBusyness.length - 1,
              Math.floor(currentHourIndex),
            ),
          )
        : fallbackIndex;

    if (effectiveCurrentIndex === -1) {
      return [];
    }

    const offsets = Array.from(
      { length: HOURS_EACH_SIDE * 2 + 1 },
      (_, index) => index - HOURS_EACH_SIDE,
    );

    const now = new Date();
    now.setUTCMinutes(0, 0, 0);
    const currentIndex = effectiveCurrentIndex;

    return offsets
      .map((offset) => {
        const utcTime = new Date(now.getTime() + offset * 60 * 60 * 1000);
        const dataIndex = currentIndex + offset;
        const rawScore =
          dataIndex >= 0 && dataIndex < hourlyBusyness.length
            ? hourlyBusyness[dataIndex]
            : -1;
        const score = clampScore(rawScore);

        return {
          id: utcTime.toISOString(),
          label: timeFormatter.format(utcTime),
          score,
          isFuture: offset > 0,
        };
      })
      .filter((bar) => bar.score !== -1);
  }, [hourlyBusyness, currentHourIndex, timeFormatter]);

  if (bars.length === 0) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
        No busyness data available.
      </div>
    );
  }

  return (
    <div className="flex h-36 items-end gap-2 rounded-xl bg-gray-100 p-3">
      {bars.map(({ id, label, score, isFuture }) => (
        <div
          key={id}
          className="flex w-full flex-1 flex-col items-center gap-2"
          aria-label={`${label}: ${score}/10`}
        >
          <div className="flex h-full w-full items-end rounded-sm bg-gray-200">
            <div
              className={`w-full rounded-sm transition-all ${
                isFuture ? "bg-gray-400" : "bg-blue-500"
              }`}
              style={{
                height: `${(score / MAX_BUSINESS_SCORE) * 100}%`,
              }}
            />
          </div>
          <span className="text-xs font-medium text-gray-600">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default LocationGraph;
