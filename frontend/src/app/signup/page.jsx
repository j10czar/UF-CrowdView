import React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignUp() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 pb-14 pt-12">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-200/80">
              UF CrowdView
            </p>
            <h1 className="text-2xl font-semibold text-white">Create your account</h1>
            <p className="text-sm text-slate-300">
              Join the community keeping campus flow moving.
            </p>
          </div>
          <Link href="/signin" className="text-sm text-blue-200 underline underline-offset-4">
            Have an account? Sign in
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-200/80">
              Sign up
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Build your CrowdView profile
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
              <Input
                className="bg-white/5 text-white placeholder:text-slate-400"
                type="password"
                placeholder="Confirm password"
              />
              <Link href="/dashboard">
                <Button className="w-full rounded-lg bg-blue-500 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-600">
                  Create account
                </Button>
              </Link>
            </form>
            <p className="mt-3 text-xs text-slate-300">
              By continuing you agree to help keep reports accurate and respectful.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-200/80">
              What you get
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              <li>• Post and edit reports for any campus spot.</li>
              <li>• See averages tuned to your schedule.</li>
              <li>• Get fast access to admin tools if you’re on the ops team.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
