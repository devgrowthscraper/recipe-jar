import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import FeedPage from "@/pages/feed";
import RecipesPage from "@/pages/recipes";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import RecipeDetailPage from "@/pages/recipe-detail";
import AddRecipePage from "@/pages/add-recipe";
import EditRecipePage from "@/pages/edit-recipe";
import ProfilePage from "@/pages/profile";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={FeedPage} />
      <Route path="/recipes" component={RecipesPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/recipe/:id" component={RecipeDetailPage} />
      <Route path="/add-recipe" component={AddRecipePage} />
      <Route path="/edit-recipe/:id" component={EditRecipePage} />
      <Route path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Layout() {
  const [location] = useLocation();
  return (
    <div className="min-h-screen bg-background">
      <ScrollToTop />
      <Navbar />
      <main key={location} className="animate-in fade-in duration-150">
        <Router />
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Layout />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
