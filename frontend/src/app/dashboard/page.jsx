"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import LocationCard from "./LocationCard";
import NewReportModal from "./NewReportModal";

const LOCATIONS = [
  // For now we're seeding each card with a rough busyness guess.
  // LocationCard turns this single number into the hour-by-hour dummy series that powers the graph.
  {
    id: "library-west",
    name: "Library West",
    imageSrc: "/images/libwest.jpg",
    initialBusyness: 7,
  },
  {
    id: "reitz-union",
    name: "Reitz Union",
    imageSrc: "/images/reitz.png",
    initialBusyness: 4,
  },
  {
    id: "norman-hall",
    name: "Norman Hall",
    imageSrc: "/images/norman.jpg",
    initialBusyness: 9,
  },
  {
    id: "marston-library",
    name: "Marston Library",
    imageSrc: "/images/marston.jpg",
    initialBusyness: 9,
  },
  {
    id: "turlington-plaza",
    name: "Turlington Plaza",
    imageSrc: "/images/turlington.jpg",
    initialBusyness: 6,
  },
  {
    id: "broward-dining",
    name: "Broward Dining",
    imageSrc: "/images/broward-dining.png",
    initialBusyness: 5,
  },
  {
    id: "gator-corner",
    name: "Gator Corner",
    imageSrc: "/images/gator-corner.jpg",
    initialBusyness: 3,
  },
];

function DashboardPage() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleReportSubmit = (payload) => {
    console.log("Submitting report:", payload);
    setIsReportModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-12 pt-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-200/80">
              UF CrowdView
            </p>
            <h2 className="text-2xl font-semibold text-white">Live campus dashboard</h2>
            <p className="text-sm text-slate-300">
              Real-time busyness from your peers across the spots that matter most.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="bg-blue-500 px-4 py-2 font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-600"
            >
              + New Report
            </Button>
            <Link href="/admin">
              <Button
                type="button"
                variant="outline"
                className="border-white/25 bg-white/5 px-4 py-2 font-semibold text-white hover:border-white/50 hover:bg-white/10"
              >
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid justify-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {LOCATIONS.map((location) => (
            <LocationCard
              key={location.id}
              locationId={location.id}
              name={location.name}
              imageSrc={location.imageSrc}
              initialBusyness={location.initialBusyness}
            />
          ))}
        </div>
      </div>

      <NewReportModal
        open={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        locations={LOCATIONS}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
}

export default DashboardPage;
