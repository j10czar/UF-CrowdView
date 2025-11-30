"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setFeedback({ message: "", type: "" });

    // Password Match Check
    if (password !== confirm) {
      setFeedback({ message: "Passwords do not match.", type: "error" });
      return;
    }
    // Username Length Check
    const usernamePrefix = email.split("@")[0];
    if (usernamePrefix.length < 3) {
        setFeedback({ message: "Username must be at least 3 characters long.", type: "error" });
        return;
    }

    // Domain Check
    if (!email.endsWith("@ufl.edu")) {
        setFeedback({ message: "Only ufl.edu emails are allowed.", type: "error" });
        return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/signup",
        { email, password },
        { withCredentials: true } 
      );

      setFeedback({ message: "Account created! Redirecting...", type: "success" });
      
      setTimeout(() => {
          router.push("/dashboard");
      }, 1000);

    } catch (err) {
      let errorMessage = "Signup failed. Try again later.";
      
      if (err.response && err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
      } else if (err.message) {
          errorMessage = err.message;
      }

      setFeedback({ message: errorMessage, type: "error" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="max-w-md w-full space-y-8 px-6">
        <div>
          <h3 className="mt-6 text-center text-3xl font-bold text-white">
            Sign up for UF CrowdView
          </h3>
        </div>

        <form onSubmit={handleSignup} className="mt-8 space-y-6">
          <p className="text-center text-slate-300">
            Create your account to get started!
          </p>

          <div className="flex flex-col gap-4">
              <Input
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-500"
                type="email"
                placeholder="UF Email (@ufl.edu)"
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
              <Input
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-500"
                type="password"
                placeholder="Confirm Password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />

              <Button
                type="submit"
                className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
              >
                Sign Up
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
          Already have an account?{" "}
          <Link href="/signin" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}