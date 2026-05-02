import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse } from "lucide-react";

export default function SplashScreen() {
  const [_, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        const hasToken = localStorage.getItem("tabib_token");
        if (hasToken) {
          setLocation("/chat");
        } else {
          setLocation("/onboarding");
        }
      }, 300); // Wait for fade out
    }, 2000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex h-screen-safe w-full flex-col items-center justify-center bg-primary"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex flex-col items-center gap-4 text-white"
          >
            <div className="rounded-full bg-white/20 p-6">
              <HeartPulse className="h-16 w-16" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">طبيب</h1>
            <p className="text-primary-foreground/80 font-medium">مساعدك الطبي الموثوق</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
