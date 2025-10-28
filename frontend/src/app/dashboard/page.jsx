import React from 'react'
import { Button } from "@/components/ui/button"
import LocationCard from "./LocationCard"

function dashboard() {
  const locations = [
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
    }
  ]

  return (
    <div>
        <div className='w-screen flex justify-center text-center gap-3 py-3 bg-gray-950'>
            <h2 className='text-white font-bold py-1.5'>UF CrowdView</h2>
            <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                + New Report
            </Button>
        </div>
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-6 p-6">
          {locations.map((location) => (
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
  )
}

export default dashboard
