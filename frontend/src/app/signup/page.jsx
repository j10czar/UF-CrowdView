"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/signup",
        { email, password },
        { withCredentials: true } 
      );

      setMessage("Account created! Redirecting...");
      setTimeout(() => (window.location.href = "/dashboard"), 1000);
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.error || "Signup failed. Try again later."
      );
    }
  };

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

        <form onSubmit={handleSignup} className="mt-8 space-y-6">
          <p className="text-center text-white">
            Create your account to get started!
          </p>

          <div className="flex justify-center align-middle">
            <div className="w-1/2">
              <Input
                className="mb-4"
                type="text"
                placeholder="UF Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                className="mb-4"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                className="bg-white/5 text-white placeholder:text-slate-400"
                type="password"
                placeholder="Confirm Password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />

              <Button
                type="submit"
                className="w-full rounded-lg bg-blue-500 hover:bg-blue-700"
              >
                Sign Up
              </Button>

              {message && (
                <p className="mt-4 text-center text-sm text-white">{message}</p>
              )}
            </div>
          </div>
        </form>

        <p className="text-center text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
