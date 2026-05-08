import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import SplashScreen from "@/pages/SplashScreen";
import Onboarding from "@/pages/Onboarding";
import ClinicRegistry from "@/pages/ClinicRegistry";
import PhoneInput from "@/pages/PhoneInput";
import OTPVerify from "@/pages/OTPVerify";
import ProfileSetup from "@/pages/ProfileSetup";
import ChatScreen from "@/pages/ChatScreen";
import QueueStatus from "@/pages/QueueStatus";
import Profile from "@/pages/Profile";
import SuccessScreen from "@/pages/SuccessScreen";
import ProtectedRoute from "@/components/ProtectedRoute";

import ClinicSetup from "@/pages/ClinicSetup";
import Navbar from "@/components/Navbar";
import PageLoader from "@/components/PageLoader";
import HeroSection from "@/components/HeroSection";
import IntroSection from "@/components/IntroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FeaturesSection from "@/components/FeaturesSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/contexts/LanguageContext";

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

function PatientApp() {
  return (
    <WouterRouter base="/app">
      <Switch>
        <Route path="/" component={SplashScreen} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/registry" component={ClinicRegistry} />
        <Route path="/phone" component={PhoneInput} />
        <Route path="/otp" component={OTPVerify} />
        <Route path="/profile-setup">
          <ProtectedRoute>
            <ProfileSetup />
          </ProtectedRoute>
        </Route>
        <Route path="/chat">
          <ProtectedRoute>
            <ChatScreen />
          </ProtectedRoute>
        </Route>
        <Route path="/queue">
          <ProtectedRoute>
            <QueueStatus />
          </ProtectedRoute>
        </Route>
        <Route path="/profile">
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        </Route>
        <Route path="/success">
          <ProtectedRoute>
            <SuccessScreen />
          </ProtectedRoute>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function MainRouter() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/for-clinics" component={ClinicSetup} />
      <Route path="/app/*" component={PatientApp} />
      <Route path="/app" component={PatientApp} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <MainRouter />
          </WouterRouter>
          <Toaster />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

