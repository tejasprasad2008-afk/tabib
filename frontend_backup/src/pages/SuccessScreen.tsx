import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, PhoneCall } from "lucide-react";

export default function SuccessScreen() {
  const [_, setLocation] = useLocation();

  const handleReturn = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    setLocation("/app/chat");
  };

  return (
    <div className="flex h-screen-safe w-full flex-col bg-primary text-white items-center justify-center p-6 relative overflow-hidden">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="flex flex-col items-center text-center z-10 w-full max-w-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
          className="mb-8 rounded-full bg-white/20 p-6"
        >
          <CheckCircle2 className="h-20 w-20 text-white" />
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-4 text-4xl font-extrabold tracking-tight"
        >
          تم إعلام العيادة بنجاح
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/90 text-lg mb-10 leading-relaxed font-bold"
        >
          سيتصل بك أحد أفراد الفريق الطبي قريباً لمتابعة حالتك
        </motion.p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full bg-white/20 rounded-lg p-4 flex items-center justify-center gap-3 mb-10"
        >
          <PhoneCall className="w-5 h-5 text-white" />
          <span className="font-bold text-lg" dir="ltr">+971-04-123-4567</span>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full"
        >
          <Button 
            size="lg" 
            onClick={handleReturn} 
            className="w-full min-h-[56px] text-lg font-bold rounded-lg bg-white text-primary hover:bg-gray-100 transition-all duration-200 hover:scale-105"
          >
            العودة إلى المحادثة
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}