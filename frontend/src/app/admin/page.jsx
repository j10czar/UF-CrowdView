"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import axios from "axios";

// --- HELPER FUNCTIONS ---
function formatHourLabel(hour) {
  if (!Number.isInteger(hour)) return "—";
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return new Intl.DateTimeFormat(undefined, { hour: "numeric" }).format(date);
}

function formatDateLabel(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function AdminPage() {
  const router = useRouter();
  
  
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]); 
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const [userSearch, setUserSearch] = useState("");
  const [recalculatingLocationId, setRecalculatingLocationId] = useState(null);

  // Compute Metrics 
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const query = userSearch.trim().toLowerCase();
    return users.filter((user) => 
       (user.username || "").toLowerCase().includes(query) ||
       (user.email || "").toLowerCase().includes(query)
    );
  }, [userSearch, users]);

  const totalReports = useMemo(() => {
    if (!Array.isArray(locations)) return 0;
    return locations.reduce((sum, location) => sum + (location.reports?.length || 0), 0);
  }, [locations]);

  const bannedCount = useMemo(
    () => users.filter((user) => user.banned).length,
    [users]
  );

  // Effect for Fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchUsers = axios.get("http://localhost:5000/admin/users", { withCredentials: true });
        const fetchLocs = axios.get("http://localhost:5000/admin/locations-data", { withCredentials: true });

        const [usersRes, locsRes] = await Promise.all([fetchUsers, fetchLocs]);

        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);

        const rawLocs = locsRes.data;
        const safeLocs = Array.isArray(rawLocs) ? rawLocs : (rawLocs?.locations || []);
        setLocations(safeLocs);
        
        setCurrentUser({ username: "Admin", email: "admin@ufl.edu", isAdmin: true });
        setLoading(false);

      } catch (error) {
        if (error.response && error.response.status === 403) {
            setAccessDenied(true);
            setLoading(false);
        } else {
            console.error("API Error", error);
            setAccessDenied(true); 
            setLoading(false);
        }
      }
    };

    fetchData();
  }, [router]);


  const handleBanToggle = async (userId, currentStatus) => {
    setUsers((prev) => prev.map(u => u.id === userId ? { ...u, banned: !currentStatus } : u));
    try {
        await axios.post(`http://localhost:5000/admin/users/${userId}/ban`, {}, { withCredentials: true });
    } catch (error) {
        console.error("Failed to ban user", error);
        setUsers((prev) => prev.map(u => u.id === userId ? { ...u, banned: currentStatus } : u));
    }
  };

  const handleRemoveReport = async (locationId, reportId) => {
    setLocations((prev) => prev.map(loc => {
        if (loc.id !== locationId) return loc;
        return {
            ...loc,
            reports: loc.reports.filter(r => r.id !== reportId)
        };
    }));

    try {
        await axios.delete(`http://localhost:5000/admin/reports/${reportId}`, { withCredentials: true });
    } catch (error) {
        console.error("Failed to delete report", error);
    }
  };

  const handleRecalculate = async (locationId) => {
    setRecalculatingLocationId(locationId);
    try {
        const response = await axios.get("http://localhost:5000/admin/locations-data", { withCredentials: true });
        const rawLocs = response.data;
        const safeLocs = Array.isArray(rawLocs) ? rawLocs : (rawLocs?.locations || []);
        setLocations(safeLocs);
    } catch (error) {
        console.error("Recalculation failed", error);
    }
    setRecalculatingLocationId(null);
  };


  if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
            <div className="flex flex-col items-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                <span>Verifying Admin Privileges...</span>
            </div>
        </div>
      );
  }

  if (accessDenied) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center">
            <div className="rounded-full bg-red-500/10 p-4 mb-4">
                <div className="h-12 w-12 text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1>
            <p className="text-slate-400 max-w-md mb-6">
                This area is restricted to administrators only. Your account does not have the necessary permissions.
            </p>
            <Button 
                onClick={() => router.push('/')} 
                className="bg-blue-600 hover:bg-blue-500 text-white"
            >
                Return to Home
            </Button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <header className="mx-auto flex max-w-6xl flex-col gap-4 px-6 pb-4 pt-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-blue-200/80">
            Admin dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Operations control center
          </h1>
        </div>
        <div className="flex items-center gap-4">
             <Button variant="outline" onClick={() => router.push('/')} className="border-white/10 hover:bg-white/5 text-slate-300">
                Exit
             </Button>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 shadow-lg">
                <p className="text-xs uppercase tracking-[0.18em] text-blue-200/80">
                    Signed in as
                </p>
                <p className="font-semibold text-white">{currentUser?.username}</p>
            </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 pb-14">
        {/* Metrics Row */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="User accounts" value={users.length} accent="bg-blue-500/20 text-blue-100" />
          <MetricCard label="Banned users" value={bannedCount} accent="bg-amber-500/20 text-amber-100" />
          <MetricCard label="Active Reports" value={totalReports} accent="bg-emerald-500/20 text-emerald-100" />
          <MetricCard
            label="System Status"
            value="Online"
            accent="bg-purple-500/20 text-purple-100"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-5">
          {/* USERS COLUMN */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-blue-200/80">
                  Users
                </p>
                <h2 className="text-xl font-semibold text-white">
                  Search & banlist
                </h2>
              </div>
            </div>

            <div className="mt-4">
              <Input
                placeholder="Search..."
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                className="bg-white/10 text-sm text-white placeholder:text-slate-400 border-white/10"
              />
            </div>

            <div className="mt-4 divide-y divide-white/5 border border-white/5 rounded-2xl bg-white/5 max-h-[500px] overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">
                      {user.username}
                    </p>
                    <p className="text-xs text-slate-300">{user.email}</p>
                    {user.banned && <span className="text-[10px] bg-red-500/20 text-red-200 px-1 rounded">BANNED</span>}
                  </div>
                  <Switch
                    checked={user.banned}
                    onCheckedChange={() => handleBanToggle(user.id, user.banned)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* LOCATIONS COLUMN */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur lg:col-span-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-blue-200/80">
                  Locations
                </p>
                <h2 className="text-xl font-semibold text-white">
                  Reports & averages
                </h2>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {(locations || []).map((location) => {
                const busynessArray = location.busyness || [];
                const reports = location.reports || [];
                const averageScore = reports.length > 0
                    ? (reports.reduce((sum, r) => sum + r.busyness, 0) / reports.length).toFixed(1)
                    : "N/A";

                return (
                  <div
                    key={location.id}
                    className="rounded-2xl border border-white/5 bg-white/5 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {location.name}
                        </h3>
                        <p className="text-xs text-slate-300">
                          {reports.length} reports (last 24h)
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[11px] uppercase text-slate-400">
                            Report Avg
                          </p>
                          <p className="text-2xl font-semibold text-blue-100">
                            {averageScore}<span className="text-sm text-slate-400 font-normal">/10</span>
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-blue-600 text-white hover:bg-blue-500"
                          onClick={() => handleRecalculate(location.id)}
                          disabled={recalculatingLocationId === location.id}
                        >
                          Refresh
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-1 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      {busynessArray.map((value, index) => (
                         <div 
                            key={index}
                            className="h-full bg-blue-500/60"
                            style={{ flex: 1, opacity: value/10 }}
                         />
                      ))}
                    </div>

                    <div className="mt-4 space-y-3">
                      {reports.map((report) => (
                        <div
                          key={report.id}
                          className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-3"
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-white">
                              {report.authorName} • {formatHourLabel(report.hour)}
                            </p>
                            <p className="text-xs text-slate-300">
                              {formatDateLabel(report.datePosted)} — Score: {report.busyness}/10
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 text-xs bg-red-500/20 text-red-200 hover:bg-red-500/40"
                            onClick={() => handleRemoveReport(location.id, report.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      {reports.length === 0 && (
                        <p className="text-sm text-slate-500 italic">
                          No recent reports.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({ label, value, accent }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
        {label}
      </p>
      <div
        className={`mt-3 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-lg font-semibold ${accent}`}
      >
        <span>{value}</span>
      </div>
    </div>
  );
}