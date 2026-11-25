import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router as WouterRouter } from "wouter";
import { useBrowserLocation } from "wouter/use-browser-location";
import { ConsentProvider } from "./services/consent";
import { ExternalServices } from "./services/ExternalServices";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Research from "./pages/Research";
import Team from "./pages/Team";
import Publications from "./pages/Publications";
import News from "./pages/News";
import Gallery from "./pages/Gallery";
import AboutDi from "./pages/AboutDi";
import { LanguageProvider } from "./contexts/LanguageContext";
function useCanonicalLocation() {
  const [location, navigate] = useBrowserLocation();
  return [location.replace(/\/+$/, "") || "/", navigate] as ReturnType<typeof useBrowserLocation>;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path={"/"} component={Home} />
          <Route path={"/research"} component={Research} />
          <Route path={"/team"} component={Team} />
          <Route path={"/publications"} component={Publications} />
          <Route path={"/news"} component={News} />
          <Route path={"/gallery"} component={Gallery} />
          <Route path={"/about-di"} component={AboutDi} />
          <Route path={"/404"} component={NotFound} />
          {/* Final fallback route */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")} hook={useCanonicalLocation}>
        <LanguageProvider>
          <ConsentProvider>
          <TooltipProvider>
            <Toaster />
            <ExternalServices />
            <Router />
          </TooltipProvider>
        </ConsentProvider>
        </LanguageProvider>
        </WouterRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
