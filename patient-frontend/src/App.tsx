import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import SplashScreen from "@/pages/SplashScreen";
import Onboarding from "@/pages/Onboarding";
import PhoneInput from "@/pages/PhoneInput";
import OTPVerify from "@/pages/OTPVerify";
import ChatScreen from "@/pages/ChatScreen";
import QueueStatus from "@/pages/QueueStatus";
import Profile from "@/pages/Profile";
import SuccessScreen from "@/pages/SuccessScreen";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={SplashScreen} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/phone" component={PhoneInput} />
      <Route path="/otp" component={OTPVerify} />
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
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

