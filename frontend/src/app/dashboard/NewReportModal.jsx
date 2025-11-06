import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

const ANIMATION_DURATION_MS = 500;

function getCurrentHourValue() {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function stripMeridiem(label) {
  if (typeof label !== "string") {
    return label;
  }

  return label.replace(/\s*([AP]M)\.?/i, "").trim();
}

function NewReportModal({
  open = false,
  locations = [],
  onOpenChange,
  onSubmit,
}) {
  const [isMounted, setIsMounted] = useState(open);
  const [isClosing, setIsClosing] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  const [reportScope, setReportScope] = useState("current");
  const [reportTime, setReportTime] = useState(getCurrentHourValue());
  const [busynessRating, setBusynessRating] = useState(5);
  const [selectedLocation, setSelectedLocation] = useState(
    locations[0]?.id ?? "",
  );

  const closeTimerRef = useRef(null);
  const enteringFrameRef = useRef(null);

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
      }),
    [],
  );

  const selectedTimeLabel = useMemo(() => {
    if (!reportTime) {
      return "";
    }

    const [hours, minutes] = reportTime.split(":").map(Number);
    if (
      Number.isNaN(hours) ||
      hours < 0 ||
      hours > 23 ||
      Number.isNaN(minutes) ||
      minutes < 0 ||
      minutes > 59
    ) {
      return reportTime;
    }

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    const formatted = timeFormatter.format(date);
    return stripMeridiem(formatted);
  }, [reportTime, timeFormatter]);

  useEffect(() => {
    if (open) {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }

      setIsMounted(true);
      setIsClosing(false);
      setIsEntering(true);

      enteringFrameRef.current = window.requestAnimationFrame(() => {
        setIsEntering(false);
        enteringFrameRef.current = null;
      });
    } else if (isMounted && !isClosing) {
      setIsClosing(true);
      if (enteringFrameRef.current) {
        window.cancelAnimationFrame(enteringFrameRef.current);
        enteringFrameRef.current = null;
        setIsEntering(false);
      }

      closeTimerRef.current = window.setTimeout(() => {
        setIsMounted(false);
        setIsClosing(false);
        closeTimerRef.current = null;
      }, ANIMATION_DURATION_MS);
    }

    return () => {
      if (enteringFrameRef.current) {
        window.cancelAnimationFrame(enteringFrameRef.current);
        enteringFrameRef.current = null;
      }
    };
  }, [open, isMounted, isClosing]);

  useEffect(() => {
    if (open) {
      const nextLocation = locations[0]?.id ?? "";
      setReportScope("current");
      setReportTime(getCurrentHourValue());
      setBusynessRating(5);
      setSelectedLocation(nextLocation);
    }
  }, [open, locations]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleScopeChange = (scope) => {
    setReportScope(scope);
    if (scope === "current") {
      setReportTime(getCurrentHourValue());
    }
  };

  const handleClose = () => {
    onOpenChange?.(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      scope: reportScope,
      time: reportScope === "current" ? "now" : reportTime,
      busyness: busynessRating,
      locationId: selectedLocation,
    };

    onSubmit?.(payload);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-10 backdrop-blur-sm transition-opacity duration-500 ease-out ${
        isClosing || isEntering ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-lg rounded-3xl bg-white shadow-2xl transition-all duration-500 ease-out ${
          isClosing || isEntering ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 p-6 sm:p-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Share a new report
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Let everyone know how busy it feels so they can plan ahead.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex size-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
              aria-label="Close report form"
            >
              ×
            </button>
          </div>

          <div className="rounded-2xl bg-gray-50 p-3">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              When is this report for?
            </span>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {["current", "previous"].map((scope) => {
                const isActive = reportScope === scope;
                return (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => handleScopeChange(scope)}
                    className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-all duration-200 ease-out ${
                      isActive
                        ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm"
                        : "border-transparent bg-white text-gray-600 hover:border-gray-200 hover:text-gray-800"
                    }`}
                  >
                    {scope === "current" ? "Right now" : "Earlier today"}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            aria-hidden={reportScope !== "previous"}
            className={`overflow-hidden transition-all duration-500 ease-out ${
              reportScope === "previous"
                ? "max-h-32 opacity-100 translate-y-0"
                : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
            }`}
          >
            <label
              className={`flex flex-col gap-2 text-sm font-medium text-gray-700 transition-all duration-300 ease-out ${
                reportScope === "previous"
                  ? "translate-y-0 opacity-100"
                  : "translate-y-1 opacity-0"
              }`}
            >
              <span>What time are you reporting for?</span>
              <Input
                type="time"
                step={900}
                required
                value={reportTime}
                onChange={(event) => setReportTime(event.target.value)}
                className="h-12 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm transition-all duration-200 ease-out focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-xs font-medium text-gray-400">
                Currently set to {selectedTimeLabel || "your chosen time"}.
              </span>
            </label>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-inner">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-gray-800">
                  Busyness rating
                </h4>
                <p className="text-xs text-gray-500">
                  1 is empty; 10 is packed shoulder-to-shoulder.
                </p>
              </div>
              <span className="rounded-xl bg-blue-500/10 px-4 py-1 text-lg font-bold text-blue-600 transition-all duration-200 ease-out">
                {busynessRating}
              </span>
            </div>
            <div className="mt-4">
              <Slider
                min={1}
                max={10}
                step={1}
                value={[busynessRating]}
                className="transition-all duration-200 ease-out"
                onValueChange={(value) =>
                  setBusynessRating(value[0] ?? busynessRating)
                }
              />
              <div className="mt-2 flex justify-between text-xs font-medium text-gray-400">
                <span>1</span>
                <span>10</span>
              </div>
            </div>
          </div>

          <label
            className={`flex flex-col gap-2 text-sm font-medium text-gray-700 transition-all duration-300 ease-out ${
              isClosing || isEntering
                ? "translate-y-1 opacity-0"
                : "translate-y-0 opacity-100"
            }`}
          >
            <span>Where are you?</span>
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(event) => setSelectedLocation(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition-all duration-200 ease-out focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl px-6 py-2 text-sm font-semibold text-gray-600 transition-all duration-200 ease-out hover:bg-gray-100"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow transition-all duration-200 ease-out hover:bg-blue-700"
            >
              Submit report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewReportModal;
