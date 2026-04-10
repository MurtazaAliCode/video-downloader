import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AdSocialBar } from "@/components/layout/AdSlots";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Processing from "@/pages/processing";
import BlogIndex from "@/pages/blog/index";
import BlogPost from "@/pages/blog/post";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Report from "@/pages/report";
import DMCA from "@/pages/dmca";
import CookiePolicy from "@/pages/cookie-policy";
import Disclaimer from "@/pages/disclaimer";
import FeatureRequests from "@/pages/feature-requests";
import Status from "@/pages/status";
import Compression from "@/pages/features/compression";
import Conversion from "@/pages/features/conversion";
import Trimming from "@/pages/features/trimming";
import Audio from "@/pages/features/audio";
import Watermarks from "@/pages/features/watermarks";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/processing/:jobId" component={Processing} />
      <Route path="/blog" component={BlogIndex} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/report" component={Report} />
      <Route path="/dmca" component={DMCA} />
      <Route path="/cookie-policy" component={CookiePolicy} />
      <Route path="/disclaimer" component={Disclaimer} />
      <Route path="/feature-requests" component={FeatureRequests} />
      <Route path="/status" component={Status} />
      <Route path="/features/compression" component={Compression} />
      <Route path="/features/conversion" component={Conversion} />
      <Route path="/features/trimming" component={Trimming} />
      <Route path="/features/audio" component={Audio} />
      <Route path="/features/watermarks" component={Watermarks} />
      <Route component={NotFound} />
    </Switch>
  );
}

function GlobalAds() {
  const [location] = useLocation();
  // Don't show Social Bar on Home page
  if (location === "/") return null;
  return <AdSocialBar />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <GlobalAds />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
