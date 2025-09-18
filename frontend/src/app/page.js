import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="row-start-1 flex items-center justify-between w-full">
        <h1 className="text-2xl font-bold text-gray-800">UF CrowdView</h1>
        <Link href="/signin">
          <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
            Sign In
          </Button>
        </Link>
      </div>
      <div className="row-start-2 flex flex-col items-center justify-center gap-8">
        <Image
          src="/images/campus.jpg"
          alt="Campus"
          width={800}
          height={400}
          className="rounded-lg"
        />
        <h2 className="text-4xl font-bold text-gray-800">
          Welcome to UF CrowdView
        </h2>
        <p className="text-lg text-gray-600 text-center">
          This project aims to make campus life smoother by helping students
          decide where to go based on current crowd levels.
        </p>
        <Link href="/signup">
          <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  );
}
