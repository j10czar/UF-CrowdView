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
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h3 className="mt-6 text-center text-3xl font-bold text-white">
            Sign up for UF CrowdView
          </h3>
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
                className="mb-4"
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
