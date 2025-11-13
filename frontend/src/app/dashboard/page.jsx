"use client";

import React, { useState } from "react";
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
    <div>
      <div className="flex w-screen justify-center gap-3 bg-gray-950 py-3 text-center">
        <h2 className="py-1.5 text-white font-bold">UF CrowdView</h2>
        <Button
          type="button"
          onClick={() => setIsReportModalOpen(true)}
          className="bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          + New Report
        </Button>
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-6 p-6">
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
