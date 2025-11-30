"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setFeedback({ message: "", type: "" });

    try {
      const res = await axios.post(
        "http://localhost:5000/login",
        { email, password },
        { withCredentials: true } 
      );

      setFeedback({ message: "Login successful! Redirecting...", type: "success" });
      
      setTimeout(() => {
        if (res.data.isAdmin) {
            router.push("/admin");
        } else {
            router.push("/dashboard");
        }
      }, 1000);

    } catch (err) {

      
      let errorMessage = "Login failed. Please try again.";
      
      if (err.response) {
        if (err.response.status === 401) {
            errorMessage = "Invalid email or password.";
        } else if (err.response.status === 403) {
            errorMessage = "Account is banned.";
        } else if (err.response.data && err.response.data.error) {
            errorMessage = err.response.data.error;
        }
      }

      setFeedback({ message: errorMessage, type: "error" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="max-w-md w-full space-y-8 px-6">
        <div>
          <h3 className="mt-6 text-center text-3xl font-bold text-white">
            Log Into UF CrowdView
          </h3>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <p className="text-center text-slate-300">
            Welcome back! Please sign in to continue.
          </p>

          <div className="flex flex-col gap-4">
              <Input
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-500"
                type="email"
                placeholder="UF Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-500"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="submit"
                className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
              >
                Sign In
              </Button>

              {/* Feedback Message */}
              {feedback.message && (
                <div className={`mt-2 text-center text-sm p-3 rounded-md border ${
                    feedback.type === 'error' 
                        ? 'bg-red-500/10 text-red-200 border-red-500/50' 
                        : 'bg-green-500/10 text-green-200 border-green-500/50'
                }`}>
                    {feedback.message}
                </div>
              )}
          </div>
        </form>

        <p className="text-center text-slate-400">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}