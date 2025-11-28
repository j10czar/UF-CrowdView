import React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignIn() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 pb-14 pt-12">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-200/80">
              UF CrowdView
            </p>
            <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
            <p className="text-sm text-slate-300">
              Sign in to see live busyness or jump straight to reporting.
            </p>
          </div>
          <Link href="/signup" className="text-sm text-blue-200 underline underline-offset-4">
            Need an account? Sign up
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-200/80">
              Sign in
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Log into UF CrowdView
            </h2>
            <form className="mt-6 space-y-4">
              <Input
                className="bg-white/5 text-white placeholder:text-slate-400"
                type="text"
                placeholder="Username"
              />
              <Input
                className="bg-white/5 text-white placeholder:text-slate-400"
                type="password"
                placeholder="Password"
              />
              <Button className="w-full rounded-lg bg-blue-500 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-600">
                Sign In
              </Button>
            </form>
            <p className="mt-3 text-xs text-slate-300">
              <Link href="/dashboard" className="text-blue-200 underline underline-offset-4">
                Continue without saving
              </Link>{" "}
              (demo mode)
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-200/80">
              Why sign in?
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              <li>• Save your favorite study spots.</li>
              <li>• Submit and edit your reports.</li>
              <li>• Get admin access if you’re on the ops team.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
