import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import SplashScreen from "@/pages/SplashScreen";
import Onboarding from "@/pages/Onboarding";
import PhoneInput from "@/pages/PhoneInput";
import OTPVerify from "@/pages/OTPVerify";
import ChatScreen from "@/pages/ChatScreen";
import QueueStatus from "@/pages/QueueStatus";
import Profile from "@/pages/Profile";
import SuccessScreen from "@/pages/SuccessScreen";
import ClinicSetup from "@/pages/ClinicSetup";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import PageLoader from "@/components/PageLoader";
import HeroSection from "@/components/HeroSection";
import IntroSection from "@/components/IntroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FeaturesSection from "@/components/FeaturesSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ClinicDiscovery from "@/pages/ClinicDiscovery";
import ProfileSetup from "@/pages/ProfileSetup";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function LandingPage() {
  return (
    <>
      <div className="grain-overlay" />
      <PageLoader />
      <Navbar />
      <main>
        <HeroSection />
        <IntroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/for-clinics" component={ClinicSetup} />
      <Route path="/app" component={SplashScreen} />
      <Route path="/app/onboarding" component={Onboarding} />
      <Route path="/app/discovery" component={ClinicDiscovery} />
      <Route path="/app/profile-setup" component={ProfileSetup} />
      <Route path="/app/phone" component={PhoneInput} />
      <Route path="/app/otp" component={OTPVerify} />
      <Route path="/app/chat">
        <ProtectedRoute>
          <ChatScreen />
        </ProtectedRoute>
      </Route>
      <Route path="/app/queue">
        <ProtectedRoute>
          <QueueStatus />
        </ProtectedRoute>
      </Route>
      <Route path="/app/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      <Route path="/app/success">
        <ProtectedRoute>
          <SuccessScreen />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

import { LanguageProvider } from "@/contexts/LanguageContext";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <WouterRouter>
            <Router />
          </WouterRouter>
          <Toaster />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;