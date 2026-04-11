import { Link } from "wouter";
import { LogIn, UserPlus, Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AuthModal({ open, onClose }: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl" data-testid="modal-auth">
        <DialogHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Heart className="w-8 h-8 text-amber-500" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-amber-900">
            Sign in to save recipes you love
          </DialogTitle>
          <DialogDescription className="text-neutral-500 leading-relaxed">
            Create an account or sign in to like, save, and share your favorite recipes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-2">
          <Link href="/login" onClick={onClose}>
            <Button
              data-testid="button-modal-login"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl py-3 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Log In
            </Button>
          </Link>
          <Link href="/signup" onClick={onClose}>
            <Button
              data-testid="button-modal-signup"
              variant="outline"
              className="w-full rounded-xl py-3 text-sm font-semibold border-amber-200 text-amber-700 hover:bg-amber-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
