import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const HIGHLIGHTS = [
  "Live busyness updates across campus",
  "Report crowds in seconds to help others",
  "Admin oversight keeps data healthy",
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.12),transparent_30%),radial-gradient(circle_at_40%_70%,rgba(16,185,129,0.12),transparent_35%)]" />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 pb-6 pt-8">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-white/10 ring-1 ring-white/15" />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-200/80">
              UF CrowdView
            </p>
            <h1 className="text-xl font-semibold text-white">Campus clarity</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/signin">
            <Button
              variant="outline"
              className="border-white/25 bg-white/5 text-white hover:border-white/50 hover:bg-white/10"
            >
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-blue-500 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-600">
              Get started
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-16 sm:gap-14 sm:pb-24">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
              Real-time insight
            </div>
            <h2 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Know where to go, before you go.
            </h2>
            <p className="text-lg text-slate-200">
              CrowdView blends student reports with live averages so you can pick the best
              study spot, meet-up location, or dining hall without the guesswork.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard">
                <Button className="bg-blue-500 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-600">
                  View dashboard
                </Button>
              </Link>
              <Link href="/admin">
                <Button
                  variant="outline"
                  className="border-white/25 bg-white/5 text-white hover:border-white/50 hover:bg-white/10"
                >
                  Admin controls
                </Button>
              </Link>
            </div>
            <div className="grid gap-2">
              {HIGHLIGHTS.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 text-sm text-slate-200"
                >
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
              <Image
                src="/images/campus.jpg"
                alt="Campus"
                width={900}
                height={520}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-6 left-6 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm shadow-xl backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.18em] text-blue-200/80">
                Live right now
              </p>
              <p className="text-base font-semibold text-white">Library West: 7/10 busy</p>
              <p className="text-xs text-slate-300">Updated just now from student reports</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Smart dashboards",
              description: "Compare locations by hour so you can time your arrival.",
            },
            {
              title: "Trustworthy reports",
              description: "Admins can redact noisy data and keep averages clean.",
            },
            {
              title: "Built for UF",
              description: "A campus-first experience tuned to where students actually go.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-blue-200/80">
                {card.title}
              </p>
              <p className="mt-2 text-sm text-slate-200">{card.description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
