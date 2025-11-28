"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  DUMMY_HOURLY_TEMPLATE,
  buildEmptyDaySeries,
  clampBusyness,
} from "@/lib/busyness";

const BASE_TEMPLATE_SERIES = buildEmptyDaySeries(DUMMY_HOURLY_TEMPLATE);

const MOCK_ADMIN_USER = {
  id: "u-admin",
  username: "OpsAdmin",
  email: "ops@crowdview.example",
  isAdmin: true,
};

const MOCK_USERS = [
  { id: "u-admin", username: "OpsAdmin", email: "ops@crowdview.example", isAdmin: true, banned: false },
  { id: "u-42", username: "GatorGal", email: "gator.gal@ufl.edu", isAdmin: false, banned: false },
  { id: "u-83", username: "NightOwl", email: "night.owl@ufl.edu", isAdmin: false, banned: false },
  { id: "u-19", username: "DataCoach", email: "mentor@ufl.edu", isAdmin: false, banned: false },
  { id: "u-5", username: "LineWatcher", email: "lines@ufl.edu", isAdmin: false, banned: true },
];

function computeHourlyAverageFromReports(
  reports = [],
  fallbackSeries = BASE_TEMPLATE_SERIES,
) {
  const safeFallback = buildEmptyDaySeries(fallbackSeries);
  const totals = Array(24).fill(0);
  const counts = Array(24).fill(0);

  reports.forEach(({ hour, busyness }) => {
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
      return;
    }

    if (!Number.isFinite(busyness)) {
      return;
    }

    totals[hour] += busyness;
    counts[hour] += 1;
  });

  return safeFallback.map((value, hourIndex) => {
    if (!counts[hourIndex]) {
      return value;
    }
    const averaged = totals[hourIndex] / counts[hourIndex];
    const normalized = clampBusyness(averaged);
    return typeof normalized === "number" ? normalized : value;
  });
}

function formatHourLabel(hour) {
  if (!Number.isInteger(hour)) {
    return "—";
  }

  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
  }).format(date);
}

function formatDateLabel(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

function createMockLocation({ id, name, delta = 0, reports = [] }) {
  return {
    id,
    name,
    busyness: BASE_TEMPLATE_SERIES.map(
      (value) => clampBusyness(value + delta) ?? value,
    ),
    reports,
  };
}

const MOCK_LOCATIONS = [
  createMockLocation({
    id: "library-west",
    name: "Library West",
    delta: 1,
    reports: [
      {
        id: "r-lib-1",
        authorId: "u-42",
        authorName: "GatorGal",
        locationId: "library-west",
        datePosted: "2024-04-21T14:00:00Z",
        busyness: 8,
        hour: 14,
        note: "Lines for the printers but seats open upstairs.",
      },
      {
        id: "r-lib-2",
        authorId: "u-83",
        authorName: "NightOwl",
        locationId: "library-west",
        datePosted: "2024-04-21T22:00:00Z",
        busyness: 6,
        hour: 22,
        note: "Quiet; only a few study groups left.",
      },
    ],
  }),
  createMockLocation({
    id: "reitz-union",
    name: "Reitz Union",
    delta: -1,
    reports: [
      {
        id: "r-reitz-1",
        authorId: "u-19",
        authorName: "DataCoach",
        locationId: "reitz-union",
        datePosted: "2024-04-21T17:00:00Z",
        busyness: 5,
        hour: 17,
        note: "Food court steady; elevators are slow.",
      },
    ],
  }),
  createMockLocation({
    id: "marston-library",
    name: "Marston Library",
    delta: 2,
    reports: [
      {
        id: "r-mar-1",
        authorId: "u-5",
        authorName: "LineWatcher",
        locationId: "marston-library",
        datePosted: "2024-04-21T10:00:00Z",
        busyness: 7,
        hour: 10,
        note: "Crowded around the coffee line.",
      },
      {
        id: "r-mar-2",
        authorId: "u-83",
        authorName: "NightOwl",
        locationId: "marston-library",
        datePosted: "2024-04-21T20:00:00Z",
        busyness: 9,
        hour: 20,
        note: "Group project rush before close.",
      },
    ],
  }),
];

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser] = useState(MOCK_ADMIN_USER); // TODO: swap with real session/user from RESI auth.
  const [users, setUsers] = useState(MOCK_USERS); // TODO: hydrate from RESI users endpoint.
  const [locations, setLocations] = useState(
    MOCK_LOCATIONS.map((location) => ({
      ...location,
      busyness: computeHourlyAverageFromReports(location.reports, location.busyness),
    })),
  );
  const [userSearch, setUserSearch] = useState("");
  const [recalculatingLocationId, setRecalculatingLocationId] = useState(null);

  const isAdmin = Boolean(currentUser?.isAdmin);

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/signin");
    }
  }, [isAdmin, router]);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) {
      return users;
    }

    const query = userSearch.trim().toLowerCase();
    return users.filter((user) => {
      return (
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    });
  }, [userSearch, users]);

  const totalReports = useMemo(
    () => locations.reduce((sum, location) => sum + location.reports.length, 0),
    [locations],
  );

  const bannedCount = useMemo(
    () => users.filter((user) => user.banned).length,
    [users],
  );

  const handleBanToggle = (userId, nextStatus) => {
    setUsers((previous) =>
      previous.map((user) =>
        user.id === userId ? { ...user, banned: nextStatus } : user,
      ),
    );
    // TODO: Connect to the RESI API to persist user bans/unbans.
  };

  const handleRemoveReport = (locationId, reportId) => {
    setLocations((previous) =>
      previous.map((location) => {
        if (location.id !== locationId) {
          return location;
        }
        const nextReports = location.reports.filter(
          (report) => report.id !== reportId,
        );

        return {
          ...location,
          reports: nextReports,
          busyness: computeHourlyAverageFromReports(
            nextReports,
            location.busyness,
          ),
        };
      }),
    );
    // TODO: Hook up to RESI API to delete or redact a report record.
  };

  const handleRecalculate = async (locationId) => {
    setRecalculatingLocationId(locationId);
    // TODO: Replace the timeout with a RESI API call to recalculate averages for this location.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLocations((previous) =>
      previous.map((location) => {
        if (location.id !== locationId) {
          return location;
        }

        return {
          ...location,
          busyness: computeHourlyAverageFromReports(
            location.reports,
            DUMMY_HOURLY_TEMPLATE,
          ),
        };
      }),
    );
    setRecalculatingLocationId(null);
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-6 shadow-2xl">
          <p className="text-sm font-medium text-slate-200">
            Admin access required. Please sign in with an admin account.
          </p>
        </div>
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
          <p className="mt-1 text-sm text-slate-300">
            Search and safeguard users, clear noisy reports, and refresh daily averages.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 shadow-lg">
          <p className="text-xs uppercase tracking-[0.18em] text-blue-200/80">
            Signed in as
          </p>
          <p className="font-semibold text-white">{currentUser.username}</p>
          <p className="text-xs text-slate-300">{currentUser.email}</p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 pb-14">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="User accounts" value={users.length} accent="bg-blue-500/20 text-blue-100" />
          <MetricCard label="Banned users" value={bannedCount} accent="bg-amber-500/20 text-amber-100" />
          <MetricCard label="Reports pending" value={totalReports} accent="bg-emerald-500/20 text-emerald-100" />
          <MetricCard
            label="Template avg (24h)"
            value={`${Math.round(
              BASE_TEMPLATE_SERIES.reduce((sum, value) => sum + value, 0) /
                BASE_TEMPLATE_SERIES.length,
            )}/10`}
            accent="bg-purple-500/20 text-purple-100"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-5">
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
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-slate-200">
                Live preview
              </span>
            </div>

            <div className="mt-4">
              <Input
                placeholder="Search by username or email"
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                className="bg-white/10 text-sm text-white placeholder:text-slate-400"
              />
            </div>

            <div className="mt-4 divide-y divide-white/5 border border-white/5 rounded-2xl bg-white/5">
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
                    <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide">
                      {user.isAdmin ? (
                        <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-blue-100">
                          Admin
                        </span>
                      ) : null}
                      {user.banned ? (
                        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-amber-100">
                          Banned
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-100">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] uppercase text-slate-300">
                      Ban user
                    </span>
                    <Switch
                      checked={user.banned}
                      onCheckedChange={(value) => handleBanToggle(user.id, value)}
                    />
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 ? (
                <div className="px-4 py-6 text-sm text-slate-300">
                  No users match that search.
                </div>
              ) : null}
            </div>
          </div>

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
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-slate-200">
                {totalReports} reports loaded
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {locations.map((location) => {
                const averageScore = Math.round(
                  (location.busyness || BASE_TEMPLATE_SERIES).reduce(
                    (sum, value) => sum + value,
                    0,
                  ) / (location.busyness?.length || 24),
                );

                return (
                  <div
                    key={location.id}
                    className="rounded-2xl border border-white/5 bg-white/5 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-blue-200/80">
                          Location
                        </p>
                        <h3 className="text-lg font-semibold text-white">
                          {location.name}
                        </h3>
                        <p className="text-xs text-slate-300">
                          {location.reports.length} reports in queue
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[11px] uppercase text-slate-400">
                            Avg (24h)
                          </p>
                          <p className="text-2xl font-semibold text-blue-100">
                            {Number.isFinite(averageScore) ? averageScore : "—"}/10
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-blue-500 text-white hover:bg-blue-600"
                          onClick={() => handleRecalculate(location.id)}
                          disabled={recalculatingLocationId === location.id}
                        >
                          {recalculatingLocationId === location.id
                            ? "Recalculating..."
                            : "Recalculate averages"}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-1">
                      {location.busyness.slice(0, 16).map((value, index) => (
                        <div
                          key={index}
                          className="h-2 flex-1 rounded-full bg-blue-500/20"
                        >
                          <div
                            className="h-full rounded-full bg-blue-400"
                            style={{ width: `${(value / 10) * 100}%` }}
                            aria-hidden
                          />
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 space-y-3">
                      {location.reports.map((report) => (
                        <div
                          key={report.id}
                          className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-3"
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-white">
                              {report.authorName} • {formatHourLabel(report.hour)}
                            </p>
                            <p className="text-xs text-slate-300">
                              {formatDateLabel(report.datePosted)} — Busyness: {report.busyness}/10
                            </p>
                            <p className="text-sm text-slate-200">{report.note}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-amber-400/60 bg-amber-400/10 text-amber-50 hover:bg-amber-400/20"
                              onClick={() => handleRemoveReport(location.id, report.id)}
                            >
                              Remove report
                            </Button>
                          </div>
                        </div>
                      ))}
                      {location.reports.length === 0 ? (
                        <p className="text-sm text-slate-300">
                          No reports left for this location.
                        </p>
                      ) : null}
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
