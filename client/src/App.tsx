import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { QuizProvider } from "@/context/QuizContext";
import Home from "@/pages/Home";
import AdminLogin from "@/pages/AdminLogin";
import { RegistrationForm } from "@/components/quiz/RegistrationForm";
import { QuizInterface } from "@/components/quiz/QuizInterface";
import { QuizCompletion } from "@/components/quiz/QuizCompletion";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";

function Router() {
  const [location] = useLocation();

  // Handle hash-based routing for quiz flow
  const [page, setPage] = useState(window.location.hash.slice(1) || "home");

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      setPage(hash || "home");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Check if we're in a quiz flow based on hash
  const hash = window.location.hash.slice(1);
  console.log("current hash", hash);
  if (hash === "register") {
    return <RegistrationForm />;
  }

  if (hash === "quiz") {
    return <QuizInterface />;
  }

  if (hash === "complete") {
    return <QuizCompletion />;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Register service worker for PWA
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    }

    // Prevent zooming and other kiosk-unfriendly behaviors
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const handleGestureStart = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("gesturestart", handleGestureStart);

    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("gesturestart", handleGestureStart);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <QuizProvider>
            <Toaster />
            <Router />
          </QuizProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
