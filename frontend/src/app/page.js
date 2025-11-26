"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";


const Link = ({ href, children }) => <a href={href} style={{textDecoration: 'none'}}>{children}</a>;
const Image = ({ src, alt, width, height, className }) => (
  <img src={src} alt={alt} width={width} height={height} className={className} />
);


const HIGHLIGHTS = [
  "Live busyness updates across campus",
  "Report crowds in seconds to help others",
  "Admin oversight keeps data healthy",
];

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for the "Floating Live Card" data
  const [libWestBusyness, setLibWestBusyness] = useState(null); 

  // Check Login Status
  useEffect(() => {
    const checkSession = async () => {
      try {
        await axios.get("http://localhost:5000/check-session", { withCredentials: true });
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  // Fetch Real Data for Library West
  useEffect(() => {
    const fetchLiveStats = async () => {
        try {
            //  Get all locations to find Library West's ID
            const listRes = await axios.get("http://localhost:5000/locations", { withCredentials: true });
            
            if(listRes.data && listRes.data.locations) {
                const libNode = listRes.data.locations.find(l => l.name === "Library West");
                
                if (libNode && libNode.id) {
                    // Fetch the specific location details to get the "Live" calculation
      
                    const detailRes = await axios.get(`http://localhost:5000/locations/${libNode.id}`, { withCredentials: true });
                    
                    if (detailRes.data && Array.isArray(detailRes.data.busyness)) {
                        const currentHourIndex = new Date().getHours();
                        const score = detailRes.data.busyness[currentHourIndex];
                        setLibWestBusyness(score);
                    }
                }
            }
        } catch (e) {
            console.error("Failed to fetch landing stats", e);
        }
    };
    
    fetchLiveStats();
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5000/logout", { withCredentials: true });
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.12),transparent_30%),radial-gradient(circle_at_40%_70%,rgba(16,185,129,0.12),transparent_35%)]" />

      {/* Header */}
      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 pb-6 pt-8">
        <div className="flex items-center gap-2">
          {/* Logo */}
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 ring-1 ring-white/15">
            <span className="font-bold text-white">UF</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-blue-200/80">
              CrowdView
            </p>
            <h1 className="text-xl font-semibold text-white leading-none">Campus Clarity</h1>
          </div>
        </div>
        
        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {!isLoading && (
            <>
              {isLoggedIn ? (
                // IF LOGGED IN: Show Dashboard & Logout
                <div className="flex items-center gap-3">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">
                            Dashboard
                        </Button>
                    </Link>
                    <Button 
                        onClick={handleLogout}
                        className="bg-red-600 text-white shadow-lg hover:bg-red-500 transition-colors"
                    >
                        Logout
                    </Button>
                </div>
              ) : (
                // IF LOGGED OUT: Show Sign In / Get Started
                <>
                  <Link href="/signin">
                    <Button
                      variant="outline"
                      className="border-white/25 bg-white/5 text-white hover:border-white/50 hover:bg-white/10"
                    >
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500">
                      Get started
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-16 sm:gap-14 sm:pb-24 pt-10">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          
          {/* Left: Text Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Real-time insight
            </div>
            
            <h2 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Know where to go, <br />
              <span className="text-blue-400">before you go.</span>
            </h2>
            
            <p className="text-lg text-slate-300 max-w-lg">
              CrowdView blends student reports with live averages so you can pick the best
              study spot, meet-up location, or dining hall without the guesswork.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard">
                <Button className="h-12 px-6 text-base bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition-all hover:scale-105">
                  View Live Dashboard
                </Button>
              </Link>
              <Link href="/admin">
                <Button
                  variant="outline"
                  className="h-12 px-6 text-base border-white/25 bg-white/5 text-white hover:border-white/50 hover:bg-white/10"
                >
                  Admin Access
                </Button>
              </Link>
            </div>

            <div className="grid gap-3 pt-4">
              {HIGHLIGHTS.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                    ✓
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual Mockup */}
          <div className="relative mt-8 lg:mt-0">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur group">
              <div className="relative h-[400px] w-full bg-slate-800">
                 {/* Campus Image */}
                 <Image
                    src="https://images.unsplash.com/photo-1592210454359-9043f067919b?auto=format&fit=crop&q=80&w=1000"
                    alt="UF Campus"
                    width={900}
                    height={520}
                    className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
              </div>
            </div>
            
            {/* Floating Live Card (Dynamic Data) */}
            <div className="absolute -bottom-6 -left-4 sm:left-6 rounded-2xl border border-white/10 bg-slate-900/90 px-5 py-4 text-sm shadow-xl backdrop-blur-md animate-bounce-slow">
              <div className="flex items-center gap-2 mb-2">
                 <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                 <p className="text-[10px] uppercase tracking-[0.18em] text-blue-200/80">
                    Live Report
                 </p>
              </div>
              <p className="text-base font-bold text-white">Library West</p>
              
              {libWestBusyness !== null ? (
                  <p className="text-xl font-mono text-blue-400">
                      {libWestBusyness}/10 <span className="text-xs text-slate-400 font-sans font-normal">{libWestBusyness > 7 ? "Busy" : "Quiet"}</span>
                  </p>
              ) : (
                  <p className="text-sm text-slate-500">Loading...</p>
              )}
              
              <p className="text-xs text-slate-400 mt-1">Updated just now</p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-10">
          {[
            {
              title: "Smart dashboards",
              description: "Compare locations by hour so you can time your arrival perfectly.",
              icon: "📊"
            },
            {
              title: "Trustworthy reports",
              description: "Admins redact noisy data to ensure averages remain accurate.",
              icon: "🛡️"
            },
            {
              title: "Built for Gators",
              description: "A campus-first experience tuned to where students actually go.",
              icon: "🐊"
            },
          ].map((card) => (
            <div
              key={card.title}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur transition-colors hover:bg-white/10 hover:border-white/20"
            >
              <div className="mb-4 text-2xl">{card.icon}</div>
              <p className="text-xs uppercase tracking-[0.18em] text-blue-200/80 font-bold">
                {card.title}
              </p>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">{card.description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}