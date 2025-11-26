"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { Button } from "@/components/ui/button";
import LocationCard from "./LocationCard";
import NewReportModal from "./NewReportModal";
import axios from "axios";

const LOCATION_IMAGES = {
  "Library West": "/images/libwest.jpg",
  "Reitz Union": "/images/reitz.png",
  "Norman Hall": "/images/norman.jpg",
  "Marston Library": "/images/marston.jpg",
  "Turlington Plaza": "/images/turlington.jpg",
  "Broward Dining": "/images/broward-dining.png",
  "Gator Corner": "/images/gator-corner.jpg",
};

export default function Home() {
  const [locations, setLocations] = useState([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [isAuthorized, setIsAuthorized] = useState(false);

  const router = useRouter(); 

  useEffect(() => {
    const verifySession = async () => {
        try {
            await axios.get("http://localhost:5000/check-session", { withCredentials: true });
            setIsAuthorized(true); 
        } catch (error) {
            router.replace("/"); // User is invalid
        }
    };
    verifySession();
  }, [router]);

  // Fetch Data (Only after auth is confirmed) 
  useEffect(() => {
    if (!isAuthorized) return; 

    async function fetchLocations() {
      try {
        const response = await axios.get("http://localhost:5000/locations", {
          withCredentials: true,
        });
        if (response.data && response.data.locations) {
          const validLocations = response.data.locations.filter(loc => 
            LOCATION_IMAGES.hasOwnProperty(loc.name)
          );
          setLocations(validLocations);
        }
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      }
    }
    fetchLocations();
  }, [isAuthorized]);

  const handleReportSuccess = () => {
    console.log("Report submitted successfully. Refreshing cards...");
    setRefreshKey((prev) => prev + 1);
    setIsReportModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5000/logout", { withCredentials: true });
      router.push("/"); 
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Block rendering until we know the user is logged in
  if (!isAuthorized) {
      return (
          <div className="flex min-h-screen items-center justify-center bg-gray-50">
              <div className="text-gray-400 animate-pulse text-sm font-medium">Verifying access...</div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex w-full justify-between items-center bg-gray-950 px-6 py-4 shadow-md sticky top-0 z-40">
        
        {/* Logo (Refreshes Data) */}
        <div 
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => window.location.reload()} 
        >
            <h2 className="text-xl font-bold text-white tracking-wide">UF CrowdView</h2>
        </div>

        {/* Menu Actions */}
        <div className="flex items-center gap-3">
            
            {/* NEW: Exit Button */}
            <Button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 transition-colors rounded-lg shadow-sm"
            >
              + New Report
            </Button>

            <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 transition-colors rounded-lg shadow-sm"
            >
                Exit
            </Button>


        </div>
      </div>

      {/* Locations Grid */}
      <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-8 p-8">
        {locations.length === 0 ? (
          <div className="flex h-64 w-full items-center justify-center text-gray-500 animate-pulse">
            Loading campus locations...
          </div>
        ) : (
          locations.map((location) => (
            <LocationCard
              key={location.id}
              locationId={location.id}
              name={location.name}
              imageSrc={LOCATION_IMAGES[location.name]}
              refreshTrigger={refreshKey}
            />
          ))
        )}
      </div>

      {/* Report Modal */}
      <NewReportModal
        open={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        locations={locations}
        onSubmit={handleReportSuccess}
      />
    </div>
  );
}