"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/login",
        { email, password },
        { withCredentials: true } 
      );

      setMessage("Login successful! Redirecting...");
      setTimeout(() => (window.location.href = "/dashboard"), 1000);
    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.error || "Login failed. Check your credentials."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h3 className="mt-6 text-center text-3xl font-bold text-white">
            Log Into UF CrowdView
          </h3>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <p className="text-center text-white">
            Welcome back! Please sign in to continue.
          </p>

          <div className="flex justify-center align-middle">
            <div className="w-1/2">
              <Input
                className="mb-4"
                type="email"
                placeholder="UF Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                className="bg-white/5 text-white placeholder:text-slate-400"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                className="w-full rounded-lg bg-blue-500 hover:bg-blue-700"
              >
                Sign In
              </Button>

              {message && (
                <p className="mt-4 text-center text-sm text-white">{message}</p>
              )}
            </div>
          </div>
        </form>

        <p className="text-center text-gray-400">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-blue-400 underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
