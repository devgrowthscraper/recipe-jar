import { Link } from "wouter";
import { ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center mx-auto mb-6">
          <ChefHat className="w-10 h-10 text-orange-300" />
        </div>
        <h1 className="text-4xl font-bold text-amber-900 mb-2">404</h1>
        <p className="text-neutral-500 mb-6">Page not found. This recipe doesn't exist.</p>
        <Link href="/">
          <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl px-6 font-semibold">
            Back to Feed
          </Button>
        </Link>
      </div>
    </div>
  );
}
