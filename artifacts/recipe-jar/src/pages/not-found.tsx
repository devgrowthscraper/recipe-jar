import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {/* Illustration-style icon stack */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 rounded-3xl bg-orange-100 rotate-6" />
          <div className="absolute inset-0 rounded-3xl bg-amber-100 -rotate-3" />
          <div className="absolute inset-0 rounded-3xl bg-orange-50 flex items-center justify-center">
            <span className="text-6xl select-none">🫙</span>
          </div>
        </div>

        <p className="text-7xl font-black text-orange-100 leading-none mb-2 select-none">404</p>
        <h1 className="text-2xl font-bold text-amber-900 mb-2">
          This recipe doesn't exist
        </h1>
        <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
          The page you're looking for may have been moved, deleted, or never
          existed in the first place.
        </p>
        <Link href="/">
          <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl px-8 py-3 font-semibold shadow-lg shadow-orange-100 transition-all duration-200 hover:scale-105">
            Back to Feed
          </Button>
        </Link>
      </div>
    </div>
  );
}
