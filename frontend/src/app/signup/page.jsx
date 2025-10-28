import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h3 className="mt-6 text-center text-3xl font-bold text-white">
            Sign up for UF CrowdView
          </h3>
        </div>
        <div className="mt-8 space-y-6">
          <p className="text-center text-white">
            Create your account to get started!
          </p>

          <div className="flex justify-center align-middle">
            <div className="w-1/2">
              <Input className="mb-4" type="text" placeholder="Username" />
              <Input className="mb-4" type="password" placeholder="Password" />
              <Input
                className="mb-4"
                type="password"
                placeholder="Confirm Password"
              />
              <Link href="/dashboard">
                <Button className="w-full rounded-lg bg-blue-500 hover:bg-blue-700">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
